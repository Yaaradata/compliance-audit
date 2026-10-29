# UK Risk Board View — Stage 1 Merged Corpus

**Merge date:** 27 October 2026
**File:** UKRISK-stage1-merged-27Oct2026.md
**Inputs merged:**
- GP (ChatGPT) — `chatgpt.md`;
- OP (Claude) — the Stage 0 research report produced in this thread;
- GM (Gemini) — `gemini.docx`.
**Missing input:** PX (Perplexity). The convergence scale is therefore `[3-source]`, `[2-source]` and `[single]`. No finding can be `[4-source]`. If a PX file is added later, every convergence tag must be recomputed.

## Merge basis and decisions applied

The merge was run end to end without stopping at the intermediate gates, at the user's request. These defaults from the Step 1a inventory apply throughout:

1. **Three engines only.** OP is taken from the in-thread report, not a separately saved file. If the saved `UKRISK-stage0-OP-27Oct2026.md` differs, re-run the affected sections.
2. **Untraceable citations are kept, not dropped.**
   - GP's internal citation tokens (for example `turn0search2`) and GM's unnumbered inline markers (for example "…appetite1", "…VREQ6") are recorded as they appear and tagged `[ref-incomplete]`.
   - When conflicts are judged against the source hierarchy, a finding supported only by such a token or marker counts as unsourced.
   - Where the engine also named a title, publisher, URL or date in the text, that named source is recorded and used.
3. **GM findings are split.** GM's long multi-claim findings are split into atomic sub-findings with suffixes (for example A-GM-04a, A-GM-04b), each keeping its parent ID.
4. **Named individuals.** Names are kept only where they appear as subjects of public enforcement notices or as named public executives quoted in public sources. Names of commentators and vendor founders are removed and replaced with a role description. No private or call-derived information appears.
5. **No new research.** Every fact below comes from one of the three files. Where an engine's figure or date could not be checked inside the merge, it is carried as stated and listed in M-G.

## Tag legend

| Tag | Meaning |
|---|---|
| `[3-source]` / `[2-source]` / `[single]` | Convergence, recomputed in this merge across GP, OP and GM |
| `[near-dup]` | Close to another merged finding but differs in claim, scope, date or source, so kept separate |
| `[conflict]` | Engines disagree inside this finding (see the M-C conflict register, IDs CF-NN) |
| `[unresolved-conflict]` | The disagreement cannot be settled by the source hierarchy |
| `[practice-not-rule]` | Common practice, not a regulatory requirement |
| `[inference]` | Engine or panel reasoning, not a sourced fact |
| `[marketing-grade]` | Vendor or vendor-adjacent claim |
| `[unverified]` | The engine itself could not check it, or the merge flags it as needing primary-source checking |
| `[ref-incomplete]` | The citation is a non-resolvable token, an unmapped marker, or garbled text |
| `[scope]` | Outside the stated scope (non-deposit-taker, or older than five years) |

Source hierarchy used to judge conflicts, strongest first:
1. regulator and standard-setter texts;
2. firm annual reports and Pillar 3 disclosures;
3. industry bodies;
4. trade press;
5. vendor material.

---

# M-A — Inventory (final)

| | **GP (ChatGPT)** | **OP (Claude)** | **GM (Gemini)** | **PX (Perplexity)** |
|---|---|---|---|---|
| **Text used** | `chatgpt.md` | In-thread Stage 0 report | `gemini.docx`, 572 lines including 88 works-cited entries | Not supplied |
| **Engine tag on line 1** | Yes | Yes | Yes, inside the H1 heading | — |
| **Sections present** | A–K plus all five synthesis parts | A–K, all five synthesis parts, TL;DR, caveats | A–K plus all five synthesis parts | — |
| **Truncation** | None | Tool marked the report "truncated"; text runs to the caveats | None; symbols lost in export | Whole file missing |
| **Findings A / B / C / D / E** | 7 / 11 / 7 / 7 / 4 | 11 / 3 (table of 11 firm rows) / 9 / 5 / 4 | 5 / 2 (table of 9 rows) / 2 / 4 / 3 | — |
| **Findings F / G / H / I / J / K** | 4 / 5 / 9 / 11 / 7 / 7 | 5 / 3 / 9 / 10 / 6 / 7 (no IDs) | 2 / 2 / 1 (table of 5 rows) / 4 / 4 / 7 (no IDs) | — |
| **Total findings** | 79 | 72 | 36 parent IDs, split into 74 atomic sub-findings for this merge | — |
| **Sources** | About 70 internal tokens; about 35 sources written out in text with title, URL or date | 99 in source list; about 50 cited inline with URL | 88 works-cited entries; inline markers not mappable | — |
| **Main quality problems** | Untraceable tokens; tags outside the scheme (`[confirmed]`, `[partly-supported]`); thin competitor sourcing; B-GP-07 has no source | Section B counts, competitors and EU/US positions unverified; H-OP-06 to H-OP-08 cells blank; some rule details from panel knowledge | Unmapped references; heavy secondary and vendor sourcing; symbols lost; verdict inflation in K; rule references needing checks; scope drift; grouped rows | — |

Atomic sub-finding counts for GM after splitting: A 16, B 12, C 9, D 9, E 6, F 6, G 6, H 6, I 10, J 9, K 7.

---

# M-B — Merged body

## A — Risk appetite framework architecture

### M-A-01 — The risk appetite framework runs from strategy, through the risk appetite statement, to limits

- **Source IDs:** A-OP-01, A-GP-01, A-GM-01a
- **Convergence:** `[3-source]`
- **Tags:** none (standard-setter text)
- **Finding:** The FSB's 2013 principles set the order a board-facing product should reproduce:
  - the firm pursues business objectives and strategy, subject to risk capacity;
  - the board states its aggregate appetite in a risk appetite statement (RAS);
  - appetite is translated into limits on legal entities, business lines, risk categories and concentrations.
  The risk appetite framework (RAF) is the set of policies, processes, controls, systems and governance that establishes, communicates and monitors that appetite. UK supervisory material follows the same order: boards set strategy and appetite, and management operates within them.
- **Evidence and citations:**
  - **OP:**
    - The RAF is the "systems through which risk appetite is established, communicated, and monitored", including the RAS, risk limits, and roles and responsibilities.
    - The RAS "should be linked to the firm's short- and long-term strategic, capital and financial plans, as well as compensation programmes".
    - It uses "quantitative limits and qualitative statements for risks that are difficult to measure".
    - Source: FSB, *Principles for an Effective Risk Appetite Framework*, https://www.fsb.org/uploads/r_131118.pdf, 18 November 2013.
  - **GP:**
    - FSB, same principles (18 November 2013), https://www.fsb.org/2013/11/r_131118/.
    - PRA/Bank of England, *Regulatory expectations*, new bank start-up unit, 02 February 2026, https://www.bankofengland.co.uk/prudential-regulation/new-bank-start-up-unit/regulatory-expectations.
    - Nationwide, *Annual Report and Accounts 2026*, 20 May 2026: board-approved appetite sets "the level of risk which is acceptable in the delivery of the Group's strategy", supported by metrics, limits and triggers.
    - Leeds Building Society, *Annual Report and Accounts 2025*, 26 February 2026: its Strategic Risk Appetite (SRA) contains qualitative statements and quantitative metrics defining the parameters for delivering strategy, and those metrics feed corporate planning and stress testing.
    - GP tokens: turn0search2, turn15search4, turn21view0, turn22view0, turn23view1 `[ref-incomplete]`.
  - **GM:**
    - Within the overarching enterprise risk management framework (ERMF) or risk management framework (RMF), the RAF sets, communicates and monitors the RAS. The RAS is the board-approved document holding qualitative statements of motivation for taking or avoiding risk, and quantitative measures.
    - Sources: FSB, 18 November 2013; Nationwide Sub-Group *Pillar 3 Disclosures 2025* (28 May 2025).
    - GM marker 1 `[ref-incomplete]`.
- **Product implication:** Make strategy the first object in the data model, with risk capacity, appetite, limits and current profile as linked objects beneath it. Strategy should not be a decorative field added above a risk register.
- **Panel disagreement:** None on the architecture itself.

### M-A-02 — UK terms in use, and what each contains

- **Source IDs:** A-OP-02, A-GP-03, A-GM-01 (introduction), A-GM-01a
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]` for RCSA, the risk and control matrix (RCM) and key control indicators (KCIs)
- **Finding:** UK firms use a consistent set of terms, but each does a different job and they should not be collapsed into one object.

| Term | What it is | Engines |
|---|---|---|
| RMF or ERMF | The wider operating system: risk taxonomy, policies, governance committees, the three lines | OP, GP, GM |
| RAF | Governance and process for setting, cascading and monitoring appetite | OP, GP, GM |
| RAS (Leeds calls it the SRA) | The board's statement of appetite, both qualitative and quantitative | OP, GP, GM |
| Level 1 (principal) risks and sub-categories | The top of the taxonomy (Starling's term) | OP |
| KRI | A monitored indicator with thresholds | OP, GP, GM |
| KCI | An indicator of how well a control is performing | GM |
| Limit and trigger | Hard boundary, and early-warning point | GP, GM |
| RCSA | Bottom-up first-line self-assessment of inherent risk, controls and residual risk | OP, GP, GM |
| Risk and control matrix | Maps each risk to its causes, controls, evidence, tests and owners | OP, GP, GM |

- **Evidence and citations:**
  - **OP:**
    - Coventry Building Society *Annual Report and Accounts 2022* defines its ERMF as "risk strategy; risk appetite; governance and control", https://www.coventrybuildingsociety.co.uk/content/dam/cbs/member/pdfs/financial-results/2022/annual-report-and-accounts-2022.pdf.
    - Starling *Pillar 3 2025* uses "Level 1 risks" with "a risk appetite statement for each of the identified sub-categories" and "a series of risk appetite limits and key risk indicators", https://www.starlingbank.com/docs/annual-reports/Pillar3-2025.pdf.
    - OSB Group *ARA 2024*: "Risk appetite metrics and thresholds are set at both individual entity and Group levels", https://www.osb.co.uk/media/gbujhlan/osbg-2024-ara.pdf.
  - **GP:**
    - FSB formally defines RAF, RAS and limits; Leeds and Nationwide show appetite sitting within a wider RMF (FSB, 18 November 2013; Nationwide, 20 May 2026; Leeds, 26 February 2026).
    - GP tokens: turn0search2, turn21view0, turn23view1 `[ref-incomplete]`.
  - **GM:**
    - RCSAs, often housed in an RCM, evaluate inherent risk, control effectiveness and residual risk against board-approved tolerances.
    - Sources: Protecht Academy UK, *Risk and Control Self Assessment*, https://www.protechtgroup.com/en-gb/academy/risk-and-control-self-assessment.
    - GM markers 1 and 3 `[ref-incomplete]`.
- **Product implication:**
  - Use a configurable taxonomy, not a fixed list of nine domains.
  - Preserve the whole lineage, but show each governance layer only the level it can act on.
- **Panel disagreement:**
  - GP: the CRO and first-line member want drill-through access to the RCSA, while the NED wants the board page kept at strategy, appetite and exceptions. GP's resolution is that control detail should be "one click down rather than one level up".
  - GM: the NED says the board should never see raw Level 3 RCSA outputs unless a systemic control failure threatens a Level 1 boundary.

### M-A-03 — The "Level 1/2/3" hierarchy is industry practice, not a regulatory term

- **Source IDs:** A-GP-02, A-GM-01b, A-OP-02 (usage evidence)
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`, `[conflict]` (minor; see CF-01)
- **Finding:** None of the three engines found a regulatory definition of Level 1, 2 and 3 appetite metrics. The hierarchy is used in practice and should be marketed as a practical architecture, not as a PRA or FCA requirement.
- **Evidence and citations:**
  - **GP:** "A universal regulatory definition of 'Level 1, Level 2 and Level 3 appetite metrics' was not found." GP offers this practical taxonomy:

| Layer | Practical UK interpretation (GP) |
|---|---|
| Board / Level 1 | A small set of enterprise or principal-risk appetite statements and primary metrics that constrain strategy |
| Executive / Level 2 | Limits and leading indicators by risk type, business line, product, portfolio or legal entity, allocating the board appetite |
| Operational / Level 3 | KRIs, KPIs, tolerances and exceptions at process, journey, desk, model or control level, giving early warning before higher limits fail |
| Controls | Preventive and detective controls, policy requirements, RCSAs, testing and remediation that keep the Level 3 profile inside appetite |
| Assurance | Second-line challenge and third-line independent assurance that the chain is designed correctly and operating |

    GP's evidence for the substance of the cascade:
    - Leeds Building Society, 26 February 2026: the first line defines and adheres to appetite; the second line co-ordinates appetite and policy; the third line independently assures both.
    - Leeds' SRA spans eight principal risks and is reinforced by policies and standards.
    - GP token: turn23view1 `[ref-incomplete]`.
  - **GM:**
    - The quantitative measures cascade into three tiers:
      - Level 1 (Board): aggregate enterprise limits, for example CET1, LCR, maximum credit loss tolerance;
      - Level 2 (Executive or sub-risk): business-line, entity or sub-risk metrics overseen by the Executive Risk Committee, for example buy-to-let LTV concentration or sanctions screening timeliness;
      - Level 3 (Operational or business unit): KRIs and KCIs embedded in first-line RCSAs and RCMs.
    - The regulatory adviser says the FSB principles and the PRA Rulebook ("Internal Capital Adequacy Assessment (ICAA) 3.1 and General Organisational Requirements 2.1") mandate an articulated appetite and limits cascaded across business lines, but the Level 1/2/3 naming is "universal UK industry practice rather than a statutory rule".
    - GM marker 1 `[ref-incomplete]`; the PRA Rulebook references are `[unverified]`.
  - **OP:** Starling's Pillar 3 2025 uses the term "Level 1 risks". This is evidence that the terminology is in use (see M-A-02).
- **Product implication:**
  - Support configurable tier names; do not hard-code "L1/L2/L3" as if the regulator defined them.
  - Enforce a relational model (GM's four tiers: Strategy, then qualitative RAS statement, then L1/L2/L3 quantitative metrics, then RCSA controls) with automated roll-up logic, rather than flat control lists. (GM's product implication shows a garbled symbol between the tiers, recorded as "Strategy  RAS Qualitative Statement  L1/L2/L3" `[ref-incomplete]`.)
- **Panel disagreement:** GM calls the hierarchy "universal" practice; GP found no universal definition. Both agree it is not a rule.

### M-A-04 — Thresholds are nested: capacity, then appetite, then trigger, then operating limit

- **Source IDs:** A-OP-03, A-GM-02b, A-GP-04 (bands)
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`; OP's evidence is `[single]` at source level
- **Finding:**
  - Limits sit inside appetite, and appetite sits inside capacity, with a buffer between them.
  - In practice:
    - red marks the board limit;
    - amber is an early-warning trigger set inside red;
    - day-to-day operating limits sit well inside appetite.
  - Breaches at Level 3 should roll up.
- **Evidence and citations:**
  - **OP:**
    - Banks told the FSB there should be "a sufficient buffer between risk appetite and risk [capacity]… day-to-day limits should be set such that they remain well within the risk appetite".
    - Source: Tapestry Networks submission to the FSB, https://www.fsb.org/uploads/c_131011ad.pdf, October 2013.
  - **GM:**
    - Thresholds are calibrated using red, amber and green zones, where amber (the trigger or early-warning indicator) is set inside red (the hard board limit).
    - Sources: Protecht UK, *Risk Appetite in Action* (26 February 2025), https://www.protechtgroup.com/en-gb/knowledge-hub; Nationwide *Pillar 3 2025*.
    - GM marker 1 `[ref-incomplete]`.
  - **GP:**
    - Recommends a green operating range, an amber early-warning range requiring corrective action, forecast and named ownership, and a red limit or breach state requiring formal escalation and possibly a reportability assessment `[practice-not-rule]`.
    - Supporting sources: FSB, 18 November 2013; Nationwide, 20 May 2026; Leeds, 26 February 2026.
- **Product implication:** Order thresholds as capacity, appetite (red), trigger (amber), then operating limit. Breaches at Level 3 should roll up automatically.
- **Panel disagreement:** None on the nesting.

### M-A-05 — Rolling non-financial Level 3 metrics up to Level 1 is the hardest design problem

- **Source IDs:** A-GM-01c
- **Convergence:** `[single]`
- **Tags:** `[inference]`
- **Finding:** GM's CRO says the mathematical and logical aggregation from Level 3 to Level 1 is the hardest engineering problem in risk design, especially for non-financial risks, where metrics cannot simply be summed like credit exposures.
- **Evidence and citations:**
  - Panel view; GM marker 2 `[ref-incomplete]`.
  - The works-cited list includes *Articulating Operational Risk Appetite* (Scribd), https://www.scribd.com/document/773250880/37-Articulating-Operational-Risk-appetite. It is not known whether this is the source behind marker 2.
- **Product implication:** Roll-up logic for non-financial risks needs explicit mapping rules (weights, worst-of or count-of-breaches). These rules need design input from practitioners and should not be assumed.
- **Panel disagreement:** GM's first-line owner says Level 3 indicators often fail in practice because second-line teams design theoretical KRIs that do not map to live operational workflow queues.

### M-A-06 — Zero-tolerance appetite needs a measurable proxy, not a literal zero threshold

- **Source IDs:** A-OP-04, A-GP-04, A-GM-02a
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`; GM's claim that regulators reject literal zero thresholds is `[unverified]`
- **Finding:**
  - Firms use "no appetite" statements for risks they take no reward from, for example:
    - deliberate sanctions breaches;
    - misleading regulators;
    - internal fraud;
    - material Consumer Duty misconduct.
  - All three engines say such a statement must not be read as a forecast that no incident can occur.
  - All three say it needs a measurable proxy, such as coverage, completeness or a pragmatic trigger.
- **Evidence and citations:**
  - **OP:**
    - Coventry: "The Group has no appetite for any breach." Coventry *Interim Financial Report H1 2025*, https://www.coventrybuildingsociety.co.uk/content/dam/cbs/member/pdfs/financial-results/2025/2025-Interim-Financial-Report.pdf.
    - OSB constrains solvency appetite "within the leverage ratio" and has "very low appetite" for reputational risk.
    - CRO view: a zero statement needs a measurable proxy. Starling's sanctions screening covered only "a fraction of the names on the Consolidated List" from 2017 to January 2023, so a "zero breaches" statement alone would not have caught the gap.
  - **GP:**
    - A "zero/no-intentional-tolerance statement" for deliberate sanctions breaches, knowingly misleading regulators, internal fraud or material Consumer Duty misconduct "should not be represented as a prediction that no incident can ever occur" `[practice-not-rule]`.
  - **GM:**
    - UK regulators and mature CROs reject literal zero numerical thresholds for operational and financial crime metrics, because operational errors are statistically inevitable and a literal zero keeps the board permanently in red.
    - Mature firms pair a qualitative "zero appetite for deliberate regulatory breach" with pragmatic triggers, for example zero overdue high-risk audit actions or a 99.5% SLA threshold.
    - GM markers 2 and 11 `[ref-incomplete]`. No regulator text is cited for "regulators reject" `[unverified]`.
- **Product implication:** For every zero-tolerance statement, require a coverage or completeness proxy, for example screening-list coverage or the share of records reconciled.
- **Panel disagreement:** None on the substance. GM attributes the position to regulators without a regulatory source; OP and GP present it as practice.

### M-A-07 — How amber and red thresholds are set, and why lower tiers get wider amber bands

- **Source IDs:** A-OP-05, A-GP-04, A-GM-02c
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`, `[inference]`
- **Finding:**
  - No UK rule sets a formula for amber and red thresholds.
  - All three engines support giving lower-tier metrics wider amber bands, so that a deteriorating trend triggers a Level 3 or Level 2 amber well before the Level 1 red.
  - GP adds that the width should come from lead time, volatility, control response time and the statistical link between lower- and upper-tier indicators, not an arbitrary percentage.
- **Evidence and citations:**
  - **OP:**
    - In practice, red sits at the board limit and amber is an early-warning trigger set from volatility, stress results or time to remediate.
    - The FCA's outcomes monitoring review (27 July 2026) praised board reporting "throughout the year… with… defined tolerance levels".
    - Source: CMS, https://cms.law/en/gbr/legal-updates/fca-review-consumer-duty-outcomes-monitoring-good-practice-and-areas-for-improvement, 2026.
  - **GP:** "If operational indicators only go amber immediately before the board metric turns red, they provide no early warning." `[inference]`
  - **GM:**
    - Level 2 and Level 3 metrics get progressively wider amber bands, and tighter red thresholds relative to the board limit, than Level 1 metrics.
    - The regulatory adviser says that under PRA SS31/15 (ICAAP and SREP) and SS24/15 (liquidity and funding supervision), the PRA expects early-warning indicators and recovery triggers to be calibrated well ahead of regulatory minima.
    - GM markers 2 and 14 `[ref-incomplete]`; the SS31/15 and SS24/15 attributions are `[unverified]`.
- **Product implication:**
  - Store the calibration rationale for each threshold.
  - Capture response time, escalation action, owner and the upstream metric affected (GP).
  - Flag amber bands narrower than the metric's normal volatility (OP).
  - Add velocity-of-change alerts that flag rapid movement toward a threshold while the metric is still green (GM).
- **Panel disagreement:** GM's first-line owner warns that over-wide, over-sensitive Level 3 amber bands cause "amber fatigue", with bureaucratic remediation plans for normal seasonal spikes. GM's CRO argues that without these buffers, high-velocity risks such as digital deposit outflows or automated onboarding failures will breach Level 1 before management can meet.

### M-A-08 — There is no regulatory cap on the number of board-level appetite metrics

- **Source IDs:** A-OP-06, A-GP-05, A-GM-03
- **Convergence:** `[3-source]` that no regulatory cap exists
- **Tags:** `[practice-not-rule]`, `[conflict]` on the size of the full Level 1 suite (see CF-02)
- **Finding:**
  - No PRA, FCA or FSB text sets a number.
  - All three engines distinguish principal risk categories (single digits to low double digits) from the metrics beneath them.
  - Estimates of the full Level 1 suite differ:
    - OP infers roughly 10–30 Level 1 metrics;
    - GM says 25–45, with 10–15 headline indicators on the board cover page;
    - GP gives no total and recommends 8–15 "primary" indicators with unlimited subordinate measures.
- **Evidence and citations:**
  - **OP:**
    - The FSB wants a RAS that is "easy to communicate".
    - A consultation respondent warned that high-level statements "may be too generic to be actionable". Source: FSB consultation response, https://www.fsb.org/uploads/c_131011i.pdf, October 2013.
    - UK firms disclose 7–10 principal risks, which implies roughly 10–30 Level 1 metrics `[inference]`.
  - **GP:**
    - Principal risk counts: Nationwide 8 (20 May 2026); Leeds 8 (26 February 2026); Metro 11 (15 April 2026), https://www.metrobankonline.co.uk/globalassets/documents/investor_documents/metro-bank---annual-report-2025.pdf.
    - Design principle: "few primary decision metrics, unlimited traceable subordinate measures".
  - **GM:**
    - Boards define 6–12 principal risk categories, and each needs 2–5 Level 1 metrics. Capital alone needs CET1, total capital and the UK leverage ratio; liquidity needs LCR, NSFR and a wholesale funding limit.
    - So the full suite is typically 25–45 metrics, with 10–15 headline indicators on the board pack cover.
    - Sources: RiskPublishing, *Best Key Risk Indicators* (citing Deloitte board research) (2024), https://riskpublishing.com/best-key-risk-indicators/; Leeds Building Society *Annual Report and Accounts 2025* (06 March 2026).
    - GM markers 5, 7 and 20 `[ref-incomplete]`.
- **Product implication:**
  - Separate a "Board strategic summary" view (configurable, default about 10–12 headline indicators plus active breaches) from a "Full Board RAS schedule" view.
  - Allow the board to designate primary indicators without implying the rest are second class.
- **Panel disagreement:**
  - OP: the NED prefers about 12; the CRO prefers 12–15 with drill-down.
  - GP: the NED supports a small primary set; the CRO objects to making 10–12 a doctrine.
  - GM: the NED endorses 10–12 for the cover dashboard. The CRO says the board is "legally required by the PRA and FCA to approve the full Level 1 limit suite across all principal risks annually", so the formal schedule holds 30+ limits. This "legally required" claim has no cited rule `[unverified]`.

### M-A-09 — Strategy is linked to the RAS through planning, stress testing and the ICAAP/ILAAP cycle

- **Source IDs:** A-OP-07, A-GP-01 (Leeds), A-GM-04a
- **Convergence:** `[3-source]`
- **Tags:** none for the firm-disclosure facts; `[inference]` for the mechanism
- **Finding:** Firms link strategy to appetite through the annual planning, stress testing and ICAAP/ILAAP cycle. Growth plans require appetite limits to be recalibrated. Public evidence comes from Nationwide, Leeds, Metro and Skipton.
- **Evidence and citations:**
  - **OP:**
    - Nationwide's principal risks "are explored fully within the annual financial planning and stress testing framework". On new business banking and cards: "Whilst we remain within risk appetite, these risks will be assessed further." Nationwide *ARA 2025*, https://www.nationwide.co.uk/-/assets/nationwidecouk/documents/about/how-we-are-run/results-and-accounts/2024-2025/annual-report-and-accounts-2025.pdf.
    - Metro maps strategic pillars to principal risks.
    - Skipton assigns business risk to "The Board".
  - **GP:** Leeds SRA metrics feed corporate planning and stress testing (Leeds, 26 February 2026). GP tokens: turn22view0, turn23view1 `[ref-incomplete]`.
  - **GM:**
    - Under the FSB principles and Institute of Risk Management guidance, appetite acts both as an accelerator ("evaluating opportunities for appropriate risk-taking") and as "a defence against excessive risk-taking".
    - The link is made in the annual corporate planning and ICAAP/ILAAP cycle.
    - GM marker 2 `[ref-incomplete]`. The works-cited list includes *Irm Risk Appetite* (Slideshare), https://www.slideshare.net/slideshow/irm-risk-appetite/9259686.
- **Product implication:** Add strategy objects and show how much appetite each initiative consumes.
- **Panel disagreement:** None.

### M-A-10 — Credit risk appetite is the clearest growth lever

- **Source IDs:** A-OP-08, A-GP-06, A-GM-04b
- **Convergence:** `[3-source]`
- **Tags:** firm-disclosure facts as stated; `[inference]` for the interpretation; Shawbrook figures `[single]`
- **Finding:** Credit appetite is the strongest evidence for "risk as a strategic lever". The board question becomes how much available risk capacity is being used deliberately, in which segments, and how much more growth could be supported before a constraint binds.
- **Evidence and citations:**
  - **OP:**
    - Coventry: "The Board sets prudent credit risk limits within the context of the Society's overall risk appetite."
    - Coventry grew lending 43% to £9.6bn in 2025, at an average LTV of 67%, with 0.38% of loans three or more months in arrears.
    - Source: The Intermediary, https://theintermediary.co.uk/2026/02/coventry-building-society-reports-profit-surge-in-2025-results/, February 2026.
  - **GP:**
    - Leeds' 2025 report refers to deploying credit appetite while using lending policies and limits, and discloses maximum LTV boundaries and differentiated underwriting.
    - Metro describes updating credit policy, risk appetite and control frameworks to support strategic growth in retail mortgages and commercial lending.
    - Sources: Leeds, 26 February 2026; Metro, 15 April 2026. GP tokens: turn22view0, turn23view2 `[ref-incomplete]`.
  - **GM:**
    - Skipton committed to allocate 50% of new lending to first-time buyers.
    - Leeds' "Income Plus" mortgages lend an average of £66,000 more at 95% LTV.
    - Nationwide offers six-times-income mortgages and acquired Virgin Money.
    - Shawbrook, by adjusting Level 2 sub-limits (debt-to-income multiples, AVM tolerances, niche buy-to-let criteria), cut time to formal offer by 46% and lifted digital conversion by 18%, while cost of risk stayed stable at 47–51 bps.
    - Source: Shawbrook Group plc *Annual Report and Accounts 2025* (March 2026). GM markers 5, 17 and 21 `[ref-incomplete]`.
- **Product implication:** Make headroom to limit a board metric, showing headroom and growth capacity rather than only breaches.
- **Panel disagreement:** None.

### M-A-11 — Risk appetite can also deliberately throttle growth

- **Source IDs:** A-GM-04c
- **Convergence:** `[single]`
- **Tags:** none (firm-disclosure fact as stated by GM)
- **Finding:** Nottingham Building Society deliberately cut new mortgage lending from £1.2 billion in 2024 to £0.9 billion in 2025, to consolidate technology investment and embed its new MQube mortgage platform before scaling specialist lending in 2026.
- **Evidence and citations:**
  - Nottingham Building Society, *2025 Annual Report and Accounts* (March 2026), https://www.thenottingham.com/media/lxbjhahg/2025-annual-report.pdf.
  - GM marker 27 `[ref-incomplete]`.
- **Product implication:** Show appetite moving in both directions, recording both accelerator and throttle decisions with their rationale.
- **Panel disagreement:** None recorded.

### M-A-12 — Growth appetite without matching control capacity exposes senior managers to enforcement

- **Source IDs:** A-GM-04d; links to M-E-04
- **Convergence:** `[single]` for this framing; the underlying growth-outran-controls fact is `[3-source]` (M-E-04)
- **Tags:** `[scope]` for the 2012 precedent (older than five years)
- **Finding:** GM's regulatory adviser warns, citing the Peter Cummings / Bank of Scotland (2012) and Starling Bank (2024) precedents, that a board which expands growth appetite without checking that operational and financial crime control capacity scales with it exposes senior managers to personal enforcement under Principle 3 and SMCR.
- **Evidence and citations:**
  - Stephenson Harwood, *Starling Bank fined £29 million for financial crime systems and controls failings* (02 October 2024), https://www.stephensonharwood.com/insights/starling-bank-fined-29-million-for-financial-crime-systems-and-controls-failings/.
  - GM marker 11 `[ref-incomplete]`. The Bank of Scotland 2012 precedent has no separate source.
- **Product implication:** Pair every growth-enabling appetite change, such as relaxing high-LTV limits or speeding up digital onboarding, with a mandatory capacity check on downstream operational and financial crime controls (GM's "Strategic Growth & Capacity Link").
- **Panel disagreement:** None recorded.

### M-A-13 — Leading and lagging indicators across the nine domains

- **Source IDs:** A-OP-09, A-GP-07, A-GM-05
- **Convergence:** `[3-source]` that every domain needs paired leading and lagging indicators. The individual indicators vary by engine and are attributed below.
- **Tags:** `[practice-not-rule]`, `[inference]`. GM's example values are firm-disclosure figures as GM states them.
- **Finding:**
  - All three engines supply a domain-by-domain library.
  - GM adds that board packs commonly over-rely on lagging indicators.
  - GM also describes UK operational risk literature drawing on PRA Statement of Policy methods, which separates slow, long-lagged risks ("tortoises": operational and misconduct losses) from fast risks ("hares": boundary and liquidity risks) `[single]`, `[ref-incomplete]`.
  - Merged library (engine in brackets):

| Domain | Leading indicators | Lagging indicators |
|---|---|---|
| Credit | Share of high-LTV/LTI new lending [OP]; affordability override rate [OP]; early-arrears roll rates [OP]; approval mix moving to high LTV or high DTI [GP]; underwriting overrides and exceptions rising [GP]; share of new originations above 90% LTV or 4.5x LTI [GM]; early arrears migration, such as a missed first direct debit or pre-arrears forbearance [GM] | 3m+ arrears [OP, GM: e.g. 0.57% at Leeds]; ECL charge [OP, GP]; write-offs [OP]; arrears/default flow and realised losses [GP]; net impairment or cost of risk in bps [GM: e.g. 11 bps Nationwide, 51 bps Shawbrook] |
| Market (IRRBB) | Repricing gap trend [OP]; hedge-effectiveness drift [OP]; pipeline swap coverage [OP]; sensitivity utilisation near limits and unhedged basis or duration concentration [GP]; unhedged fixed-rate offer pipeline relative to swap execution capacity [GM]; EVE and NII sensitivity to a 200bps parallel shock [GM; symbols lost `[ref-incomplete]`] | EVE/NII limit breaches [OP]; realised hedge ineffectiveness [OP, GM]; trading/P&L loss or actual limit breaches [GP]; realised NIM compression [GM: e.g. 1.61% at Nationwide]; VaR back-testing exceptions [GM] |
| Liquidity | Deposit outflow velocity [OP, GP, GM]; rate-sensitive concentration [OP]; encumbrance [OP]; deposit concentration and LCR/survival headroom forecast [GP]; retail deposit pricing spread against top-5 competitors [GM]; wholesale funding reliance nearing internal buffer below the 50% statutory building society limit [GM] | LCR/NSFR against internal limit [OP]; contingency funding plan activation [OP]; buffer depletion or actual breach [GP]; 12-month average LCR and NSFR [GM]; survival days under combined stress in the ILAAP [GM] |
| Conduct | Complaints per 1,000 by journey [OP]; vulnerability identification rate [OP]; out-of-target sales [OP]; journey friction or drop-off, vulnerable-customer exceptions, complaint precursors [GP]; share of fee-paying clients with zero engagement over 12 months, digital support drop-off [GM]; SLA breaches on vulnerable-customer queues and fair-value price dispersion outliers [GM] | FOS uphold rate [OP, GM]; redress [OP, GP, GM]; s166 or VREQ [OP]; confirmed Consumer Duty poor outcomes [GP]; total complaints [GM] |
| Climate | New lending to EPC E–G [OP] or F–G [GM]; flood exposure in new lending [OP, GM]; exposure moving to high physical or transition-risk sectors, collateral EPC/geographic mix [GP]; deviation from interim decarbonisation milestones [GM] | Financed emissions against pathway [OP, GP, GM]; climate-adjusted ECL [OP]; realised climate-related losses [GP, GM] |
| Financial crime | KYC refresh backlog [OP]; alert age [OP, GP]; screening-list coverage [OP]; restricted onboarding exceptions [OP]; high-risk onboarding or override rate [GP]; false-positive drift [GP]; daily data-feed reconciliation discrepancies between core banking and transaction monitoring [GM]; high-risk onboarding velocity against qualified analyst headcount and backlog age [GM] | Late SARs [OP]; sanctions breaches [OP]; enforcement [OP, GP]; confirmed control breaches, SARs, losses, remediation population [GP]; accounts found in breach of a VREQ or sanctions lookback [GM: e.g. 54,359 at Starling]; penalties and s166 remediation costs [GM] |
| Operational resilience | Services near impact tolerance [OP, GP]; change failure rate [OP]; third-party concentration [OP, GP]; unresolved vulnerabilities [GP]; share of important business services relying on unremediated legacy IT or untested critical third parties [GM]; failed DR failover tests or change rollbacks [GM] | Impact tolerance breaches [OP, GP, GM]; reportable incidents [OP]; outage duration and customer impact [GP, GM]; compensation for downtime [GM] |
| Cyber | Critical patch latency [OP, GP, GM]; phishing click rate [OP, GM: privileged admins]; privileged-access exceptions [OP, GP]; anomalous activity trend [GP]; unmonitored API endpoints [GM] | Intrusions or successful compromise [OP, GP, GM]; breach notifications [OP]; data loss or exfiltration [GP, GM]; regulatory fines (ICO/FCA/PRA) and forensic recovery cost [GM] |
| Regulatory | Overdue regulator actions [OP]; late attestations [OP]; overdue audit findings [OP, GM]; obligations with no accountable owner or control [GP]; overdue remediation [GP]; upcoming deadlines (e.g. Basel 3.1, PS6/25, Consumer Duty reviews) with unmapped policies or red project status [GM] | SUP 15 notifications [OP, GM incl. FR7]; fines [OP]; s166 [OP, GM]; rule breach, missed filing or notification, VREQ, enforcement, redress [GP]; VREQs, OIREQs, Final Notices [GM] |

- **Evidence and citations:**
  - **OP:** panel practice `[inference]`.
  - **GP:** FSB, 18 November 2013; Leeds, 26 February 2026; FCA, *AI in financial services: good practice and areas for improvement*, 19 October 2026, https://www.fca.org.uk/publications/good-poor-practice/ai-financial-services.
    - For financial crime and AI, Metro's 2025 emerging-risk disclosure describes adaptive monitoring and behavioural analytics as mitigation for AI-enabled threats.
    - GP tokens: turn0search2, turn23view1, turn19view3, turn23view3 `[ref-incomplete]`.
  - **GM:** FCA Final Notices for Starling (02 October 2024) and Metro (12 November 2024); Leeds *Climate Report 2025* (March 2026); FCA *Payments Consumer Duty Multi-Firm Review* (2024/2025). GM marker 11 and per-cell markers `[ref-incomplete]`.
- **Product implication:**
  - Seed the product with this library and let firms edit it.
  - Every board metric should have a leading-indicator tree showing how much warning each child metric has historically given (GP).
  - Pair leading capacity or strain indicators with lagging outcome indicators on each domain view (GM).
- **Panel disagreement:** None.

### M-A-14 — There is little FCA risk appetite guidance for solo-regulated firms

- **Source IDs:** A-OP-10
- **Convergence:** `[single]`
- **Tags:** `[unverified]`, `[inference]`
- **Finding:**
  - OP found no dedicated FCA guidance on risk appetite.
  - The FCA's levers are Principle 3, SYSC and the Consumer Duty.
  - At Monzo, the "financial crime risk appetite" rested on a UK-only customer policy that onboarding did not enforce.
- **Evidence and citations:** HSF Kramer, https://www.hsfkramer.com/notes/fsrandcorpcrime/2025-posts/aml-update-5-aug-2025, 5 August 2025.
- **Product implication:** For solo-regulated firms, frame appetite against Principle 3 and the Consumer Duty.
- **Panel disagreement:** None recorded.

### M-A-15 — PRA rule and supervisory statement anchors for appetite and governance

- **Source IDs:** A-OP-11, A-GP-01 (PRA expectations), A-GM-01b (Rulebook references), A-GM-02c (SS31/15, SS24/15)
- **Convergence:** `[3-source]` that PRA anchors exist. The specific references are `[near-dup]` across engines and mostly `[unverified]`.
- **Tags:** `[unverified]`
- **Finding:** The engines cite different PRA anchors for appetite and governance:

| Anchor | Cited by | Status |
|---|---|---|
| Fundamental Rules FR2, FR5, FR6, FR7 | OP | FR5 and SS5/16 wording `[unverified]` |
| SS5/16 (board responsibilities) | OP | `[unverified]` |
| SS28/15 (accountability) | OP | `[unverified]` |
| SS1/23 (board-set model risk appetite) | OP, GM | See M-I-10 |
| PRA *Regulatory expectations*, new bank start-up unit, 02 February 2026 | GP | Regulator text, cited with URL |
| PRA Rulebook "ICAA 3.1" and "General Organisational Requirements 2.1" | GM | `[unverified]` |
| SS31/15 (ICAAP and SREP), SS24/15 (liquidity and funding) | GM | `[unverified]` |
| PRA fine on Metro, £5,376,000, 21 December 2021, under FR2 and FR6 for reporting failures | OP | Bank of England, https://www.bankofengland.co.uk/news/2021/december/pra-fines-metro-bank-5376000-for-failing-in-its-regulatory-reporting-governance-and-controls |

- **Evidence and citations:** As in the table.
- **Product implication:** Tag every metric with the rule or supervisory statement it evidences, with the rule library versioned by in-force date.
- **Panel disagreement:** None. The divergence is about which references each engine reached, not about substance.

---

## B — How boards actually see risk (UK evidence)

### M-B-01 — Annual reports disclose the risk taxonomy, but not the board's internal metric pack

- **Source IDs:** B-GP-01, B-OP-02, B-GM introduction
- **Convergence:** `[3-source]`
- **Tags:** `[conflict]` on what counts as a disclosed appetite metric (see CF-03); OP's part is `[inference]`, `[unverified]`
- **Finding:**
  - Annual reports readily disclose the risk taxonomy, governance, principal and emerging risks, and qualitative appetite.
  - They rarely disclose the number and thresholds of internal board RAS metrics.
  - Missing published metrics do not mean firms lack detailed internal suites.
  - The engines differ on whether headline KPIs disclosed in strategic reports (CET1, LCR, arrears, cost of risk) count as "appetite metrics disclosed":
    - GM counts them, finding about 8–12 per firm;
    - OP and GP do not.
- **Evidence and citations:**
  - **GP:**
    - Nationwide says appetite is supported by metrics, limits and triggers.
    - Leeds describes qualitative and quantitative SRA metrics.
    - Metro says principal-risk appetite is monitored via KRIs.
    - None publishes a complete board appetite dashboard.
    - GP tokens: turn21view0, turn23view1, turn22view3 `[ref-incomplete]`.
  - **OP:** No extract showed a public "within appetite" dashboard; disclosure is narrative.
  - **GM:** External disclosures withhold sensitive internal thresholds, such as exact cyber breach counts or internal LCR triggers. They do reveal the taxonomy, how BRC reporting is structured, and the quantitative capital, liquidity, credit and climate metrics tracked against appetite. GM marker 1 `[ref-incomplete]`.
- **Product implication:**
  - Keep RAG status in the private board pack.
  - Generate a sanitised narrative for external disclosure.
  - Handle confidential internal metric values.
- **Panel disagreement:** See the conflict on what counts as a disclosed appetite metric.

### M-B-02 — Typical size of the disclosed risk taxonomy

- **Source IDs:** B-GM-01 (introduction), A-OP-06, A-GP-05
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`
- **Finding:** UK mutuals and challengers organise the board view around 6–11 principal risks, plus a separate set of emerging or top risks:
  - GM: 6–10 principal risks plus 4–8 emerging or top risks;
  - OP: 7–10 principal risks;
  - GP: principal risk counts of 8 (Nationwide, Leeds) and 11 (Metro).
- **Evidence and citations:** Firm reports as cited in M-B-03 to M-B-17.
- **Product implication:** Ship pre-configured UK mutual and challenger taxonomies, separating principal risks (monitored continuously against quantitative RAS limits) from top and emerging risks (tracked through horizon scanning, velocity arrows and scenario weights) (GM).
- **Panel disagreement:** None.

The following firm-by-firm findings merge OP's B-OP-01 rows, GP's B-GP-02 to B-GP-10 rows and GM's B-GM-01 rows. Each firm is one merged finding with per-engine detail. OP flags all its section B counts `[unverified]` because they came from search extracts, not full PDFs.

### M-B-03 — Nationwide Building Society

- **Source IDs:** B-OP-01 (Nationwide row), B-GP-02, B-GM-01 (Nationwide row)
- **Convergence:** `[3-source]`
- **Tags:** `[conflict]` on the principal-risk list (see CF-04)
- **Documents and years:**
  - OP: *ARA 2025*; *Interim September 2025*.
  - GP: *ARA 2026*, 20 May 2026, https://www.nationwide.co.uk/-/assets/nationwidecouk/documents/about/how-we-are-run/results-and-accounts/2025-2026/annual-report-and-accounts-2026.pdf.
  - GM: *ARA 2024* (22 May 2024); *Strategic Report* and *Pillar 3 2025* (28 May 2025); *Preliminary Results 2026* (May 2026).
- **Principal risks:**
  - OP and GP: 8, namely credit; liquidity and funding; capital; market; pension; business; operational and conduct; model.
  - GM: "7–8", namely credit; liquidity and funding; capital; market; operational and resilience; conduct and compliance; strategic/execution (including Virgin Money integration); climate.
- **Emerging or top risks:**
  - OP: 7, namely climate; cyber; emergent technology; geopolitical; integration (new); macroeconomic; technology and resilience.
  - GP: a separate "top and emerging" overlay linked back to principal risks, with material macro, geopolitical and other cross-cutting themes.
  - GM: macroeconomic and cost-of-living pressures; higher-for-longer interest rates feeding into household arrears; Virgin Money integration; AI and cyber threats.
- **Appetite metrics disclosed:**
  - OP: narrative only.
  - GP: no total count; appetite statements are supported by metrics, limits and triggers.
  - GM: about 12 headline metrics:
    - CET1 19.1%;
    - UK leverage ratio 5.3% against a target (target figure lost in export `[ref-incomplete]`);
    - 12-month average LCR 169%;
    - wholesale funding below the 50% statutory limit;
    - cost of risk 11 bps;
    - 3m+ residential arrears;
    - customer satisfaction lead of +8.6 points;
    - adherence to its branch promise.
- **Presentation and governance:**
  - OP: columns for risk, mitigation and related principal risks; emerging risks mapped to principal risks.
  - GP: the board approves appetite; the BRC monitors, challenges and recommends appetite and metrics; strong, explicit strategy-appetite linkage.
  - GM: qualitative RAS statements paired with quantitative limits and triggers in Pillar 3; the strategic report maps KPIs to four strategic drivers.
- **Notable practice:**
  - GM: explicit disclosure of the internal leverage ratio target, alongside a Bank of England stress test low-point CET1 of 14.5% against a 10.7% peer average.
  - OP: emerging risks mapped to principal risks.
- **Citations:**
  - OP: https://www.nationwide.co.uk/-/assets/nationwidecouk/documents/about/how-we-are-run/results-and-accounts/2024-2025/annual-report-and-accounts-2025.pdf.
  - GP: tokens turn21view0, turn21view1 `[ref-incomplete]`.
  - GM: Nationwide *Pillar 3 2025* and *2026 Preliminary Results*, https://www.nationwide.co.uk/-/assets/nationwidecouk/documents/about/how-we-are-run/results-and-accounts/2025-2026/2026-preliminary-results.pdf; GM markers 1 and 5 `[ref-incomplete]`.
- **Product implication:** Mirror this convention: principal risks with emerging risks mapped across them.

### M-B-04 — Coventry Building Society

- **Source IDs:** B-OP-01 (Coventry row), B-GP-03, B-GM-01 (grouped Coventry/Yorkshire/Principality row)
- **Convergence:** `[3-source]` (GM's evidence is a grouped sector row, not firm-specific)
- **Tags:** `[conflict]` on the emerging-risk lists (see CF-05)
- **Documents:**
  - OP: *ARA 2024*; *H1 2025*.
  - GP: *Annual Report & Accounts 2024*, 06 March 2025, https://www.coventrybuildingsociety.co.uk/content/dam/cbs/member/pdfs/financial-results/2024/annual-report-and-accounts-2024.pdf.
  - GM: sector benchmark disclosures, BSA Yearbook 2024/25 and trading updates (2025).
- **Principal risks:**
  - OP: 7, rising to 8 from January 2025 with change risk added.
  - GP: the taxonomy is disclosed in the RMF but the total was not safely re-counted.
  - GM: "7–8", a standardised mutual taxonomy covering credit, capital, liquidity, market/IRRBB, operational resilience, conduct/Consumer Duty, financial crime/fraud and climate.
- **Emerging or top risks:**
  - OP: climate; Co-operative Bank integration; change; cyber; financial crime.
  - GP: at least four on the reviewed page: economic/geopolitical; housing, mortgage and funding market; changing customer behaviour; technology/digital innovation.
  - GM (sector row): NIM compression from higher deposit costs (flagged by Fitch Ratings for 2025); physical branch cost against digital investment; Co-op Bank integration for Coventry.
- **Appetite metrics:**
  - OP: "No appetite for any breach."
  - GP: no public count found.
  - GM (sector row): CET1, leverage, LCR, NSFR, arrears below market average, and a fair-value savings premium (£2.3bn sector-wide above big banks in 2024).
- **Presentation and governance:**
  - OP: a strategic report section; change risk elevated "to support enhanced monitoring by the Board".
  - GP: "top and emerging" risks are filtered above the principal risks and closely monitored by the board.
  - GM (sector row): principal-risk heatmaps with trend arrows, aligned to FCA sector priorities.
- **Citations:** GP token turn23view4 `[ref-incomplete]`; GM marker 25 `[ref-incomplete]`.
- **Product implication:** Support a "top and emerging" layer filtered above the principal risks.

### M-B-05 — Yorkshire Building Society

- **Source IDs:** B-OP-01 (Yorkshire row), B-GP-04, B-GM-01 (grouped row)
- **Convergence:** `[3-source]` (GM's evidence is a grouped row)
- **Tags:** OP counts `[unverified]`
- **Documents:**
  - OP: FY2024 RNS; *Pillar 3 2024*, https://www.ybs.co.uk/documents/d/ybs/ybs-q4-pillar-3-20241231-pdf.
  - GP: *Risk Management Report 2025* (2026 posting), https://www.ybs.co.uk/documents/d/ybs/risk-management-report-2025?download=true.
  - GM: grouped sector row.
- **Principal risks:**
  - OP: 8.
  - GP: the taxonomy is present but the total was not safely verified.
  - GM: "7–8" (grouped).
- **Emerging risks:**
  - OP: geopolitical/tariffs; climate.
  - GP: an emerging-risk process is disclosed.
- **Presentation and governance:**
  - OP: columns for emerging risk, principal risk(s) and commentary; the BRC receives the CRO's quarterly view.
  - GP: the board is ultimately responsible for risk management and approves appetite and certain policies; the BRC oversees; executive risk governance sits below it.
- **Citations:** GP token turn7view2 `[ref-incomplete]`.
- **Product implication:** Support an emerging-to-principal mapping table with commentary.

### M-B-06 — Skipton Building Society / Skipton Group

- **Source IDs:** B-OP-01 (Skipton row), B-GP-05, B-GM-01 (Skipton row)
- **Convergence:** `[3-source]`
- **Tags:** `[conflict]` (minor) on the publication date of *ARA 2024*: GP says 25 February 2025, GM says March 2025 (see CF-06)
- **Documents:**
  - OP: *ARA 2024/2025*; Pillar 3, https://www.skiptongroup.com/wp-content/uploads/2026/02/annual-report-and-accounts-2025.pdf.
  - GP: *Annual Report & Accounts 2024*, 25 February 2025, https://www.skipton.co.uk/content/dam/sbs-sites/skipton-co-uk/documents/about-us/financial-results/2024/annual-reports-and-accounts-2024.pdf.
  - GM: *ARA 2024* (March 2025); *ARA 2025* (February 2026); *Pillar 3 2024*.
- **Principal risks:**
  - OP: not verified; includes business, model, capital/MREL and climate.
  - GP: total not safely re-counted.
  - GM: 8, namely credit; capital; liquidity and funding; market (IRRBB); operational resilience and cyber; conduct and regulatory; strategic/business (across Homes, Money, Connells and SIL); climate/sustainability.
- **Emerging risks:**
  - GP: economic/geopolitical; technology/innovation.
  - OP: macro; housing.
  - GM: housing affordability (only 1 in 8 first-time buyers can afford their local area); geopolitical and inflation volatility; digitising home buying and selling; historical policy and risk remediation at subsidiary Skipton International Limited (SIL).
- **Appetite metrics:**
  - OP: credit limits, including climate.
  - GM: about 10 headline metrics:
    - HQLA £6.0bn;
    - LCR well above 100% regulatory and internal board limit;
    - first-time buyer share of new lending 50%, against a 2028 goal;
    - group mortgage growth 8.2%;
    - savings growth 8.9%;
    - gender parity target 50%;
    - net zero by 2050.
- **Presentation and governance:**
  - OP: columns for principal risk, description and primary oversight; each principal risk is mapped to an oversight body.
  - GP: the board keeps a forward-looking scenario focus; emerging risks are shown with mitigation, not raw control inventories.
  - GM: an integrated group risk review links principal risks to three strategic priorities: "Helping More People Have a Home", "Making Money Work Harder" and "Making Membership Matter".
- **Notable practice (GM):** candid disclosure of strengthening SIL's infrastructure in 2025 because of historic issues with policy and risk management.
- **Citations:** GP token turn23view5 `[ref-incomplete]`; GM markers 14 and 26 `[ref-incomplete]`.
- **Product implication:** Map each principal risk to its oversight forum; support group and subsidiary views.

### M-B-07 — Leeds Building Society

- **Source IDs:** B-OP-01 (Leeds row), B-GP-06, B-GM-01 (Leeds row)
- **Convergence:** `[3-source]`
- **Tags:** two conflicts (see CF-07 and CF-08):
  - publication date: GP says 26 February 2026, GM says 06 March 2026;
  - climate: GM treats it as a principal risk assessed across all others, while OP and GP treat it as cross-cutting or emerging
- **Documents:**
  - OP: *ARA 2024/2025*, https://www.leedsbuildingsociety.co.uk/_resources/pdfs/press-pdfs/financial-results-pdfs/2025-annual-report-and-accounts.pdf.
  - GP: *Annual Report and Accounts 2025*, 26 February 2026 (same URL).
  - GM: *ARA 2024/2025* (06 March 2026); *Pillar 3 2025*; *Climate Report 2025/2026*.
- **Principal risks:**
  - OP: 8.
  - GP: 8.
  - GM: "7–8", namely credit, capital, liquidity and funding, market, operational, conduct, strategic, and climate (assessed through the Climate Risk Management Framework across all principal risks).
- **Emerging risks:**
  - OP: macro; geopolitical; competition; resilience; change; AI; climate.
  - GP: a separate emerging-risk category; climate remains emerging rather than a standalone principal risk.
  - GM: housing supply and planning bottlenecks; core banking platform replacement; mortgage and savings competition; off-track dependencies on national grid and housing decarbonisation.
- **Appetite metrics:**
  - GP: no total count; the SRA contains qualitative statements and quantitative metrics.
  - GM: about 11 headline metrics:
    - CET1 25.5%;
    - cost-to-income 46.1%;
    - residential arrears 0.57%;
    - member satisfaction 94%;
    - colleague engagement 8.4/10;
    - savings rate 0.90% above market;
    - four quantitative 2034 climate targets, including a 90% cut in market-based Scope 1 and 2 emissions and a 70% cut in Scope 3 mortgage intensity.
- **Presentation and governance:**
  - GP: the board defines the SRA across all eight principal risks; continuous monitoring, early-warning indicators and escalation; the SRA is used in planning and stress testing.
  - GM: a table mapping principal risks to quantitative metrics and regulatory minima in Pillar 3; transparent on-track and off-track reporting of climate targets.
- **Notable practice:**
  - GM: openly reported being off-track on three of its 2021–2030 climate targets before re-baselining to 2034.
  - OP: climate treated as cross-cutting.
- **Citations:** GP tokens turn23view0, turn23view1 `[ref-incomplete]`; GM markers 15, 20 and 22 `[ref-incomplete]`.
- **Product implication:** Show on-track and off-track status honestly, including when the firm is outside a target.

### M-B-08 — Principality Building Society

- **Source IDs:** B-OP-01 (Principality row), B-GP-07, B-GM-01 (grouped row)
- **Convergence:** `[3-source]` that it was reviewed. OP alone gives a count: `[single]`.
- **Tags:** GP `[unverified]`, `[ref-incomplete]` (no URL or date); OP `[unverified]`
- **Documents:**
  - OP: *ARA 2024/2025*, https://www.principality.co.uk/getmedia/c455d45e-9c14-458e-87b4-2726b1ff6925/Annual-Report-and-Accounts-2025.pdf.
  - GP: "2025 reporting suite; exact publication date not confirmed".
  - GM: grouped sector row.
- **Principal risks:**
  - OP: 9, namely credit, market, liquidity and funding, solvency, conduct, legal and regulatory, operational, business, model.
  - GP: a prior disclosure identifies a "low-double-digit key-risk taxonomy", but the 2025 count was not re-extracted.
  - GM: "7–8" (grouped).
- **Notable practice (OP):** model risk added in 2024 under SS1/23.
- **Product implication:** Include model risk as a principal risk option.

### M-B-09 — OSB Group

- **Source IDs:** B-OP-01 (OSB row), A-OP-02, A-OP-04
- **Convergence:** `[single]`
- **Tags:** OP counts `[unverified]`
- **Document:** *ARA 2024*, https://www.osb.co.uk/media/gbujhlan/osbg-2024-ara.pdf.
- **Principal risks:** about 10.
- **Emerging risks:** macro and rates; climate.
- **Appetite:** a statement for each risk; metrics and thresholds at entity and group level; "very low appetite" for reputational risk; solvency appetite constrained "within the leverage ratio".
- **Presentation:** per-risk pages; qualitative appetite disclosed.
- **Product implication:** Support appetite statements at both entity and group level.

### M-B-10 — Metro Bank

- **Source IDs:** B-OP-01 (Metro row), B-GP-10, A-GP-06, A-GP-07
- **Convergence:** `[2-source]`
- **Tags:** `[conflict]` on the principal-risk count: OP says "about 10", GP says 11 (see CF-09)
- **Documents:**
  - OP: *ARA 2024/2025*, https://www.metrobankonline.co.uk/globalassets/documents/investor_documents/metro-bank---annual-report-2025.pdf.
  - GP: *Annual Report and Accounts 2025*, 15 April 2026 (same URL).
- **Principal risks:**
  - GP: 11, namely credit, capital, liquidity and funding, market, financial crime, operational, conduct, regulatory, legal, model, strategic.
  - OP: about 10.
- **Emerging risks:**
  - GP: 5 listed, namely geopolitical instability; prolonged macro stagnation; digital disruption and technology competition; AI-enabled threats; climate-related financial risk.
  - OP: geopolitical; UK growth; fraud.
- **Appetite metrics:** principal-risk appetite "monitored via key risk indicators" (OP, GP); no total.
- **Presentation:**
  - OP: includes a "crystallising time horizon" column; strategic pillars mapped to risks.
  - GP: emerging risks mapped back to the principal risks they affect; credit appetite and control framework adjusted for strategic growth; adaptive monitoring and behavioural analytics described as mitigation for AI-enabled threats.
- **Citations:** GP tokens turn22view3, turn23view2, turn23view3 `[ref-incomplete]`.
- **Product implication:** Add a "time to crystallise" field to emerging risks.

### M-B-11 — Starling Bank

- **Source IDs:** B-OP-01 (Starling row), B-GP-08, B-GM-01 (Starling and Monzo row)
- **Convergence:** `[3-source]`
- **Tags:** GP `[single]`, `[unverified]`. GM's principal-risk list for Starling and Monzo is sourced to Final Notices, which do not list principal risks: `[unverified]`, `[ref-incomplete]`.
- **Documents:**
  - OP: *Pillar 3 2025*, https://www.starlingbank.com/docs/annual-reports/Pillar3-2025.pdf.
  - GP: *Annual Report 2025*, with the FCA Final Notice and press release of 02 October 2024.
  - GM: FCA Final Notices (02 October 2024 and 07 July 2025) and corporate responses.
- **Principal risks:**
  - OP: "Level 1 risks".
  - GP: exact count not reliably extracted.
  - GM: "7–8", namely financial crime and sanctions, credit, capital, liquidity, operational resilience, conduct, strategic/growth (stated jointly for Starling and Monzo).
- **Appetite metrics:**
  - OP: an appetite statement for each sub-category, with limits and KRIs.
  - GM: an internal VREQ zero-tolerance limit on high-risk account openings, breached 54,359 times at Starling and repeatedly at Monzo.
- **Governance:**
  - OP: an executive risk committee oversees emerging risks; the BRC recommends "appetite and tolerances to the Board".
  - GM: after remediation, third-party assurance testing of customer and payment screening, and formal VREQ governance frameworks.
- **Notable practice:**
  - GP: enforcement evidence is more revealing than public appetite counts.
  - GM: a negative benchmark, showing that board packs without automated KCI reconciliation and clear SMF accountability can hide years of systemic breaches.
- **Citations:** GP token turn9search0 `[ref-incomplete]`; GM marker 6 `[ref-incomplete]`.
- **Product implication:** Treat VREQs as Level 1 items with zero-tolerance proxies.

### M-B-12 — Monzo Bank

- **Source IDs:** B-GP-09, B-GM-01 (Starling and Monzo row); OP lists Monzo as "not reviewed — gap"
- **Convergence:** `[2-source]`
- **Tags:** GP `[unverified]`
- **Documents:** GP: *Annual Report 2026* and FCA, 08 July 2025. GM: as M-B-11.
- **Findings:**
  - GP: principal-risk reporting exists but the count was not safely verified. Public reporting describes first-line ownership and the risk structure, but the 2025 FCA case shows more clearly where the cascade broke during scaling.
  - GM: the VREQ was repeatedly breached.
- **Citations:** GP token turn9search1 `[ref-incomplete]`.
- **Product implication:** As M-B-11.

### M-B-13 — Paragon Bank

- **Source IDs:** B-OP-01 (Paragon row)
- **Convergence:** `[single]`
- **Tags:** `[unverified]`
- **Document:** Paragon Bank PLC *ARA 2025*, https://www.paragonbankinggroup.co.uk/resources/paragon-group/documents/section-172/2025/2025-paragon-bank-plc-accounts.
- **Finding:** Counts were not verified; presentation is principal risks with mitigations; the group report was not located.
- **Product implication:** None. This is recorded as a gap.

### M-B-14 — Shawbrook Group

- **Source IDs:** B-GM-01 (Shawbrook row); OP lists Shawbrook as "not reviewed — gap"
- **Convergence:** `[single]`
- **Tags:** none beyond GM marker `[ref-incomplete]`
- **Documents:** *Pillar 3 Disclosures 2023* (2024); *Interim Financial Report H1 2025*; *Annual Report & Accounts 2025* (March 2026).
- **Principal risks:** "7–8", namely credit; capital; liquidity and funding; market/IRRBB; operational and resilience; conduct and regulatory; strategic/M&A (for example the ThinCats and TML/Bluestone integrations).
- **Emerging risks:**
  - macroeconomic downside scenarios (a 40% combined probability weight on downside and severe downside in ECL models);
  - TFSME refinancing (repaid July 2025);
  - AI and automation scaling.
- **Headline metrics (about 12):**
  - CET1 12.4%;
  - total capital 14.8%;
  - leverage ratio 8.4% (2023);
  - LCR 310.9% (2023);
  - NSFR;
  - loan book growth of 16% to £19.2bn;
  - cost of risk 47 bps underlying and 51 bps statutory;
  - cost-to-income 39.0%;
  - RoTE 17.2%.
- **Presentation:** a dedicated "Top and Emerging Risks" section (p. 22) separated from "Principal Risks" (p. 24); explicit confirmation that credit performance stayed well within appetite.
- **Notable practice:** data-led credit appetite and automated underwriting (AVMs plus income verification) linked to 36%–46% faster completion times and IPO readiness.
- **Citations:** GM markers 17, 19 and 21; works cited include https://cdn.prod.nntech.io/company-events/reports/0874ad25-26a1-37e9-8d97-926640d02d06/report.pdf and a Shawbrook Group plc HTML report link (a time-limited signed URL) `[ref-incomplete]`.
- **Product implication:** Separate top and emerging risks from principal risks on the board view.

### M-B-15 — Nottingham Building Society

- **Source IDs:** B-GM-01 (Nottingham row), A-GM-04c
- **Convergence:** `[single]`
- **Document:** *Annual Report and Accounts 2025* (March 2026), https://www.thenottingham.com/media/lxbjhahg/2025-annual-report.pdf.
- **Principal risks:** 7, namely credit, capital, liquidity and funding, market, operational resilience and cyber, conduct, strategic and transformation.
- **Emerging risks:** US tariff and macroeconomic policy shifts; UK Autumn Budget dampening the mortgage market; rising cyber-attack sophistication; scaling risk on the third-party MQube platform.
- **Headline metrics (about 8):**
  - total assets £5.4bn;
  - new mortgage lending throttled to £0.9bn from £1.2bn;
  - statutory PBT £16.7m;
  - NIM 1.72% (2024);
  - CET1 13.7% (2024);
  - leverage 4.9% (2024);
  - LCR 172% (2024).
- **Presentation:** directional arrows ("Positive movement", "Adverse movement", "Stable") alongside a narrative of "deliberate consolidation".
- **Notable practice:** the board using appetite to throttle growth, cutting lending by 25% in 2025 to embed technology and resilience foundations.
- **Citations:** GM marker 27 `[ref-incomplete]`.
- **Product implication:** Support directional movement indicators as well as RAG.

### M-B-16 — Cambridge Building Society

- **Source IDs:** B-GM-01 (Cambridge row)
- **Convergence:** `[single]`
- **Document:** *Annual Report and Accounts 2025* (March 2026), https://media.umbraco.io/cambridge/rbxpbmxv/annual-report-and-accounts-2025.pdf.
- **Finding:**
  - "6–7" principal risks: credit, capital, liquidity, market, operational, conduct/compliance, strategic.
  - Emerging risks: margin compression, regional housing affordability, cyber and operational resilience.
  - Capital and liquidity are maintained above regulatory minima and internal appetite.
  - The governance summary is narrative.
  - Proportionate governance links board appetite to local community lending strategy.
- **Citations:** GM marker 51 `[ref-incomplete]`.
- **Product implication:** A lighter edition for smaller societies (see M-J-04).

### M-B-17 — OakNorth Bank

- **Source IDs:** B-GM-01 (OakNorth row)
- **Convergence:** `[single]`
- **Document:** *Annual Report 2024* (March 2025), https://oaknorth.co.uk/wp-content/uploads/2025/03/Annual_Report_2024.pdf.
- **Finding:**
  - "6–7" principal risks: credit, IRRBB, liquidity, capital, operational, conduct/financial crime.
  - Emerging risks: commercial real estate and SME borrower stress under high base rates; deposit competition.
  - Explicit confirmation that IRRBB, credit, capital and liquidity metrics stayed within appetite through 2024.
  - Forward-looking credit monitoring is integrated with tight IRRBB appetite boundaries.
- **Citations:** GM marker 16 `[ref-incomplete]`.
- **Product implication:** Specialist lenders need IRRBB-centred appetite views.

### M-B-18 — Building society sector benchmarks (GM grouped row)

- **Source IDs:** B-GM-01 (Coventry/Yorkshire/Principality row)
- **Convergence:** `[single]`
- **Tags:** `[ref-incomplete]`; not firm-specific
- **Finding:**
  - Mutuals hold 30% of UK branches, with only a 12% branch reduction over a decade against 44% at banks.
  - The sector paid a £2.3bn fair-value savings premium above big banks in 2024.
  - Fitch Ratings flagged NIM compression from higher deposit costs for 2025.
- **Citations:** GM marker 25: Grant Thornton, *Building societies: operational and financial resilience are key* (24 March 2025), https://www.grantthornton.co.uk/insights/building-societies-operational-and-financial-resilience-are-key/.
- **Product implication:** Background for building society positioning (see M-J).

### M-B-19 — Escalation filtering between board, BRC, executive committees and management is firm design

- **Source IDs:** B-OP-03, B-GP-11, B-GM-02a
- **Convergence:** `[3-source]` that it is firm practice, not rule
- **Tags:** `[practice-not-rule]`, `[inference]`
- **Finding:** No regulatory rule prescribes what each forum sees. The engines describe similar cascades:

| Forum | OP (panel practice) | GM (standard UK practice as GM states it) | GP |
|---|---|---|---|
| Management / sub-committees | See all KRIs | First and second line review the full Level 1, 2 and 3 suite monthly at the ERC or specialist sub-committees (ALCO, Credit Risk Committee, Financial Crime Steering Group) | Executive and specialist committees run underlying limits, actions and exceptions |
| Executive committee | Level 2 ambers and reds | ERC reviews all red and amber metrics at Levels 1–3 and approves remediation plans and owners for Level 2 and 3 triggers | — |
| BRC | All Level 1 plus Level 2 reds | All Level 1 metrics (green, amber, red), all Level 2 reds, persistent Level 2 ambers (amber for two or more quarters, or adverse trajectory; one symbol lost `[ref-incomplete]`), and a quarterly emerging-risk report; meets quarterly or six to eight times a year | Deeper challenge |
| Board | Level 1 status and breaches | The 10–12 headline KPIs/KRIs, any Level 1 red or amber needing a strategic trade-off or appetite waiver, and the BRC chair's escalation report | Approves strategy and appetite; receives aggregate profile, material breaches, top and emerging risks, remediation |

- **Evidence and citations:**
  - **OP:** Skipton maps each risk to a committee; Yorkshire's BRC receives the CRO's quarterly view; Starling's executive committee sits below the BRC.
  - **GP:** Nationwide names its board, BRC and specialist committees (asset/liability, credit, model risk); Yorkshire separates board and BRC from executive governance. GP tokens turn21view0, turn7view2 `[ref-incomplete]`.
  - **GM:** markers 4, 10 and 12 `[ref-incomplete]`.
- **Product implication:**
  - Run every forum from a single source of truth.
  - Show what each filter suppresses (OP).
  - Make escalation materiality- and decision-based, not a static traffic-light visibility rule (GP).
- **Panel disagreement:** GP says no rule supports "red only to the board, amber and red to the BRC", and that a board can legitimately need an amber if it threatens strategy, regulatory commitments or future headroom. OP and GM present fixed cascades as typical practice. This is a design disagreement, not a factual conflict.

### M-B-20 — Committees can filter out bad news before it reaches the board (Metro and Starling evidence)

- **Source IDs:** B-GM-02b, B-OP-03 (counter-evidence), D-OP-04, F-OP-04, H-GP-03, H-OP-03
- **Convergence:** `[3-source]` that Metro staff concerns did not reach the board for a long time. The detailed minute-level timeline is `[single]` (GM). Starling's inconsistent committee information is `[single]` (OP).
- **Tags:** none (Final Notice facts as reported by the engines)
- **Finding:**
  - **GM's Metro timeline, from the Final Notice of 12 November 2024:**
    - junior staff raised concerns about "Bad Data" in transaction monitoring in 2017;
    - a financial crime steering group deleted the review action from its January 2018 minutes as lacking context and not yet substantiated;
    - an operations risk board ranked bad data among its top five risks between May and August 2018, then reassigned and dropped the actions after 16 August 2018;
    - no periodic MI or formal escalation reached the BRC or board until an external firm was engaged in December 2018.
  - **OP:** at Metro, about two years passed from first flag to board, and staff flagged data gaps in 2017 and 2018 that were not fixed until 2019–2020.
  - **GP:** junior staff raised concerns before full remediation.
  - **OP:** at Starling, "different committees receiv[ed] different information".
- **Evidence and citations:**
  - GM: FCA, *Final Notice: Metro Bank PLC* (12 November 2024), https://www.fca.org.uk/publication/final-notices/metro-bank-plc-2024.pdf; LearnSignal, *Metro Bank FCA Fine: £16.7m…*, https://www.learnsignal.com/blog/metro-bank-fca-final-notice-16-7-million-automated-transaction-monitoring-data-feed-failure-guide/; GM marker 10 `[ref-incomplete]`.
  - OP: Lexology, https://www.lexology.com/library/detail.aspx?g=60de7c1e-a6a8-4364-a05b-a716017b20ef, November 2024.
- **Product implication:**
  - Enforce immutable escalation. If an issue is flagged as a top risk at an operational forum, or stays unremediated past its SLA, surface it automatically on the BRC view so it cannot be suppressed manually or edited out of minutes (GM).
  - Track "bad news travel time" (OP).
- **Panel disagreement:**
  - GM's NED: executive committees often "manage out" embarrassing data gaps before they reach the BRC.
  - GM's first-line owner: when a metric is downgraded or removed at a sub-committee, there is rarely an immutable audit trail visible to the second or third line.

---

## C — Reportable versus not reportable

### M-C-01 — Principle 11 and SUP 15.3: notify "immediately", once information "reasonably suggests" a matter

- **Source IDs:** C-OP-01, C-GP-01, C-GM-01a, C-GM-02a
- **Convergence:** `[3-source]`
- **Tags:** None for the rule. GM's triage window is `[practice-not-rule]` `[unverified]`.
- **Finding:**
  - Under SUP 15.3.1R a firm must notify the FCA "immediately it becomes aware, or has information which reasonably suggests" that a specified serious matter has occurred, may have occurred, or may occur in the foreseeable future. The specified matters include:
    - threshold-condition failure;
    - significant reputational impact;
    - serious consumer detriment;
    - serious financial consequences;
    - significant rule breaches, including VREQs;
    - significant fraud and control failures.
  - SUP 15.3.11R covers significant breaches of rules, Principles or COCON (OP).
  - SUP 15.6 covers false or misleading information (OP).
  - A firm does not have to finish its internal investigation before notifying (OP and GM).
- **Evidence and citations:**
  - **OP:** FCA Handbook SUP 15.3, https://handbook.fca.org.uk/handbook/sup15/sup15s3, accessed October 2026.
  - **GP:** SUP 15.3 extract dated 27 March 2026 (same URL).
    - The guidance says significance can depend on potential loss to customers or the firm, how often the problem occurs, what it implies for systems and controls, and how long it took to identify or correct.
    - SUP notes that one underlying issue can need separate notifications if the timetables differ.
    - GP token: turn14view3 `[ref-incomplete]`.
  - **GM:** Principle 11 requires open and co-operative dealing and appropriate disclosure; SUP 15.3.1R puts this into operation.
    - In enforcement practice "immediately" is read strictly.
    - GM says a firm is allowed a short, focused triage window, typically 24 to 72 hours or up to a few days for complex technical bugs, to establish that the information reasonably suggests a material issue `[practice-not-rule]` `[unverified]` `[single]`.
    - Sources: FCA *Final Notice: Starling Bank Limited* (02 October 2024); FCA *Regulatory Bulletin / SUP 15 Reminder* (2023/2025), https://content.govdelivery.com/accounts/UKFCA/bulletins/3671a74. The works-cited title for this is "Regulation round-up July 2023". GM marker 6 `[ref-incomplete]`.
- **Product implication:**
  - Start the clock at "reasonably suggests", not at confirmation.
  - Use a rules engine with human regulatory judgement, not a single severity threshold.
- **Panel disagreement:** The 24–72 hour triage window is GM's alone. OP and GP give no window.

### M-C-02 — PRA Fundamental Rule 7 runs alongside Principle 11 and is deliberately broad

- **Source IDs:** C-OP-03, C-GP-02, C-GM-01b
- **Convergence:** `[3-source]`
- **Tags:** OP `[unverified]` on FR7 wording. GM's booking-model example is `[unverified]`.
- **Finding:**
  - FR7 requires PRA firms to deal with regulators openly and co-operatively, and to disclose anything the PRA would reasonably expect notice of.
  - A firm can fail FR7 even if no single prescriptive reporting field matches the incident.
  - Dual-regulated firms run the FCA and PRA tests in parallel.
- **Evidence and citations:**
  - **OP:** the Metro PRA case (21 December 2021, see M-A-15) shows the PRA enforcing reporting accuracy.
  - **GP:** current operational-incident policy says firms already notify certain incidents and material outsourcing under FR7 and the PRA Notifications rules. Source: PRA *PS7/26 — Operational resilience: Operational incident and third-party reporting*, 18 March 2026, https://www.bankofengland.co.uk/prudential-regulation/publication/2026/march/operational-incident-and-third-party-reporting-policy-statement. GP token: turn15search2 `[ref-incomplete]`.
  - **GM:** FR7 "mirrors Principle 11 verbatim" for safety-and-soundness matters, including:
    - prospective material booking-model changes under SS5/21 / PS6/25 (published 20 May 2025);
    - capital or liquidity buffer triggers;
    - material operational-resilience disruptions.
    - Source: Deloitte UK, *PRA booking model and branch risk appetite finalised (SS5/21 / PS6/25)* (20 May 2025), https://www.deloitte.com/uk/en/blogs/ecrs/pra-booking-model-and-branch-risk-appetite-finalised-act-now-on-self-assessment.html. GM marker 33 `[ref-incomplete]`. Whether the booking-model rules apply to UK deposit-takers is `[unverified]`.
- **Product implication:**
  - Record the FCA and PRA reporting decisions separately.
  - Have the decision record ask "would the PRA reasonably expect notice?" as well as the rule-specific tests (GP).
- **Panel disagreement:** None. GM's "verbatim" wording is not checked against the rule text.

### M-C-03 — SUP 15 was amended in 2026 (Handbook Notice 139)

- **Source IDs:** C-OP-04
- **Convergence:** `[single]`
- **Tags:** `[unverified]`
- **Finding:** Handbook Notice 139 records two changes. The Redress Reforms Instrument 2026 amended SUP 15.3. The operational incident instrument inserted SUP 15.18 and 15.19.
- **Evidence and citations:** Regulation Tomorrow, https://www.regulationtomorrow.com/2026/03/handbook-notice-no-139/, March 2026.
- **Product implication:** Version the rule library by in-force date.
- **Panel disagreement:** None recorded.

### M-C-04 — The new operational incident and third-party reporting regime starts on 18 March 2027

- **Source IDs:** C-OP-05, C-GP-03, C-GM-01c
- **Convergence:** `[3-source]` that incident and outsourcing notification exists. `[2-source]` (OP, GP) on the 18 March 2027 regime.
- **Tags:** `[conflict]` over which instruments and timings apply now (see CF-10). OP `[unverified]` on submission clocks.
- **Finding:**
  - **OP and GP:** FCA PS26/2 and PRA PS7/26 were both published on 18 March 2026 and apply from 18 March 2027. They set:
    - one incident definition;
    - reporting thresholds;
    - "standard" and "enhanced" tiers, with about 90% of FCA firms in the standard tier (OP);
    - notification of material third-party arrangements;
    - an annual register.
  - **GP:** until the new regime starts, firms must keep meeting Principle 11, FR7 and existing outsourcing obligations. The FCA says so explicitly.
  - **GM:** describes the current regime differently. Under PS21/3, SS1/21, SS2/21, PS16/24 and "CP24/28 on incident reporting", firms must notify the FCA and PRA immediately when an operational incident breaches an important business service's impact tolerance. Reports are staged (initial, intermediate, closure), and material outsourcing needs advance notice.
- **Evidence and citations:**
  - **OP:** FCA PS26/2, https://www.fca.org.uk/publications/policy-statements/ps26-2-operational-incident-third-party-reporting, 18 March 2026.
  - **GP:** FCA, *Reporting material third party arrangements*, 18 March 2026, https://www.fca.org.uk/firms/outsourcing-and-operational-resilience/reporting-material-third-party-arrangements; PRA PS7/26. GP tokens: turn14view4, turn15search2 `[ref-incomplete]`.
  - **GM:** marker 25 `[ref-incomplete]`. No URL is given for CP24/28 or PS16/24.
- **Product implication:**
  - The new regime is a buying trigger with a fixed date. Build incident classification now (OP).
  - Run current obligations and the post-18 March 2027 reporting logic side by side (GP).
- **Panel disagreement:** Covered in CF-10. OP and GP cite the final policy statements, a regulator source. GM cites a consultation paper number.

### M-C-05 — Conduct Rule breach notifications run on a different clock from serious-event notification

- **Source IDs:** C-OP-06, C-GP-04, C-GM-01d
- **Convergence:** `[3-source]`
- **Tags:** OP `[unverified]` on timings. GM's form names and the two-month REP008 window are `[single]` `[unverified]`.
- **Finding:**
  - A firm must notify only where it has taken formal disciplinary action: a written warning, suspension, dismissal, or reduction or recovery of pay (OP, GM).
  - Senior Manager breaches go to the regulator within a short timetable. OP and GM give 7 business days. GM says this uses Form C, if the person leaves the role, or Form D, under SUP 15.11.
  - Breaches by non-SMF staff go in the annual REP008 return. GM says it is due within two months of the accounting reference date.
  - A serious underlying matter can also trigger an immediate SUP 15.3 notification (GP, GM).
- **Evidence and citations:**
  - **OP:** Clifford Chance, https://www.cliffordchance.com/insights/resources/blogs/regulatory-investigations-financial-crime-insights/2026/05/fca-streamlines-senior-managers-and-certification-regime.html, May 2026. The timings are panel knowledge.
  - **GP:** FCA *Conduct Rules*, 29 March 2023, https://www.fca.org.uk/firms/senior-managers-certification-regime/conduct-rules; current Handbook SUP 15.11 as at September 2026. GP tokens: turn0search29, turn0search9, turn14view3 `[ref-incomplete]`.
  - **GM:** marker 43 `[ref-incomplete]`.
- **Product implication:**
  - Treat notifications as one-to-many children of an incident, not as one reported-or-not flag (GP).
  - Link conduct cases to HR outcomes, with configurable timers (OP).
- **Panel disagreement:** None.

### M-C-06 — SARs to the NCA use a suspicion test, not a board materiality test

- **Source IDs:** C-OP-07, C-GP-05, C-GM-01e
- **Convergence:** `[3-source]`
- **Tags:** OP `[unverified]` on statute citations. GM's section numbers are `[unverified]`.
- **Finding:**
  - In the regulated sector, suspected money laundering or terrorist financing must be reported to the NCA through a SAR.
  - Cited legal bases:
    - Proceeds of Crime Act 2002, with GM citing ss.330–331;
    - Terrorism Act 2000.
  - The nominated officer (MLRO, SMF17) must report "as soon as practicable" (GM).
  - The MLRO also reports annually to the firm (OP).
  - A SAR decision is a different test from Principle 11 materiality. A small transaction can still be suspicious enough to report (GP).
  - Data points:
    - Metro filed 153 SARs after its review (OP, GM) and closed 43 accounts (GM).
    - In Starling's VREQ breach cohort, 161 customers had previously been the subject of a SAR (OP).
    - CB Payments filed 62 SARs (GM) `[scope]`.
- **Evidence and citations:**
  - **OP:** Objectivus, https://objectivus.com/review-of-fca-final-notice-on-metro-bank-plc-2/, November 2024.
  - **GP:** NCA, *Money laundering and illicit finance — Suspicious Activity Reports*, 2026, https://www.nationalcrimeagency.gov.uk/what-we-do/crime-threats/money-laundering-and-illicit-finance. GP token: turn25search1 `[ref-incomplete]`.
  - **GM:** marker 9 `[ref-incomplete]`.
- **Product implication:**
  - Keep the SAR workflow separate, access-restricted, and outside regulator-materiality logic.
  - Link a SAR to the underlying issue where appropriate.
- **Panel disagreement:** None.

### M-C-07 — Sanctions breaches are reported to OFSI and data breaches to the ICO

- **Source IDs:** C-GM-01f
- **Convergence:** `[single]`
- **Tags:** `[unverified]`
- **Finding:**
  - Under the Sanctions and Anti-Money Laundering Act 2018, suspected sanctions breaches or frozen assets must be reported to OFSI immediately. GM says Starling did this in September 2024 after its screening lookback.
  - Under UK GDPR Article 33, personal data breaches that risk individuals' rights and freedoms must be reported to the ICO within 72 hours.
- **Evidence and citations:** GM markers 6 and 37 `[ref-incomplete]`.
- **Product implication:** Add OFSI (immediate) and ICO (72 hours) clocks to the notification triage engine.
- **Panel disagreement:** None recorded.

### M-C-08 — Starling's late report of a VREQ breach was held against it

- **Source IDs:** C-OP-02
- **Convergence:** `[single]`
- **Tags:** None (Final Notice facts as quoted by OP)
- **Finding:**
  - Starling found a VREQ breach on 21 July 2022 and fixed it within a day.
  - It told the FCA on 24 August 2022. The FCA recorded its "disappointment that Starling did not immediately report".
  - Starling had not adequately conveyed a November 2018 internal audit report "to either Starling's Board or the Authority".
- **Evidence and citations:** FCA Final Notice, Starling Bank Limited, https://www.fca.org.uk/publication/final-notices/starling-bank-limited-2024.pdf, 27 September 2024.
- **Product implication:** Timestamp awareness, decision and notification, and track "days to notify" as a KRI.
- **Panel disagreement:** See M-C-09 and M-C-11. GM describes a separate Starling notification that was credited, which is a different incident.

### M-C-09 — Starling's prompt report of its sanctions-screening gap was credited

- **Source IDs:** C-GM-02b
- **Convergence:** `[single]`
- **Tags:** `[near-dup]` with M-C-08 (same firm, different incident)
- **Finding:**
  - In January 2023 Starling's second line found that automated screening had generated zero alerts for individuals since July 2022, because of a 2017 UK-residency filter.
  - Starling reconfigured and tested the system on 10 February 2023 and notified the FCA on 16 February 2023.
  - It finished re-screening 3.5 million customers by 24 February 2023.
  - GM says this earned explicit credit for proactive co-operation in the Final Notice (para 2.11).
- **Evidence and citations:** BankingNewsAI / FCA, *Starling 2024 FCA Automated Sanctions Screening* (02 October 2024, reviewed 21 October 2026), https://www.bankingnewsai.com/ai-incidents/starling-2024-fca-automated-sanctions-screening. GM marker 6 `[ref-incomplete]`. Paragraph reference `[unverified]`.
- **Product implication:** Use the contrast with M-C-08 in demos: fast, evidenced notification is credited.
- **Panel disagreement:** None recorded.

### M-C-10 — Metro took about two years from first flag to notifying the FCA

- **Source IDs:** C-GM-02c, with corroborating context in M-B-20
- **Convergence:** `[single]` for the notification dates
- **Tags:** None
- **Finding:**
  - Staff flagged "Bad Data" rejections in 2017.
  - A report confirmed the scale in April 2018.
  - The timestamp coding error was found on 17 April 2019.
  - The FCA was notified on 29 May 2019.
  - GM links this delay to the £16.67 million penalty.
- **Evidence and citations:** GM marker 10 `[ref-incomplete]`; LearnSignal Metro guide (see M-B-20).
- **Product implication:** Measure time from first internal flag to notification.
- **Panel disagreement:** None recorded.

### M-C-11 — Consequences of under-reporting and over-reporting, and regulator read-across

- **Source IDs:** C-OP-08, C-GP-06, C-GM-02d
- **Convergence:** `[3-source]`
- **Tags:** `[inference]` and `[practice-not-rule]` for the over-reporting analysis. GM's supervisory "watch-list" consequence is `[inference]` `[single]`.
- **Finding:**
  - **Under-reporting:**
    - It can be a breach in its own right, separate from the original incident (GP).
    - GM says it turns an inadvertent Principle 2 or 3 failure into a Principle 11 or FR7 breach. It also engages Senior Manager Conduct Rule 3 (reasonable steps to ensure compliance) and Rule 4 (disclosing what the regulator would reasonably expect).
  - **Over-reporting:**
    - No text penalises it (OP, GP). It carries governance costs: supervisory noise, legal effort, inconsistent precedents and defensive behaviour (GP).
    - GM's first-line and CRO panel say defensive over-reporting erodes supervisors' confidence in management. It invites read-across requests and can put the firm on a supervisory watch-list.
  - **The escalation ladder (OP):** supervisory letter, then s166, then VREQ, then enforcement.
    - Starling: s166 on 28 May 2021; VREQ on 17 September 2021.
    - Monzo: VREQ in place from August 2020 to February 2025.
  - **Read-across at Starling (OP):**
    - The FCA asked the board for a "lessons learned" review.
    - The second line found 309 more breaching accounts.
    - The firm re-screened its sanctions history back to 2017.
  - **Read-across is a supervisory technique, not a standalone rule (GP)** `[practice-not-rule]`.
  - **GM:** where the FCA finds an under-reported issue through a multi-firm review, such as the 2021 challenger bank financial crime review, it often triggers a firm-wide read-across s166 or VREQ.
- **Evidence and citations:**
  - **OP:** Mishcon de Reya, https://www.mishcon.com/news/fca-fines-monzo-21-million-for-failings-in-anti-money-laundering-systems-and-controls, July 2025.
  - **GP:** tokens turn14view3, turn15search2 `[ref-incomplete]`.
  - **GM:** marker 6 `[ref-incomplete]`.
- **Product implication:**
  - When an issue is logged, propose read-across on controls with the same design or data feed (OP).
  - Prompt read-across before the regulator asks (GM).
  - Record the read-across population (GP).
- **Panel disagreement:** OP and GP say over-reporting carries no regulatory penalty. GM's panel says it brings supervisory consequences. These are compatible: neither side cites a penalty rule, and GM's claim is an inference about supervisor behaviour.

### M-C-12 — A defensible human decision step for the "reportable or not" call

- **Source IDs:** C-OP-09, C-GP-07, C-GM-02e
- **Convergence:** `[3-source]`
- **Tags:** `[inference]` `[practice-not-rule]`
- **Finding:** All three engines describe a contemporaneous, auditable record with a named human decision-maker. It matters most when the decision is not to report (GM).

| Element | OP | GP | GM |
|---|---|---|---|
| Named decision-maker | SMF16, plus SMF4 or SMF17 depending on the matter | Accountable SMF | SMF4 or SMF16 sign-off |
| Facts known at the time | — | Yes | Yes, at that timestamp |
| Test against each limb of SUP 15.3 and FR7 | Yes | Potentially applicable rules | Specific SUP 15 / FR7 criteria evaluated |
| Impact assessment (customer, financial, system, control) | — | Yes | Structured materiality assessment |
| Similar events or read-across | — | Whether similar events exist | Automatic read-across prompt |
| Legal, compliance or MLRO advice | — | Yes | — |
| Rationale | Implicit | Decision and rationale | Rationale for concluding the threshold was not met |
| Timestamps | Yes | Yes | Yes |
| Recorded dissent or counter-argument | Recorded dissent | Counter-argument (C-GP-06) | — |
| Notification deadline | — | Yes | Countdown clocks |
| Re-test when facts change | Yes | Later facts that could reopen the decision | Re-evaluation date if remediation stalls |
| Escalation to the chair on threshold matters | Yes | — | — |
| Regulator contact | — | Yes (C-GP-06) | — |

- **Evidence and citations:**
  - **OP:** at Starling, senior managers "had different understandings of whom… had responsibility for the VREQ".
  - **GP:** an inference from the open and co-operative standard and the FCA's emphasis on accountability. GP tokens: turn14view3, turn19view3 `[ref-incomplete]`.
  - **GM:** LearnSignal, *CB Payments FCA Fine Guide* (22 October 2026), https://www.learnsignal.com/blog/cb-payments-fca-final-notice-voluntary-requirement-high-risk-customer-onboarding-failures-guide/. GM marker 9 `[ref-incomplete]`.
- **Product implication:**
  - Make the decision record immutable and exportable (OP).
  - AI may prepare and challenge the reportability case, but a named human owns the final decision on consequential notifications (GP).
  - Log "near-miss / not reportable" decisions with SMF sign-off (GM).
- **Panel disagreement:** GM's NED stresses that a decision *not* to report is the one that most needs defending. GP's panel would let AI prepare the case but not decide it. Neither contradicts the other.

### M-C-13 — One event can trigger several notifications with different clocks and owners

- **Source IDs:** C-GP-04, C-GM-01 (triage table), C-OP-03
- **Convergence:** `[3-source]`
- **Tags:** `[inference]` for the design pattern. Each clock is sourced in its own finding.
- **Finding:** A single incident may need all of the following, each with its own owner and evidence:
  - an immediate SUP 15 / Principle 11 notification;
  - a separate PRA FR7 judgement;
  - an SMCR Conduct Rule notification within days, or in the annual REP008;
  - a SAR to the NCA as soon as practicable;
  - an immediate OFSI report;
  - an ICO notification within 72 hours;
  - after 18 March 2027, an incident report under PS26/2 / PS7/26.

  GM's notification table, recorded as stated:

| Regime and rule | Authority | Trigger | Timeline (GM) |
|---|---|---|---|
| FCA Principle 11 and SUP 15.3.1R | FCA | Serious regulatory impact, significant rule or VREQ breach, significant fraud or control failure | Immediately on awareness or reasonable suggestion |
| PRA Fundamental Rule 7 | PRA | Safety-and-soundness events, capital or liquidity triggers, prospective booking changes | Immediately, or well in advance for prospective changes |
| SMCR conduct breach (SUP 15.11) | FCA and PRA | Disciplinary action for a COCON / Conduct Rule breach | 7 business days for SMFs (Form C/D); annually (REP008) for non-SMFs |
| Operational incident and outsourcing (SS1/21, SS2/21, PS16/24) | FCA and PRA | Impact tolerance breach or material third-party failure | Immediately, with staged reports (see M-C-04 conflict) |
| Financial crime and data privacy (POCA, SAMLA, UK GDPR) | NCA, OFSI, ICO | Suspicion, suspected sanctions breach, personal data breach | As soon as practicable; immediately; within 72 hours |

- **Evidence and citations:** As in M-C-01 to M-C-07.
- **Product implication:** Build a "Regulatory notification triage engine" that maps each logged failure, incident or breach to every applicable trigger and clock (GM, GP).
- **Panel disagreement:** None.

---

## D — Accountability: SMCR, risk owners and control owners

### M-D-01 — SMCR is built to allocate accountability to named individuals

- **Source IDs:** D-OP-01, D-GP-01, D-GP-02, D-GM-01a
- **Convergence:** `[3-source]`
- **Tags:** OP `[unverified]` on section numbers. GM's Handbook references are recorded as stated.
- **Finding:** SMCR has these parts:
  - Statements of Responsibilities (SoRs);
  - Management Responsibilities Maps (MRMs);
  - prescribed responsibilities;
  - the Certification Regime;
  - the Conduct Rules;
  - the Duty of Responsibility (FSMA s66A/66B), judged against a "reasonable steps" standard.

  It is designed to make responsibility for key risks and decisions identifiable at the top of the firm. It does not make an SMF automatically liable for every failure beneath them. The test is whether they took reasonable steps (GP, GM).
- **Evidence and citations:**
  - **OP:** at Starling there was "no single person with sufficient authority and oversight" for the VREQ.
  - **GP:**
    - HM Treasury describes the objectives as clear allocation of responsibilities, individual accountability for key risks and robust oversight of senior decision-makers. Source: *Reforming the Senior Managers & Certification Regime: Consultation Response*, 22 April 2026, https://www.gov.uk/government/consultations/consultation-reforming-the-senior-managers-certification-regime/outcome/reforming-the-senior-managers-certification-regime-consultation-response.
    - The FCA Conduct Rules guidance gives, as an example of failure, not taking reasonable steps to allocate responsibilities clearly or implement adequate controls. Source: FCA Handbook COCON 4.2, https://handbook.fca.org.uk/handbook/COCON/4/2.html.
    - GP tokens: turn14view2, turn0search37 `[ref-incomplete]`.
  - **GM:**
    - Every SMF has a single statutory SoR (SUP 10C.11). GM lists the SMFs: CEO SMF1, CFO SMF2, CRO SMF4, Head of Internal Audit SMF5, Chair of Risk Committee SMF10, Chair of Audit Committee SMF11, Compliance Oversight SMF16, MLRO SMF17.
    - SoRs include prescribed responsibilities under SYSC 24.2, for example PR (d): policies and procedures against financial crime.
    - SoRs are aggregated into an MRM under SYSC 25.
    - FSMA s.66A(5) sets the Duty of Responsibility.
    - At Monzo, the Final Notice (07 July 2025) found it was unclear who was accountable for aspects of the VREQ.
    - Sources: Norton Rose Fulbright, *Notice in a nutshell: Bank fined for financial crime failings (Monzo Bank Limited)*, https://connections.nortonrosefulbright.com/post/102kv0z/notice-in-a-nutshell-bank-fined-for-financial-crime-failings; Greenberg Traurig, https://www.gtlaw-londonlawblog.com/2024/10/uk-enforcement-agencies-crack-down-on-financial-crime-control-failures-sanctions-violations/. GM markers 29 and 42 `[ref-incomplete]`.
- **Product implication:**
  - Bind every metric, policy and VREQ to an SoR, and show unmapped items in red (OP).
  - Every risk, metric, control, issue and obligation should resolve to a named person (GP).
  - Generate a timestamped "reasonable steps evidence pack" of challenges, escalations and resource requests (GM).
- **Panel disagreement:** None.

### M-D-02 — SMCR reform timeline, 2023 to 2027

- **Source IDs:** D-OP-02, D-GP-01, D-GP-03, D-GP-04, D-GM-01b
- **Convergence:** `[3-source]` that reform is streamlining SMCR while keeping its core. Individual milestones vary by engine.
- **Tags:** Phase 2 (CP14/26) is `[single]` (GP). DP1/23 is `[single]` (GM).
- **Finding:** The merged timeline:

| Date | Event | Engine |
|---|---|---|
| 30 March 2023 | FCA and PRA joint discussion paper DP1/23 / DP23/1, *Review of the Senior Managers and Certification Regime*, alongside an HM Treasury call for evidence after the Edinburgh Reforms | GM |
| 15 July 2025 | HM Treasury, FCA (CP25/21) and PRA (CP18/25) consult | OP |
| July 2025 | FCA non-financial misconduct rules and COCON updates | GM (see M-F-05) |
| 7 October 2025 | Consultations close | OP |
| 22 April 2026 | HM Treasury consultation response, including the proposal to remove the Certification Regime from primary legislation | GP |
| April 2026 | Phase 1 rules, FCA PS26/6 and PRA PS12/26: guidance on SMF7 and SMF18, flexibility on the 12-week rule, more time for SoR updates, streamlined annual certification | OP |
| April 2026 | Further COCON / non-financial misconduct updates | GM |
| 30 July 2026 | Directory changes take effect | OP |
| 23 October 2026 | PRA CP14/26, *Review of the SM&CR — Phase 2*. Almost half of PRA SMFs would move from pre-approval to firm notification, including the Chairs of Risk and Audit Committees. PRA certification requirements would be removed for about 7,700 people. The joint announcement estimates a 43% cut in PRA pre-approvals and roughly halving the PRA regime's burden | GP |
| 22 January 2027 | CP14/26 consultation closes | GP |
| H2 2027 | Expected Phase 2 implementation, subject to legislation | GP |
| No date set | HM Treasury removes the Certification Regime from legislation "when Parliamentary time allows" | OP |

- **Evidence and citations:**
  - **OP:**
    - FCA PS26/6, https://www.fca.org.uk/publications/policy-statements/ps26-6-senior-managers-certification-regime-review, April 2026.
    - PRA PS12/26, https://www.bankofengland.co.uk/prudential-regulation/publication/2026/april/review-of-the-smcr-phase-1-policy-statement, April 2026.
  - **GP:**
    - PRA CP14/26, 23 October 2026, https://www.bankofengland.co.uk/prudential-regulation/publication/2026/october/review-of-the-smcr-phase-two-consultation-paper.
    - Bank of England / FCA, *Regulators unveil plans to simplify Senior Manager and Certification Regime*, October 2026.
    - HM Treasury, 22 April 2026.
    - GP tokens: turn14view0, turn14view1, turn14view2 `[ref-incomplete]`.
  - **GM:** marker 43 `[ref-incomplete]`. GM gives no URL for DP1/23.
- **Product implication:**
  - The SMF and SoR structure is stable, but certification and pre-approval are changing (OP).
  - Treat SMCR mappings as versioned regulatory metadata (GP).
- **Panel disagreement:** None. OP's research predates or missed the 23 October 2026 Phase 2 paper.

### M-D-03 — There is no requirement for six-monthly SMF certification to the regulator

- **Source IDs:** D-OP-03, D-GP-03, D-GM-02
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]` for the six-monthly attestations that do exist
- **Finding:**
  - **The claim conflates two regimes.** The Certification Regime covers staff below SMF level. Firms, not the regulator, certify those staff annually (OP, GP, GM). GM cites FSMA s.63F and SYSC 27.
  - **What does exist for SMFs:**
    - firms assess SMF fitness and propriety on an ongoing basis (OP) or at least annually (GM);
    - SoRs are resubmitted when they change (OP);
    - the Consumer Duty board report and the MLRO report are annual (OP);
    - the REP008 return is annual (GM).
  - **Why practitioners recall a six-monthly cycle (GM):**
    1. **Internal attestation.** Firms run six-monthly risk and control attestations aligned to interim and full-year results. SMFs and first-line executives certify internally to the CEO, CRO and BRC that their SoR is accurate, RCSA controls are tested and breaches are escalated `[practice-not-rule]`.
    2. **Bespoke supervisory attestation.** Under heightened supervision, a VREQ or s166 remediation, the FCA or PRA often requires periodic quarterly or six-monthly attestations from an accountable SMF direct to the supervisor `[practice-not-rule]` `[single]`.
- **Evidence and citations:**
  - **OP:** BDO, https://www.bdo.co.uk/en-gb/insights/industries/financial-services/hmt-fca-pra-consultations-on-sm-cr-reform-practical-implications, 2025.
  - **GP:** HM Treasury, 22 April 2026, which describes annual recertification. GP token: turn14view2 `[ref-incomplete]`.
  - **GM:**
    - The FCA Final Notice to Starling (02 October 2024) is cited as referencing periodic VREQ compliance reporting to the Authority.
    - Skipton Group *Half-Yearly Financial Report 2024* (Directors' Responsibility Statement), https://www.skipton.co.uk/content/dam/sbs-sites/skipton-co-uk/documents/about-us/financial-results/2024/half-yearly-financial-results-2024.pdf.
    - GM markers 6, 11 and 14 `[ref-incomplete]`.
- **Product implication:**
  - Offer configurable attestation cycles labelled as firm practice.
  - Default to six-monthly and annual internal cycles.
  - Provide an exportable supervisory attestation template for firms under a VREQ or s166 (GM).
  - Do not encode a fictional six-month regulatory attestation (GP).
- **Panel disagreement:** GM tags this finding `[conflict]` internally. Across engines the verdict is unanimous.

### M-D-04 — Risk owner and control owner are different roles

- **Source IDs:** D-OP-04 (definitions), D-GP-05, D-GM-03a
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`
- **Finding:**
  - **Risk owner:** accountable for keeping the risk within appetite and for risk-taking decisions. Usually a senior first-line executive, often an SMF or a direct report, such as the Managing Director of Retail Mortgages or the Head of Savings (GM).
  - **Control owner:** accountable for the design, operation and evidence of a specific preventive or detective control. Examples are the Head of Financial Crime Operations, who runs screening queues, and the Core Banking Engineering Lead, who manages data-feed scripts (GM).
  - **Performer:** executes the control (OP) `[single]`.
  - One risk owner usually depends on many control owners (GP).
  - Conflating risk owner and control owner is a foundational flaw in mid-tier systems (GM).
- **Evidence and citations:**
  - **GP:** Leeds' first line executes strategy, manages risks and critical controls, defines and adopts appetite, and reports risk. The risk function oversees and challenges rather than owning the business (Leeds, 26 February 2026; token turn23view1 `[ref-incomplete]`).
  - **GM:** aligned to ISO 31000 and the IIA model. Source: Protecht Academy UK RCSA page. GM marker 3 `[ref-incomplete]`.
- **Product implication:** Never use one generic "owner" field for risk, control, data and action (GP).
- **Panel disagreement:** None.

### M-D-05 — Ownership by journey versus by function, and what a risk owner must be able to see

- **Source IDs:** D-OP-04 (line of sight), D-GP-06, D-GM-03b
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`, `[inference]`. CB Payments evidence is `[scope]`.
- **Finding:**
  - Horizontal owners, by journey or product, see outcomes. Vertical owners, by function, own controls.
  - When ownership is assigned only by function, gaps open at the hand-offs. A customer onboarding journey crosses marketing, digital engineering, credit underwriting, financial crime screening and customer operations (GM).
  - When ownership is mis-assigned, complaints cluster on journeys that have no single owner (OP) `[inference]`.
  - A risk owner's line of sight should include the merged list below.

| Line-of-sight item | Engines |
|---|---|
| Complaints and root-cause trends along the journey | OP, GP, GM |
| Incidents and operational errors | OP, GP, GM |
| Technology changes to parameters, rule logic, thresholds and data feeds | OP, GP, GM |
| Audit findings | OP |
| Restrictions such as VREQs | OP |
| Manual overrides, such as manual credits by customer service | GP, GM |
| Control exceptions | GP |
| Rejected data records and "bad data" folders | GM |
| Customer outcomes | GP |

  A static quarterly RCSA workshop is not enough (GM).
- **Evidence and citations:**
  - **OP:**
    - Starling's engineers "were not informed of the existence of the VREQ".
    - Metro staff flagged data gaps in 2017 and 2018, which were not fixed until 2019–2020.
    - Source: Lexology, November 2024.
  - **GP:**
    - Product sets the commercial rule, technology changes a parameter, operations executes it, complaints see the outcome, and compliance sees only the rule.
    - FCA, *Consumer understanding: good practice and areas for improvement*, 13 March 2026.
    - The FCA AI good-practice review (19 October 2026) warns that ownership fragmented across technology and business teams weakens accountability.
    - GP tokens: turn25search10, turn19view3 `[ref-incomplete]`.
  - **GM, three Final Notices:**
    - CB Payments (23 July 2024):
      - 1,034 customers migrated from other group entities bypassed the onboarding risk flag;
      - a new service let flagged customers trade for four months;
      - customer service manually credited e-money to 199 restricted customers.
    - Starling (02 October 2024):
      - a configuration set in July 2017 limited sanctions screening to UK citizens or residents, covering 39 of 3,088 designated persons;
      - a separate control failure let 294 customers previously exited for financial crime reasons open new accounts.
    - Metro (12 November 2024): a timestamp logic error excluded same-day accounts (166,358 accounts) from automated transaction monitoring.
    - Sources: LearnSignal CB Payments guide (22 October 2026); FCA Final Notices; Protecht Academy UK. GM markers 3, 6, 9, 10 and 36 `[ref-incomplete]`.
- **Product implication:**
  - Model ownership on two axes, linking journey or product risk owners to functional control owners.
  - Feed IT rule and parameter change logs, reconciliation counts, manual overrides and journey complaints into the risk owner's view (GM).
  - Flag where the two axes diverge (GP).
- **Panel disagreement:** None.

### M-D-06 — Monthly human attestation that data is correct

- **Source IDs:** D-OP-05, D-GP-07, D-GM-04
- **Convergence:** `[3-source]` that this is not a regulatory requirement
- **Tags:** `[practice-not-rule]`. `[unresolved-conflict]` on whether it is mature-firm practice and whether it is shown to improve accountability (see CF-13).
- **Finding:**
  - No FCA or PRA rule requires risk owners to attest monthly that reported data is correct (OP, GP).
  - GM says mature UK banks and building societies do run monthly data-completeness and metric attestation. Before the monthly executive risk pack is locked, the control owner and risk owner sign off the metric value and the reconciliation showing that 100% of source records reached the monitoring system.
  - GP: frequency and population vary. The sources support ownership and reliable MI, but do not show that monthly attestation itself improves outcomes `[single]`.
  - OP: Starling added "daily testing and assurance activity" from 17 January 2023 and "automated daily controls" by 31 May 2023. Metro lacked checks "on an ongoing basis, that data was being correctly processed".
  - Metro and Starling show that automated dashboards can show green simply because the underlying feed is broken or filtering out exceptions ("silent failure") (GM).
- **Evidence and citations:**
  - **OP:** Final Notice facts as quoted. OP tags this `[single]`.
  - **GP:** no source cited beyond practice.
  - **GM:** BankingNewsAI, *FCA fines Metro Bank £16.7m after its automated transaction monitoring missed 60m transactions* (12 November 2024, reviewed 21 October 2026), https://www.bankingnewsai.com/ai-incidents/metro-bank-2024-fca-automated-transaction-monitoring. GM markers 10 and 40 `[ref-incomplete]`.
- **Product implication:**
  - Have owners attest to a specific reconciliation result, not a bare value (OP, GM).
  - Pair each automated feed with a source-to-target completeness check (GM).
  - Make attestation configurable, with exception-based challenge, rather than presenting it as a compliance claim (GP).
- **Panel disagreement:**
  - OP: the first line warns of rubber-stamping; the enforcement adviser says attestations evidence "reasonable steps".
  - GM: the NED says a name and timestamp beside each metric sharpens accountability and removes the excuse that "IT generated it".

---

## E — Three lines of defence

### M-E-01 — The IIA Three Lines Model (2020) and how UK regulators use it

- **Source IDs:** E-OP-01, E-GP-01, E-GM-01
- **Convergence:** `[3-source]`
- **Tags:** OP `[unverified]` (IIA text not fetched). Minor `[conflict]` on the publication date (see CF-14).
- **Finding:**
  - The IIA model puts the governing body at the top, management in the first- and second-line roles, and internal audit as the independent third line. What matters is the independence relationship, not the labels (GP).
  - GM frames the lines by decision authority:
    - the first line makes decisions and owns and manages risk;
    - the second line improves decision quality, sets the framework, challenges and aggregates;
    - the third line gives independent assurance over decision-making and reports directly to the Audit Committee.
  - UK enforcement and supervisory material still uses "three lines of defence" (OP), or uses both terms interchangeably (GM).
  - GM notes some regulators have formally adopted "Three Lines Model" wording, for example the Reserve Bank of New Zealand in its 2026 guidance `[single]`.
- **Evidence and citations:**
  - **OP:** the Starling Final Notice found all three lines "inadequate in their oversight"; the third line "was unaware of the VREQ until late 2022". OP dates the model July 2020.
  - **GP:** IIA, *The IIA's Three Lines Model*, 08 September 2020, updated 2024, https://www.theiia.org/globalassets/documents/resources/the-iias-three-lines-model-an-update-of-the-three-lines-of-defense-july-2020/three-lines-model-updated-english.pdf. GP tokens: turn1view1, turn0search15 `[ref-incomplete]`.
  - **GM:** July 2020. Protecht UK, *The Three Lines Model: Internal Audit vs Risk Management* (2026), https://www.protechtgroup.com/en-gb/blog/the-three-lines-model-internal-audit-risk-management, citing the IIA model and the BCBS Corporate Governance Principles (2015). GM markers 6 and 8 `[ref-incomplete]`.
- **Product implication:**
  - Keep the roles separate in permissions and workflow, and do not let the second line quietly become the operational owner (GP).
  - Provide distinct workspaces for each line on a shared taxonomy (GM).
  - Show where second-line challenge and third-line coverage are missing (OP).
- **Panel disagreement:** None.

### M-E-02 — Leeds Building Society is a clean UK example of the three lines

- **Source IDs:** E-GP-02, D-GP-05
- **Convergence:** `[single]`
- **Finding:**
  - First line: executes strategy, manages risks and critical controls, defines appetite, complies with policies and reports risk.
  - Second line: maintains the ERMF, co-ordinates appetite and policy, identifies emerging risks, produces enterprise reporting and provides independent oversight.
  - Third line: gives independent, risk-based assurance over the first and second lines.
  - The CRO leads the Risk Division, reports to the CEO, and has independent access to the BRC chair (GP J-GP-03).
- **Evidence and citations:** Leeds, 26 February 2026. GP token: turn23view1 `[ref-incomplete]`.
- **Product implication:** Each metric shows its owner, challenger and assurer, not just an "owner".
- **Panel disagreement:** None.

### M-E-03 — Typical metric suites for each line

- **Source IDs:** E-OP-02, E-GP-03, E-GM-02
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`, `[inference]`. GM's self-identification ratio is `[single]`.
- **Finding:**

| Line | OP | GP | GM |
|---|---|---|---|
| First (business, operations, IT; COOs, CCOs, product MDs) | Control performance, KRIs, RCSA completion, backlogs, complaints | Business KPIs, operational KRIs, control performance, exceptions, customer outcomes, loss and event data | Operational KRIs and KCIs: RCSA pass and fail rates, onboarding volumes and drop-offs, reconciliation counts, patching SLAs, manual override counts, support SLAs, first-stage complaint resolution times. Reported to divisional risk forums and the ERC |
| Second (CRO SMF4, Compliance SMF16, MLRO SMF17) | Appetite utilisation, policy breaches, assurance results | Aggregate appetite measures, cross-business trends, challenge indicators, framework compliance, emerging-risk metrics | Level 1 and Level 2 limit utilisation, ICAAP and ILAAP stress buffers, thematic monitoring pass rates, VREQ assurance metrics, SAR volumes and quality, SS1/23 model validation pass rates, overdue risk actions. Reported to the ERC and BRC, with direct access to the BRC chair (SMF10) |
| Third (Head of Internal Audit SMF5) | Plan completion, overdue and repeat findings, coverage | Audit coverage, assurance ratings, overdue high-risk findings, thematic control-effectiveness evidence | Plan completion, distribution of audit ratings, repeat or reopened findings, overdue high-priority issues, and a management self-identification ratio: the share of issues found by the first or second line before audit. Reported to the Board Audit Committee (SMF11), with an administrative line to the CEO |

- **Evidence and citations:**
  - **GP:** IIA; Leeds. GP tokens: turn1view1, turn23view1 `[ref-incomplete]`.
  - **GM:** Protecht UK (2026); Centraleyes, *6 Best Operational Risk Management Software Platforms in 2026*, https://www.centraleyes.com/6-best-operational-risk-management-software-platforms-in-2026/. GM markers 3, 4, 5, 8 and 10 `[ref-incomplete]`.
- **Product implication:**
  - Provide default dashboards for each line (OP).
  - Store which line each metric comes from, and warn where assurance independence is compromised (GP).
  - Track the self-identification ratio as an objective measure of first-line maturity (GM).
- **Panel disagreement:** None.

### M-E-04 — Internal audit must not own the business metrics it audits

- **Source IDs:** E-GP-03, E-GM-01 (independence)
- **Convergence:** `[2-source]`
- **Tags:** `[inference]`
- **Finding:**
  - GP: internal audit should not own a business-risk metric that it will later need to audit.
  - GM: the FCA and PRA hold that the second and third lines must stay operationally independent of first-line revenue generation.
- **Evidence and citations:** GP tokens turn1view1, turn23view1 `[ref-incomplete]`; GM marker 6 `[ref-incomplete]`.
- **Product implication:** Warn when a third-line user owns a metric in their own audit universe.
- **Panel disagreement:** None.

### M-E-05 — In fast-growing firms, controls did not keep pace with growth

- **Source IDs:** E-OP-03, E-GP-04, E-GM-03a, A-GM-04d
- **Convergence:** `[3-source]`
- **Tags:** None for the Final Notice facts. `[inference]` for the interpretation.
- **Finding:** Rapid commercial scaling outran the maturity of all three lines.
  - **Starling:** grew "from approximately 43,000 customers in 2017 to 3.6 million in 2023" while "measures to tackle financial crime did not keep pace with its growth". The fine would have been £40,959,426 before the 30% discount (OP, GM).
  - **Monzo:** grew from about 600,000 customers in 2018 to more than 5.8 million in 2022 (OP, GP).
  - **FCA challenger bank review (22 April 2022):** controls must be "commensurate with a bank's expansion" (OP).
  - **GP:** these are not only second-line compliance failures. The first-line proposition, onboarding logic and operating model grew faster than the control environment could safely support `[inference]`.
  - **GM:** in fast-growing challengers, product and engineering teams often hand first-line ownership to Compliance and launch products or change onboarding logic without a first-line risk assessment. Example: Coinbase Pro in the CB Payments case `[scope]`.
- **Evidence and citations:**
  - **OP:** FCA press release, https://www.fca.org.uk/news/press-releases/fca-fines-monzo-21m-failings-financial-crime-controls, 8 July 2025; FCA press release of 2 October 2024 (Starling).
  - **GP:** FCA Starling press release, 02 October 2024, https://www.fca.org.uk/news/press-releases/fca-fines-starling-bank-failings-financial-crime-systems-and-controls; FCA Monzo, 08 July 2025. GP tokens: turn9search0, turn9search1 `[ref-incomplete]`.
  - **GM:** markers 9 and 11 `[ref-incomplete]`.
- **Product implication:**
  - Make control capacity normalised for growth a Level 1 indicator (OP).
  - Show growth metrics and control-capacity metrics together on the appetite view (GP).
- **Panel disagreement:** None.

### M-E-06 — The second line was under-resourced and under-skilled for the firm's growth

- **Source IDs:** E-GM-03b
- **Convergence:** `[single]`
- **Tags:** The Sonali Bank 2016 precedent is `[scope]`.
- **Finding:**
  - In the Starling Final Notice (02 October 2024, para 4.15), the FCA found that senior management lacked the AML skills, experience and awareness of the VREQ's impact needed to design an adequate VREQ risk framework.
  - In the Sonali Bank precedent (Steven Smith, 2016), cited alongside Starling, the FCA penalised an MLRO who did not make senior management understand how overstretched and under-resourced his department had become.
- **Evidence and citations:**
  - FCA *Final Notice: Starling Bank Limited* (02 October 2024).
  - Stephenson Harwood (02 October 2024).
  - GM markers 11 and 29 `[ref-incomplete]`. The paragraph reference is `[unverified]`.
- **Product implication:** Add a "resource and capability strain indicator" to the SMF4, SMF16 and SMF17 views. It correlates growth in alerts and onboarding with compliance headcount and logs formal resource requests to the board (GM).
- **Panel disagreement:** None recorded.

### M-E-07 — Fast-growing firms relied on occasional external reviews instead of continuous assurance

- **Source IDs:** E-GM-03c
- **Convergence:** `[single]`
- **Finding:**
  - Monzo received a third-party review in late 2019 that flagged transaction monitoring weaknesses.
  - Starling found its 2017 screening bug only during a January 2023 second-line review.
  - In both cases continuous first-line assurance, and internal audit testing of system configurations, were missing during the years of rapid growth.
- **Evidence and citations:** FCA Final Notices; Norton Rose Fulbright, *Monzo Bank Limited Final Notice Summary* (07 July 2025). GM marker 6 `[ref-incomplete]`.
- **Product implication:** Provide continuous control monitoring, so that assurance does not depend on periodic external reviews.
- **Panel disagreement:** None recorded.

### M-E-08 — Audit findings did not reach the board; the audit committee needs a direct line

- **Source IDs:** E-OP-04, E-GP-01, E-GM-01
- **Convergence:** `[3-source]` that internal audit reports directly to the audit committee. `[single]` (OP) for the Starling 2018 audit facts.
- **Tags:** OP `[unverified]`
- **Finding:**
  - Starling's 2018 audit gaps were not passed to the board (OP).
  - The audit committee's direct line to internal audit comes from the UK Corporate Governance Code and IIA practice (OP).
  - Internal audit gives independent assurance to the governing body (GP).
  - SMF5 reports directly to the Board Audit Committee, chaired by SMF11 (GM).
- **Evidence and citations:** OP, see M-C-08; GP, IIA (08 September 2020); GM marker 8 `[ref-incomplete]`.
- **Product implication:** Track the age of audit findings and escalate automatically.
- **Panel disagreement:** None.

---

## F — Conduct, culture and Consumer Duty

### M-F-01 — The Consumer Duty requires an annual board report on customer outcomes

- **Source IDs:** F-OP-01, F-GP-01, F-GM-01a
- **Convergence:** `[3-source]`
- **Tags:** None for the rule. The publication date of the FCA review differs by engine, but the dates are compatible (see CF-18).
- **Finding:**
  - PRIN 2A requires the governing body to review and approve, at least once a year, a report on how the firm monitors retail customer outcomes and what action it needs to take.
  - GM gives the rule references as PRIN 2A.8.3R to 2A.8.5R.
  - The report must assess:
    - whether customers are receiving good outcomes;
    - whether any groups, especially vulnerable customers, get worse outcomes;
    - the action plan;
    - whether future strategy is consistent with the Duty (GP, GM).
  - GM gives two commencement dates: 31 July 2023 for open products and 31 July 2024 for closed products.
  - GM states the four outcomes as products and services, price and value, consumer understanding, and consumer support.
  - The FCA reviewed first-year board reports from 180 firms (OP, GP).
  - **Good practice (OP):** outcome MI, cohort and vulnerability analysis, and recorded board challenge.
  - **Poor practice found by the FCA:**
    - "poor data quality or missing thresholds" (OP);
    - weak oversight of distribution chains (OP);
    - "action plans without owners, timescales or success metrics" (OP);
    - pre-Duty board MI carried over with minimal change (GM);
    - no statistical thresholds or clear tolerances for what counts as a good outcome (GM);
    - no way to identify shortfalls across customer cohorts (GM);
    - board minutes recording generic satisfaction while ignoring late remediation flagged in lower-level packs (GM);
    - no evidence of active challenge by the board and the Consumer Duty champion (GM).
  - **Year 2 (OP):** some firms "presented extensive data without sufficiently explaining" it.
- **Evidence and citations:**
  - **OP:** FCA, *Consumer Duty board reports: good practice and areas for improvement*, https://www.fca.org.uk/publications/good-and-poor-practice/consumer-duty-board-reports-good-practice-areas-improvement, updated 24 February 2025.
  - **OP:** FCA, *Year 2 Consumer Duty board reports: progress and what comes next*, https://www.fca.org.uk/news/blogs/year-2-consumer-duty-board-reports-progress-and-what-comes-next, 2026.
  - **GP:** the same FCA review, dated 11 December 2024. GP token: turn25search2 `[ref-incomplete]`.
  - **GM:** FCA, *Consumer Duty Board Reports: Good Practice and Areas for Improvement* (December 2024); *Complaints and Root Cause Analysis* (December 2024); *Payments Consumer Duty Multi-Firm Review* (2024/2025), https://www.fca.org.uk/publications/multi-firm-reviews/payments-consumer-duty; *Our Consumer Duty focus areas*, updated 07 May 2026 and 24 September 2026, https://www.fca.org.uk/publications/corporate-documents/consumer-duty-focus-areas.
  - **GM:** YCM UK, *FCA priorities under the Consumer Duty for 2024/25*, https://www.ycmuk.co.uk/fca-priorities-under-the-consumer-duty-for-the-remainder-of-2024-25d11a23fa. GM marker 36 `[ref-incomplete]`.
- **Product implication:**
  - Every outcome metric needs a threshold, an owner, an action, a due date and a success measure (OP).
  - Consumer outcome metrics belong in the board risk architecture, not in a separate compliance silo (GP).
  - Build a "Consumer Duty outcomes and annual board report studio" mapped to the four outcomes (GM).
- **Panel disagreement:** None.

### M-F-02 — Firms struggle to show how outcomes differ across customer groups, including vulnerable customers

- **Source IDs:** F-OP-02, F-GM-01a (cohorts)
- **Convergence:** `[2-source]`
- **Tags:** None
- **Finding:**
  - The FCA's 27 July 2026 review of outcomes monitoring found "limited evidence of how outcomes differ across customer groups".
  - In March 2025, "most firms… were unable to show how they effectively monitor" outcomes for vulnerable customers (OP).
  - Poor-practice firms could not identify outcome shortfalls across cohorts (GM).
- **Evidence and citations:**
  - **OP:** FCA, *Delivering for vulnerable customers*, https://www.fca.org.uk/publications/good-and-poor-practice/delivering-vulnerable-customers, 7 March 2025.
  - **OP:** CMS on the 27 July 2026 review (see M-A-07).
  - **GM:** marker 36 `[ref-incomplete]`.
- **Product implication:** Apply appetite mechanics (thresholds, ambers, owners) to conduct metrics, segmented by cohort and vulnerability.
- **Panel disagreement:** None.

### M-F-03 — The FCA rejects fair value assessments that only benchmark against competitors' fees

- **Source IDs:** F-GM-01b
- **Convergence:** `[single]`
- **Tags:** `[ref-incomplete]`
- **Finding:** In its September 2024 and 2025/26 fair value feedback, the FCA rejected fair value assessments that were only competitor fee benchmarks ("charges are roughly in line with competitors"). It asks firms to:
  - evaluate total lifetime cost against the benefits customers actually receive;
  - assess the quality of non-financial support;
  - have policies to stop charging fees when clients have not used a service for an extended period.
- **Evidence and citations:**
  - GM marker 35.
  - Works cited include Just FA, *Consumer Duty Fair Value Assessments: A Practical Guide for IFAs*, https://justfa.uk/articles/consumer-duty-fair-value-assessments-a-practical-guide-for-ifas. This is outside deposit-taker scope `[scope]`.
- **Product implication:** Track fair value and engagement ratios, for example the share of fee-paying customers with no engagement.
- **Panel disagreement:** None recorded.

### M-F-04 — Owning customer journeys end to end is good practice, not a mandated structure

- **Source IDs:** F-OP-03, F-GP-02, F-GM-01c, D-GP-06
- **Convergence:** `[3-source]`
- **Tags:** `[practice-not-rule]`
- **Finding:**
  - The FCA's good practice is "unambiguous ownership of the consumer understanding outcome… part of the daily inner workings of the firm" (OP).
  - FCA materials stress clear ownership, governance, MI and action across consumer outcomes. Neither the 13 March 2026 consumer understanding review nor the 19 October 2026 AI review requires every firm to appoint a formally titled "customer journey risk owner" (GP).
  - Good-practice firms reorganised outcomes monitoring and complaints root-cause analysis around end-to-end journeys rather than product silos. GM's example journeys are borrowing in financial difficulty, bereavement support, student account onboarding and mortgage maturity internal transfer. These firms linked SLAs and complaints data directly to journey owners (GM).
- **Evidence and citations:**
  - **OP:** TLT, https://www.tlt.com/insights-and-events/insight/fca-publishes-consumer-understanding-good-practice-and-areas-for-improvement, 2025 `[single]` at source level.
  - **GP:** FCA, 13 March 2026 and 19 October 2026. GP tokens: turn25search10, turn19view3 `[ref-incomplete]`.
  - **GM:** marker 36 `[ref-incomplete]`.
- **Product implication:** Let the journey owner also be the horizontal risk owner, while letting firms configure the exact accountability model.
- **Panel disagreement:** None.

### M-F-05 — Measuring culture: speak-up, non-financial misconduct and how fast bad news travels

- **Source IDs:** F-OP-04, F-GP-03, F-GM-02a
- **Convergence:** `[3-source]`
- **Tags:** OP `[practice-not-rule]` `[unverified]`. GP `[inference]` for interpretation.
- **Finding:**
  - **Regulatory developments:**
    - FCA PS25/23 (non-financial misconduct) feeds into the SMCR changes (OP).
    - Between July 2025 and April 2026 the FCA widened COCON and updated its non-financial misconduct regime. It covers bullying, harassment and discrimination, and is now part of fitness and propriety assessments and breach reporting (GM).
    - The FCA's 2024 culture and non-financial misconduct survey covered 1,028 wholesale firms and collected data for 2021–2023 (GP).
  - **Firm examples (GM):**
    - Leeds tracks its "Your Voice" colleague engagement score: 8.4/10, with an 89% response rate across 1,653 respondents in June 2025.
    - Skipton introduced new colleague listening and gender parity metrics in 2025.
  - **Indicators proposed:**
    - Speak-up volumes and anonymity rate (OP).
    - Time to close cases (OP, GP).
    - Retaliation reports (OP, GP).
    - Time from first flag to board, about two years at Metro (OP).
    - Substantiation rate, employee risk survey results, escalation reversals, repeated override behaviour, evidence of senior-management challenge, complaint escalation and recurring conduct events (GP).
    - Whistleblowing volumes under SYSC 18, overseen by the Whistleblowers' Champion (typically an independent NED) (GM).
    - Time to investigate, psychological safety scores, HR grievance and non-financial misconduct disciplinary rates, and completion of training and attestations (GM).
- **Evidence and citations:**
  - **GP:** FCA, *Culture and non-financial misconduct survey — findings*, 25 October 2024, https://www.fca.org.uk/data/culture-non-financial-misconduct-survey-findings. GP token: turn10search17 `[ref-incomplete]`.
  - **GM:** Greenberg Traurig, *Non-Financial Misconduct Under the UK FCA's New Regime* (17 April 2026 and 14 July 2025). The URL given is https://www.gtlaw-londonlawblog.com/2024/10/uk-enforcement-agencies-crack-down-on-financial-crime-control-failures-sanctions-violations/, whose path does not match the stated title `[ref-incomplete]`. GM markers 22, 23, 43 and 56 `[ref-incomplete]`.
- **Product implication:**
  - Use "bad news travel time" as a culture KRI (OP).
  - Culture dashboards should require narrative interpretation, not automatically score more reports as worse (GP).
- **Panel disagreement:** GP notes that rising speak-up volumes can mean a deteriorating culture or a better willingness to report. Interpretation needs human attestation.

### M-F-06 — Some conduct measures come from data; others need human judgement and attestation

- **Source IDs:** F-OP-05, F-GP-04, F-GM-02b
- **Convergence:** `[3-source]`
- **Tags:** `[inference]`
- **Finding:**

| Measurable from data | Needs human judgement or attestation |
|---|---|
| Rates, tolerances, backlogs, coverage (OP) | Whether outcomes are "good"; whether a breach is "significant"; what the culture is; whether MI is complete (OP) |
| Complaints, wait times, dropped journeys, cancellations, vulnerability indicators, overrides, exceptions, control test results, remediation ageing (GP) | Whether board challenge was honest; whether escalation felt psychologically safe; fairness in novel edge cases; conscious acceptance of strategic risk (GP) |
| Speak-up volumes; time to investigate; survey participation and psychological safety by unit; NFM disciplinary rates; training completion; escalation-health metrics such as days from working group to ERC or BRC and count of actions reassigned or dropped from minutes (GM) | Whether zero whistleblowing in a high-growth division means health or fear; whether executive debate allows second-line challenge; whether bonus structures blind management to risks in the most profitable lines (GM) |

  GM adds a point from an operational risk commentator, cited via Risk.net: the risks most likely to strike a firm severely are in its most profitable areas, because high profits blind leadership to control weaknesses `[single]`.
- **Evidence and citations:**
  - **GP:** FCA good practice couples data with governance and human accountability. GP tokens: turn25search2, turn19view3 `[ref-incomplete]`.
  - **GM:** Risk.net, *Identifying and managing emerging operational risks*, https://www.risk.net/risk-management/operational-risk/2393632/identifying-and-managing-emerging-operational-risks; FCA Final Notice to Metro (12 November 2024). GM markers 10, 45 and 48 `[ref-incomplete]`.
- **Product implication:**
  - Make owner commentary and a conclusion mandatory (OP).
  - Build structured attestation alongside the data, not instead of it (GP).
  - Compute an "escalation health and information-flow index" per business unit (GM).
- **Panel disagreement:** None.

---

## G — Policy-to-metric linkage and metric tension

### M-G-01 — Should every policy have a metric?

- **Source IDs:** G-GP-01, G-GM-01a, G-OP-01 (implication)
- **Convergence:** `[3-source]` that policies must be evidenced as implemented and monitored
- **Tags:** `[conflict]` on whether a one-to-one policy-to-metric mapping is required (see CF-15). `[practice-not-rule]`.
- **Finding:**
  - **GM:** in a compliant UK architecture, every internal policy, regulatory requirement and VREQ must map to at least one operational control (tested through RCSA or a KCI) and one outcome metric (a KRI).
  - **GP:** "every policy must have a metric" is too strong. No UK rule requires one-to-one mapping. A policy can be evidenced by a preventive or detective control, sample testing, an approval process, training, an automated rule or qualitative assurance. The stronger proposition is that every material policy obligation needs evidence that it is implemented and monitored.
  - **OP:** each policy statement maps to at least one metric or test. Unmapped statements are a Level 1 gap.
- **Evidence and citations:**
  - **GP:** Nationwide describes appetite supported by detailed metrics, indicators, policies and standards. Leeds reinforces its SRA through policies and standards. GP tokens: turn21view0, turn23view1 `[ref-incomplete]`. GP uses the tag `[partly-supported]`.
  - **GM:** marker 3 `[ref-incomplete]`.
- **Product implication:**
  - Model the chain policy → obligation → control, metric or evidence, with one-to-many and many-to-many links (GP).
  - GM's stricter "zero orphan policies" rule says a policy or VREQ clause cannot go live unless each obligation links to a live control and an adherence metric. Its value should be validated with practitioners.
- **Panel disagreement:** GM presents the mapping as a compliance requirement. GP and OP treat it as good practice. No engine cites a rule.

### M-G-02 — Enforcement shows policies and restrictions that were not tracked or were routinely breached

- **Source IDs:** G-OP-01, G-GP-02, G-GM-01b
- **Convergence:** `[3-source]`
- **Tags:** CB Payments `[scope]`. Monzo count `[conflict]` (see CF-16).
- **Finding:**
  - **Starling:**
    - No "formal monitoring programme" existed for its VREQ (OP).
    - It opened 54,359 accounts for 49,183 high-risk customers in breach of the VREQ (OP, GM). GP gives "more than 54,000 accounts for approximately 49,000".
  - **Monzo:**
    - Its UK-only appetite was not enforced, and customers previously exited for financial crime reopened accounts rated "No Risk Identified" (OP).
    - It breached a restriction meant to stop high-risk onboarding, opening accounts for more than 34,000 high-risk customers (GP). OP records a conflict between "34,000+" and "26,325".
    - Its enhanced due diligence procedure did not say clearly when EDD was required or how to document it (GM).
    - PEPs were not clearly defined at onboarding (GM).
    - Customers could transact before due diligence was complete because policy was not enforced by system gates or tracked by adherence metrics (GM).
  - **Nationwide:** allowed business use of personal accounts "without effective mitigating controls" (OP).
  - **CB Payments (GM)** `[scope]`:
    - the automated flag was coded from an earlier draft of the VREQ, leaving four risk questions unmapped;
    - dashboards tracked whether the flag fired, not whether restricted customers were using services.
  - **Skipton:** strengthened infrastructure at SIL in 2025 in response to historic issues with policies, procedures and risk management (GM).
- **Evidence and citations:**
  - **OP:** SteelEye, https://www.steel-eye.com/news/monzo-fca-fine-financial-crime-vreq-breach, July 2025; Shoosmiths, https://www.shoosmiths.com/perspectives/stories/articles/nationwide-fined-44m-key-lessons-on-financial-crime, December 2025.
  - **GP:** FCA Starling, 02 October 2024; FCA Monzo, 08 July 2025. GP tokens: turn9search0, turn9search1 `[ref-incomplete]`.
  - **GM:** LearnSignal CB Payments guide (22 October 2026); Norton Rose Fulbright Monzo summary (07 July 2025); Skipton *ARA 2025* (February 2026). GM markers 9, 26 and 42 `[ref-incomplete]`.
- **Product implication:**
  - Tie a policy or regulatory restriction to an executable population test that independently checks adherence (GP).
  - Track whether restricted customers actually transact, not just whether a flag fired (GM).
- **Panel disagreement:** None on substance.

### M-G-03 — Some growth and risk metrics are deliberately in tension

- **Source IDs:** G-OP-02, G-GP-03, G-GM-02a
- **Convergence:** `[3-source]`
- **Tags:** `[inference]`
- **Finding:** Restrictive financial crime onboarding reduces exposure but slows acquisition. Looser credit grows the book but uses up loss and capital appetite. Higher liquidity buffers improve resilience but lower returns. These are legitimate trade-offs, not necessarily control failures (GP).

| Tension | Accelerator | Brake | Engines |
|---|---|---|---|
| Onboarding vs financial crime | Account-opening velocity and conversion (GM: e.g. more than 1m accounts a year; 84% buy-to-let conversion) | Share of accounts transacting before CDD; VREQ high-risk breach count, target 0 | OP, GP, GM (`[3-source]`) |
| Credit growth vs credit risk | Share of new lending to first-time buyers (e.g. 50% at Skipton) and high-LTV (above 90%) volume; relaxed credit cut-offs (GP) | Early arrears migration and cost of risk (e.g. 11 bps Nationwide, 51 bps Shawbrook); expected loss and capital use (GP) | GP, GM (`[2-source]`) |
| Liquidity vs return | Return | Higher liquidity buffers | GP (`[single]`) |
| Member pricing vs capital | Savings rate premium above market (e.g. +0.90% at Leeds; £2.3bn sector-wide in 2024) | NIM floor and CET1 / leverage buffers | GM (`[single]`) |
| Vulnerability data vs privacy | Share of vulnerable customers identified and supported | UK GDPR data minimisation and consent audit pass rate | GM (`[single]`) |

  Further evidence:
  - Starling's MI focused on "how the VREQ could be reduced or removed" (OP).
  - On Monzo, the FCA said "rapid customer growth must not come at the detriment of compliance" (OP).
  - An MLRO rule that blocks all complex SME structures would halt legitimate growth (GM).
  - The FCA and ICO have acknowledged in a joint statement that the Consumer Duty expectation to record vulnerability sits in tension with data protection. GM cites this from the FCA's *2025/26 Consumer Duty Focus Areas*.
  - GP proposes paired metric families:
    - growth: approval and conversion, revenue, acquisition;
    - risk: high-risk acceptance, expected loss, fraud loss, SAR and control yield;
    - friction: false positives, manual review, abandonment;
    - capacity: analyst queues, model headroom, capital and liquidity use.
- **Evidence and citations:**
  - **GP:** Leeds and Metro. GP tokens: turn23view1, turn23view2 `[ref-incomplete]`.
  - **GM:** FCA, *Our Consumer Duty focus areas* (24 September 2026); Leeds *Annual Report 2025* (06 March 2026). GM markers 5, 14, 17, 22, 23 and 37 `[ref-incomplete]`.
- **Product implication:**
  - Show the board the efficient frontier, not just whether each metric is green on its own (GP).
  - Provide a "metric tension and trade-off matrix" that flags when a change in one domain pushes a paired domain into amber (GM).
- **Panel disagreement:** None.

### M-G-04 — How deliberate tensions are governed: paired metrics, guardrails and recorded decisions

- **Source IDs:** G-OP-02 (CRO view), G-GP-04, G-GM-02b
- **Convergence:** `[3-source]`
- **Tags:** `[inference]`. GM's methodology attribution is `[ref-incomplete]`.
- **Finding:**
  - **OP (CRO):** use paired metrics with a trade-off the board has agreed, plus a tension register that flags when one metric in a pair improves while the other worsens.
  - **GP:** a defensible trade-off record should state:
    - the conflicting objectives and the metrics affected;
    - the quantified upside and downside;
    - the regulatory floor that cannot be traded away;
    - the decision owner and approval forum;
    - an expiry or review date;
    - a monitoring plan.
  - **GP:** accepting more credit risk deliberately can be legitimate. Accepting non-compliance with a VREQ is not an equivalent strategic choice, as Starling and Monzo show.
  - **GM:** leading UK practice, which GM attributes to GARP and Protecht methodology on "risk appetite driven decision making", uses paired constraint matrices or "guardrail pairs". A growth KPI is paired with its counterbalancing KRI, and the first-line owner may optimise the KPI only while the guardrail stays green. Legacy GRC platforms track metrics in isolated vertical silos.
- **Evidence and citations:**
  - **GM:** GARP / Protecht Group, *Risk Insights: Risk appetite statements must evolve from siloed risk-type thresholds* (October 2026), https://www.garp.org/risk-insights-resources. GM marker 8 `[ref-incomplete]`.
  - **GP:** tokens turn9search0, turn9search1 `[ref-incomplete]`.
- **Product implication:** Make the trade-off decision a first-class object, not something buried in committee minutes (GP).
- **Panel disagreement:** None.

### M-G-05 — No verified tool automatically detects conflicting policies or metrics

- **Source IDs:** G-OP-03, G-GP-05, G-GM-02b / J-GM-03 (competitor table)
- **Convergence:** `[3-source]`
- **Tags:** `[unverified]`, `[inference]`. GP `[single]`.
- **Finding:**
  - **OP:** found no published method or verified vendor feature.
  - **GP:**
    - ServiceNow publicly supports configuring risk appetite and tolerance.
    - Mainstream GRC tools cover risks, controls, issues and dashboards.
    - No incumbent was found publicly demonstrating automatic detection of one metric being optimised at the expense of another. GP stresses this is an absence of evidence.
  - **GM:** in its competitor table, every platform is "No" on metric-tension analysis. Protecht's work with GARP is "emerging conceptual thought leadership", not an automated engine.
- **Evidence and citations:**
  - **GP:** ServiceNow IRM documentation, accessed 27 October 2026, https://www.servicenow.com/docs/r/governance-risk-compliance/policy-and-compliance-management/sn-otto-irm-pc.html. GP tokens: turn24search6, turn24search21 `[ref-incomplete]`.
  - **GM:** see M-J-07.
- **Product implication:** This is a plausible differentiator, to be validated with design partners. GP suggests using causal or semantic links, not simple threshold alerts.
- **Panel disagreement:** None.

---

## H — Enforcement case studies

### M-H-01 — Since 2021 the FCA has fined banks 13 times for AML failings

- **Source IDs:** H section introduction (OP)
- **Convergence:** `[single]`
- **Finding:** Since 2021 the FCA has fined banks 13 times for AML failings, totalling £300,767,526 (FCA, 12 December 2025).
- **Evidence and citations:** OP, citing the FCA's 12 December 2025 announcement.
- **Product implication:** Use this as context in sales material, after checking it against the primary source (see M-G).
- **Panel disagreement:** None.

### M-H-02 — Starling Bank, FCA, 2024

- **Source IDs:** H-OP-01, H-GP-01, H-GM-01 (Starling row), with related findings M-C-08, M-C-09, M-D-05, M-E-05, M-E-06
- **Convergence:** `[3-source]`
- **Tags:** `[conflict]` on the Final Notice date (see CF-17). Leading-indicator columns `[inference]`.
- **Penalty:** £28,959,426, which would have been £40,959,426 before the 30% discount (OP, GM; GP gives £28.96m). GM gives the basis as a Principle 3 breach and VREQ contravention (FSMA s.55L / s.204A).
- **What failed:**
  - Rapid growth outran the financial crime framework: about 43,000 customers in 2017, 3.6 million in 2023 (all three).
  - **Screening:**
    - From 20 July 2017 to 30 January 2023, automated customer screening checked only UK citizens and residents, covering 39 of 3,088 designated persons (GM).
    - OP describes this as "a fraction of the names on the Consolidated List".
    - Post-onboarding screening ran only every 14 days, and a customer screening tool was used for payments (GM).
  - **VREQ:**
    - The VREQ was accepted on 17 September 2021.
    - Between September 2021 and November 2023, Starling opened 54,359 accounts for 49,183 high-risk customers in breach of it (OP, GM).
    - These included 294 previously exited customers, and earned about £900,000 in interest and fees (GM).
  - No single SMF owned the VREQ (OP). Senior management lacked AML skills and awareness of the VREQ (GM).
  - MI was inconsistent (OP).
- **Framework layers that failed:**
  - OP: strategy, ownership, data, control, culture.
  - GP: appetite or restriction, control, ownership, data, growth governance.
  - GM: alignment of strategy and appetite, control design and IT configuration, ownership and capability.
- **Was adherence tracked?**
  - OP: no. Daily testing began only in January 2023.
  - GP: evidently inadequate.
  - GM: no. April 2024 was the first month with zero high-risk VREQ breaches, and sanctions list coverage was not tested until January 2023.
- **Leading indicators that would have shown it early:**
  - OP: list coverage; VREQ exceptions; overdue audit findings.
  - GP: high-risk onboarding count against the VREQ; sanctions-list coverage and completeness; ratio of growth to financial crime staff and control capacity.
  - GM: an anomaly KRI on sanctions alert volumes (the system generated zero individual sanctions alerts between 1 July 2022 and 30 January 2023); automated reconciliation of the Consolidated List count (3,088) against active rule records (39).
- **Sources:**
  - **OP:** FCA Final Notice, https://www.fca.org.uk/publication/final-notices/starling-bank-limited-2024.pdf, dated 27 September 2024.
  - **GP:** FCA press release, 02 October 2024, https://www.fca.org.uk/news/press-releases/fca-fines-starling-bank-failings-financial-crime-systems-and-controls.
  - **GM:** FCA Final Notice (02 October 2024), same PDF URL. GM marker 6 `[ref-incomplete]`.
- **Product implication:** Starling is the anchor case for VREQ adherence tracking, screening-coverage reconciliation, zero-alert anomaly detection and growth-normalised control capacity.

### M-H-03 — Monzo Bank, FCA, 2025

- **Source IDs:** H-OP-02, H-GP-02, H-GM-01 (Monzo row)
- **Convergence:** `[3-source]`
- **Tags:** `[conflict]` on the count of breaching accounts or customers (see CF-16)
- **Penalty and date:** £21,091,300 on 7 July 2025 (OP, GM). GP gives £21.09m, citing the press release of 08 July 2025.
  - GM: this is after the 30% discount and includes a £10.0m deterrence uplift on the £805,250 post-VREQ figure.
  - GM gives the basis as a Principle 3 breach and VREQ breach.
- **What failed:**
  - Onboarding, CDD/EDD and transaction monitoring from 2018 to 2020 (OP). GM dates the period 01 October 2018 to 04 August 2020.
  - VREQ breaches (all three).
  - GP: more than 34,000 high-risk customers. OP: 34,000+ against 26,325 accounts, recorded as a conflict.
  - Customer risk ratings were unclear (GM).
  - PEPs were not defined (GM).
  - EDD provisions were missing (GM).
  - Customers could transact before CDD was complete (GM).
  - Known monitoring weaknesses were flagged by a third-party review in late 2019 (GM).
  - It was unclear who was accountable for the VREQ (GM).
- **Framework layers that failed:**
  - OP: strategy (tenfold growth), policy, control, data.
  - GP: control, ownership, data, growth governance.
  - GM: policy, control, accountability / SMCR.
- **Was adherence tracked?** No (OP, GP, GM).
- **Leading indicators:**
  - OP: non-UK attributes at onboarding; re-onboarding of exited customers.
  - GP: high-risk acceptance and reclassification rate; KYC exceptions; transaction monitoring coverage; control capacity per 100,000 customers.
  - GM: share of new accounts making a payment while CDD is incomplete; count of VREQ requirements with no named SMF or first-line owner in the responsibilities map.
- **Sources:**
  - **OP:** FCA press release, https://www.fca.org.uk/news/press-releases/fca-fines-monzo-21m-failings-financial-crime-controls, 8 July 2025.
  - **GP:** same, 08 July 2025. GP tokens: turn9search1, turn10search20 `[ref-incomplete]`.
  - **GM:** Norton Rose Fulbright summary, https://connections.nortonrosefulbright.com/post/102kv0z/notice-in-a-nutshell-bank-fined-for-financial-crime-failings. GM marker 42 `[ref-incomplete]`.
- **Product implication:** Monzo is the anchor case for pre-transaction CDD gates, re-onboarding detection and SMF ownership of each VREQ clause.

### M-H-04 — Metro Bank, FCA, 2024 (transaction monitoring)

- **Source IDs:** H-OP-03, H-GP-03, H-GM-01 (Metro row), with related findings M-B-20 and M-C-10
- **Convergence:** `[3-source]`
- **Tags:** None
- **Penalty:** £16,675,200, which would have been £23,821,700 before the 30% discount (OP, GM; GP gives £16.68m). GM gives the basis as Principle 3, SYSC 6 and MLR 2007 Regulation 8.
- **What failed:**
  - Between 06 June 2016 and 17 December 2020, automated transaction monitoring missed 60,483,951 of 1,008,426,668 transactions (about 6%), worth £51.25bn out of £675.8bn (GM). OP and GP give more than 60m transactions worth £51bn.
  - "Bad Data" field rejections, for example on postcode or country, blocked customer and account records, 62% of them in partnerships (GM).
  - A "time stamp code logic error" excluded accounts opened and used on the same day (all three).
  - 238,000 accounts were missing: 166,358 from the timestamp error and 71,627 from other causes (GM).
  - The lookback led to 153 SARs and 43 account closures (GM; OP gives 153 SARs).
  - Staff concerns raised in 2017–2018 were deleted or dropped (see M-B-20).
- **Framework layers that failed:**
  - OP: data lineage, control, escalation.
  - GP: data, control, escalation, ownership.
  - GM: data and control (no daily reconciliation into monitoring until 17 December 2020, and no replay facility); culture and escalation.
- **Was adherence tracked?**
  - OP: no.
  - GP: completeness was not adequately controlled.
  - GM: no. No periodic MI on bad data existed. Even after the July 2019 tactical fix, which cut rejections from 1,352,665 to 438 a month, completeness could not be proven until daily reconciliation began in December 2020.
- **Leading indicators:**
  - OP: feed completeness; time from flag to fix.
  - GP: daily source-to-monitoring reconciliation; share of transactions screened; age of unresolved staff concerns.
  - GM: daily automated record-count reconciliation between the core banking data store and the monitoring system (when finally run ad hoc in July 2020 it found a 3,135-customer discrepancy); volume of records sitting in "bad data" folders.
- **Sources:**
  - **OP:** Lexology, https://www.lexology.com/library/detail.aspx?g=60de7c1e-a6a8-4364-a05b-a716017b20ef, November 2024.
  - **GP:** FCA, *FCA fines Metro Bank £16m for financial crime failings*, 12 November 2024, https://www.fca.org.uk/news/press-releases/fca-fines-metro-bank-16m-financial-crime-failings. GP tokens: turn9search4, turn10search5 `[ref-incomplete]`.
  - **GM:** FCA Final Notice (12 November 2024), https://www.fca.org.uk/publication/final-notices/metro-bank-plc-2024.pdf. GM markers 10 and 41 `[ref-incomplete]`.
- **Product implication:** Metro is the anchor case for source-to-target completeness reconciliation and immutable committee action tracking.

### M-H-05 — Nationwide Building Society, FCA, 2025

- **Source IDs:** H-OP-04, H-GP-09, H-GM-01 (grouped Nationwide/Barclays row, which has no case facts)
- **Convergence:** `[2-source]` for the case facts (OP, GP). GM's mention is a grouped precedent row without the fine, `[ref-incomplete]`.
- **Tags:** None
- **Penalty and date:** £44,078,500 on 12 December 2025 (OP). GP gives £44.08m.
- **What failed:**
  - CDD refresh and customer risk assessment from 2016 to 2021 (OP).
  - Ongoing due diligence, risk assessment and transaction monitoring on current accounts were inadequate, and remediation was not timely (GP).
  - Nationwide missed furlough fraud of £26.01m in eight days (OP).
  - The FCA's examples include personal accounts behaving like business accounts (GP; also M-G-02).
- **Framework layers that failed:**
  - OP: control, data, policy, remediation.
  - GP: control, data, ownership, remediation.
- **Was adherence tracked?** Weaknesses were known but not fixed "in a timely manner" (OP). Monitoring and follow-up were inadequate (GP).
- **Leading indicators:**
  - OP: share of CDD past its refresh date; velocity anomalies.
  - GP: mismatch between personal and business behaviour; overdue CDD; unusual turnover; remediation backlog.
- **Sources:**
  - **OP:** FCA, https://www.fca.org.uk/news/press-releases/fca-fines-nationwide-44m-failings-financial-crime-controls.
  - **GP:** same, 12 December 2025. GP token: turn9search7 `[ref-incomplete]`.
- **Product implication:** This is the building society anchor case: the largest mutual was fined for slow remediation of known weaknesses.

### M-H-06 — Metro Bank, PRA, 2021 (regulatory reporting)

- **Source IDs:** H-OP-05, A-OP-11
- **Convergence:** `[single]`
- **Finding:**
  - Penalty: £5,376,000 on 21 December 2021, under FR2 and FR6.
  - What failed: wrong COREP risk weights.
  - Layers: data, governance.
  - Adherence tracked: no.
  - Leading indicator: exceptions in return reconciliations.
- **Source:** Bank of England, https://www.bankofengland.co.uk/news/2021/december/pra-fines-metro-bank-5376000-for-failing-in-its-regulatory-reporting-governance-and-controls.
- **Product implication:** Regulatory returns need the same reconciliation discipline as risk MI.

### M-H-07 — Metro Bank, FCA, 2022 (disclosure)

- **Source IDs:** H-GP-04
- **Convergence:** `[single]`
- **Tags:** `[near-dup]` with M-H-06 (same firm and subject matter, different regulator, date and penalty)
- **Finding:**
  - Penalty: £10.0m on 12 December 2022.
  - What failed: incorrect risk-weighted-asset information was published without appropriate qualification after management knew a correction was needed.
  - Layers: data, governance, disclosure, ownership.
  - Adherence: a disclosure-control failure.
  - Leading indicators: unresolved material data adjustments; disclosure items with legal or accounting challenge outstanding.
- **Source:** FCA, 12 December 2022, https://www.fca.org.uk/news/press-releases/fca-fines-metro-bank-plc-decision-notices-two-former-executives. GP token: turn9search2 `[ref-incomplete]`.
- **Product implication:** Link open data adjustments to disclosure sign-off.

### M-H-08 — TSB IT migration, FCA and PRA, 2022

- **Source IDs:** H-OP-06
- **Convergence:** `[single]`
- **Tags:** Adherence and leading-indicator cells are blank in OP. The "readiness criteria" indicator is OP's alone.
- **Finding:**
  - Penalty: £48,650,000 on 20 December 2022 (FCA £29.75m, PRA £18.9m; £69.5m before the 30% settlement discount).
  - What failed: "operational risk management and governance failures, including management of outsourcing risks". Redress of £32.7m was paid.
  - Layers: change, resilience.
- **Source:** CNBC/Reuters, 20 December 2022, https://www.cnbc.com/2022/12/20/british-bank-tsb-fined-48point65-million-over-it-platform-migration-failures.html.
- **Product implication:** Change and migration risk needs its own appetite and readiness metrics.

### M-H-09 — Santander UK, FCA, 2022 (AML)

- **Source IDs:** H-OP-07, H-GP-05
- **Convergence:** `[2-source]`
- **Tags:** None
- **Finding:**
  - Penalty: £107,793,300 on 9 December 2022 (OP; GP gives £107.7m, 09 December 2022).
  - What failed: "serious and persistent gaps" in AML controls over more than 560,000 business banking customers, from 31 December 2012 to 18 October 2017. Over £298m passed through before the accounts were closed (OP). GP describes inadequate customer information and monitoring of higher-risk relationships.
  - Layers: OP gives control, data. GP gives policy, control, data, ownership.
  - Leading indicators: OP gives monitoring coverage. GP gives stale CDD, high-risk review backlog, and transaction monitoring coverage and yield.
- **Sources:**
  - **OP:** CNBC, 9 December 2022, https://www.cnbc.com/2022/12/09/uk-financial-watchdog-fines-santander-132-million.html.
  - **GP:** FCA, 09 December 2022. GP token: turn9search3 `[ref-incomplete]`.
- **Product implication:** Monitoring coverage of business banking populations.

### M-H-10 — HSBC Bank plc, FCA, 2021

- **Source IDs:** H-GP-06
- **Convergence:** `[single]`
- **Finding:**
  - Penalty: £63.9m on 17 December 2021.
  - What failed: a deficient automated transaction monitoring framework, including weaknesses in scenario coverage and parameters, risk assessment and testing.
  - Layers: model, control, data, governance.
  - Leading indicators: scenario coverage; untested parameter changes; feed completeness; drift in alert-to-SAR conversion.
- **Source:** FCA, 17 December 2021. GP token: turn10search1 `[ref-incomplete]`.
- **Product implication:** Parameter-change governance (links to M-I-10).

### M-H-11 — NatWest, criminal prosecution, 2021

- **Source IDs:** H-GP-07
- **Convergence:** `[single]`
- **Finding:**
  - Penalty: a £264.8m criminal AML fine following FCA prosecution, on 13 December 2021.
  - What failed: did not adequately comply with AML requirements when monitoring unusually large cash activity.
  - Layers: control, escalation, culture and ownership.
  - Leading indicators: cash activity against expected profile; repeated unusual cash deposits; unresolved CDD anomalies.
- **Source:** FCA and court outcome, 13 December 2021. GP token: turn10search0 `[ref-incomplete]`.
- **Product implication:** Profile-deviation indicators.

### M-H-12 — Barclays, FCA, 2025

- **Source IDs:** H-OP-08, H-GP-08, H-GM-01 (grouped row)
- **Convergence:** `[3-source]`
- **Finding:**
  - Penalty: about £42m on 16 July 2025, made up of £3.09m against Barclays Bank UK PLC (WealthTek) and £39.3m against Barclays Bank PLC (Stunt & Co) (OP; GP gives about £42m; GM gives £39.3m for Stunt & Co).
  - What failed: financial crime risk management in two client relationships (OP).
  - GP: failures in handling high-risk relationships.
  - GM: Barclays missed clear AML warning signs and law enforcement alerts while banking Stunt & Co.
  - GM also calls WealthTek a "client money" case. OP and GP do not use that description `[unverified]`.
  - Layers: OP gives control. GP gives CDD, escalation, risk acceptance, ownership. GM gives control assurance and escalation.
  - Adherence: GP says decision challenge was inadequate. GM says controls were weak and assumed effective on high-level status reporting.
  - Leading indicators:
    - GP: high-risk relationship exceptions; unresolved adverse intelligence; escalation of transaction patterns.
    - GM: high-value cash or high-risk flows concentrated against the customer profile; unresolved law-enforcement enquiry flags.
- **Sources:**
  - **OP:** FCA, https://www.fca.org.uk/news/press-releases/fca-fines-barclays-42-million-poor-handling-financial-crime-risks.
  - **GP:** tokens turn9search5, turn10search14 `[ref-incomplete]`.
  - **GM:** LearnSignal guides citing the Final Notices (22 October 2026). GM marker 9 `[ref-incomplete]`.
- **Product implication:** Connect external warning signals (law enforcement enquiries) to relationship exit and appetite escalation.

### M-H-13 — CB Payments Limited, FCA, 2024

- **Source IDs:** H-GM-01 (CB Payments row)
- **Convergence:** `[single]`
- **Tags:** `[scope]` (e-money institution, not a deposit-taker)
- **Finding:**
  - Penalty: £3,503,546 after the 30% discount, on 23 July 2024, for a Principle 2 breach and VREQ breach.
  - What failed:
    - the system flag was built from an earlier draft of the VREQ, missing four risk questions;
    - customers could overwrite their own answers to lower their risk rating;
    - pre-implementation testing used one record;
    - 1,034 migrated customers were never checked;
    - Coinbase Pro and a June 2022 service bypassed the flag;
    - customer service manually credited e-money to 199 flagged customers;
    - 62 SARs followed (about $1.75m).
  - Layers: mapping policy to control; horizontal ownership; metric design.
  - Adherence: partly, but faulty. Dashboards tracked flag triggers, not service access, and a formal written framework was only built in April 2023.
  - Leading indicators: an outcome KRI counting active transactions or balances of restricted customers across all products and migrations; count of unapproved manual overrides.
- **Sources:**
  - LearnSignal / Avyse Partners (23 July 2024 / 22 October 2026), https://www.learnsignal.com/blog/cb-payments-fca-final-notice-voluntary-requirement-high-risk-customer-onboarding-failures-guide/.
  - Avyse, https://www.avyse.co.uk/regulatory-gap-analysis-templates/fca-fine-cb-payments-limited-35m-for-failures-in-implementing-voluntary-restrictions.
  - GM marker 9 `[ref-incomplete]`.
- **Product implication:** This is the clearest evidence for clause-to-code traceability, despite being out of scope by firm type.

### M-H-14 — The regulator's published record counts against firms

- **Source IDs:** H-OP-09
- **Convergence:** `[single]`
- **Finding:** The FCA cited JMLSG and FCA guidance, and "numerous published FCA notices", as aggravating factors against Nationwide.
- **Evidence and citations:** Linklaters, https://financialregulation.linklaters.com/post/102lxng/fca-fines-nationwide-44m-for-financial-crime-control-failings, December 2025.
- **Product implication:** Map each new Final Notice to the firm's own controls (read-across).
- **Panel disagreement:** None recorded.

### M-H-15 — Across the cases, the failure was in translating appetite into execution

- **Source IDs:** OP TL;DR and H section; GP H panel synthesis; GM H introduction and product implication
- **Convergence:** `[3-source]`
- **Tags:** `[inference]`
- **Finding:**
  - The failure was not a missing board risk appetite statement or policy. It was the translation of requirements into system logic, data-feed reconciliation, ownership and escalation (GM, GP).
  - **OP:** the failures "sat above the control layer": controls did not keep pace with growth, board MI was inconsistent or missing, ownership was unclear, and nobody tracked whether restrictions were being followed.
  - **GP:** "growth, data, technology configuration, operational execution and ownership broke the chain between stated policy/appetite and what actually happened."
  - **GM:** recommends a "must-have prevention suite":
    1. clause-to-code traceability for VREQs and policies;
    2. daily source-to-monitoring completeness reconciliation;
    3. zero-alert anomaly detection;
    4. immutable committee action tracking.
- **Product implication:** The platform should keep asking: "Can we prove that the population actually obeyed the appetite or policy?" (GP).
- **Panel disagreement:** There is a nuance in framing. OP locates the failure "above the control layer", in governance, ownership and MI. GM locates it in the "translation" layer between appetite and system logic. Both say the board-level link to execution was what broke.

---

## I — Agentic-AI financial crime risk

### M-I-01 — UK regulators are designing a framework for agentic AI, but have issued no AI-specific rules

- **Source IDs:** I-OP-01, I-GP-01, I-GP-03, I-GM-01a
- **Convergence:** `[3-source]`
- **Tags:** The Mills Review is a set of recommendations, not rules.
- **Finding:**
  - UK regulators have not created a standalone AI rulebook.
  - During 2026, agentic finance became an explicit policy topic for the FCA, the Bank of England and HM Treasury.
  - HM Treasury calls agentic payments a near-term practical proxy for autonomous financial systems. It says current frameworks do not give enough clarity on liability, consent and fraud across chains of multiple agents and third parties.
  - GM says the UK governs agentic AI through three existing regimes:
    - PRA SS1/23 (model risk);
    - the FCA Consumer Duty and SMCR;
    - PSR Specific Direction 20 (APP reimbursement).

  Merged timeline:

| Date | Statement | Engine |
|---|---|---|
| February 2024 | UK Government response to the pro-innovation AI White Paper | GM |
| April 2024 | FCA AI Update | GM |
| January 2026 | Treasury Select Committee seeks AI accountability guidance by the end of 2026; Mills Review launched | OP |
| 25 March 2026 | The FCA will consider "whether change or development of regulation is needed to support agentic AI payments" | OP |
| 6 July 2026 | Mills Review (147 pages, seven recommendations) recommends "a trusted framework for AI agent participation… how agents can be authorised, identified and held accountable… consent mandates, identity, control and liability", and finds existing frameworks sound | OP |
| 14 July 2026 | HM Treasury *Financial Services AI Adoption Plan* | GP |
| 14 July 2026 | HM Treasury *Modernising Payment Services Regulation* consultation. It says agents could autonomously analyse, initiate, approve and execute payments, and asks whether rules on authentication, consent and liability for unauthorised transactions need updating | GP |
| October 2026 | Treasury Select Committee AI updates | GM |
| 19 October 2026 | FCA speech *Building the future of finance in the age of AI*. Agents can manage payments and investments and transact with other agents. The FCA will work on agent identity, delegated authority, accountability and execution. The FCA will itself become "ultimately agentic". No AI-specific rules are planned | GP, OP |
| 19 October 2026 | FCA AI good-practice review: firms are designing governance layers for agentic AI that keep accountability across complex workflows | GP |

- **Evidence and citations:**
  - **OP:**
    - Payment Expert, https://paymentexpert.com/2026/03/25/fca-2026-payments-regulatory-priorities-report/.
    - A&O Shearman, https://www.aoshearman.com/en/insights/report-issued-by-the-mills-review-the-future-of-ai-in-retail-financial-services, July 2026.
    - Trade2Spike, https://www.trade2spike.com/ai-in-action/fca-plans-to-become-agentic-regulator-86-percent-of-uk-firms-use-ai-no-new-rules, 20 October 2026.
  - **GP:**
    - HM Treasury, https://www.gov.uk/government/publications/ai-adoption-plan-financial-services/financial-services-ai-adoption-plan, 14 July 2026.
    - FCA, https://www.fca.org.uk/news/speeches/building-future-finance-age-ai, 19 October 2026.
    - GP tokens: turn19view1, turn19view2, turn19view3, turn17view0, turn18view1 `[ref-incomplete]`.
  - **GM:**
    - Jaywing, https://risk.jaywing.com/news-views/model-risk-management-in-an-ai-driven-world-ss1-23/.
    - Protecht UK (26 February 2025).
    - GARP, *Risk Insights: Data & AI Model Governance* (14 October 2026).
    - GM markers 30 and 42 `[ref-incomplete]`.
- **Product implication:**
  - Build a data model for agent mandates, but do not sell compliance with rules that do not yet exist (OP).
  - Make agent identity, mandate, permissions and transaction provenance native financial crime attributes (GP).
  - Embed SS1/23 model risk appetite in the board RAS rather than building a standalone AI compliance module (GM).
- **Panel disagreement:** None.

### M-I-02 — Firms use AI agents widely, but very few agents act with broad autonomy

- **Source IDs:** I-GP-02, I-OP-01 (86% figure)
- **Convergence:** `[2-source]` for the 86% figure. `[single]` (GP) for the other survey figures.
- **Tags:** `[near-dup]` on the source and date of the survey (see CF-24)
- **Finding:**
  - The Bank of England and FCA 2026 survey received 196 responses.
  - 86% of respondents used AI, including every responding UK bank and international bank.
  - 80% of full-survey respondents had AI agents deployed.
  - Autonomy was mostly limited:

| Type of agent | Share of respondents |
|---|---|
| Decision-support | 80% |
| Constrained execution | 46% |
| Conditional autonomy | 22% |
| Broad autonomy | 2% |

  - Even counting deployments planned for the next 12 months, no more than 9% expected agents to:
    - approve or decline customer outcomes;
    - trade;
    - initiate, execute or block payments;
    - change limits, thresholds or controls.
  - OP reports the 86% figure through trade press dated 20 October 2026, and tags it `[single]`.
- **Evidence and citations:**
  - **GP:** Bank of England and FCA, *Artificial intelligence in UK financial services — 2026*, 26 October 2026, https://www.bankofengland.co.uk/report/2026/artificial-intelligence-in-uk-financial-services-2026. GP token: turn19view0 `[ref-incomplete]`.
  - **OP:** Trade2Spike (see M-I-01).
- **Product implication:** The window is governance before scale: banks are deciding agent permissions before broad autonomy becomes normal (GP).
- **Panel disagreement:** None.

### M-I-03 — The FSB has published 12 practices for agentic AI

- **Source IDs:** I-OP-02
- **Convergence:** `[single]`
- **Tags:** `[unverified]`
- **Finding:** The FSB published 12 practices for agentic AI in October 2026.
- **Evidence and citations:** Payment Expert, https://paymentexpert.com/2026/10/21/ai-agents-fsb-payment-expert-podcast/.
- **Product implication:** Map the platform's agent governance features to the FSB practices once they have been read.
- **Panel disagreement:** None recorded.

### M-I-04 — EU and US positions differ from the UK's, and none bans agents

- **Source IDs:** I-OP-03, I-GP-11, I-GM-01b
- **Convergence:** `[3-source]` that the topic is relevant. The depth of coverage varies, and OP explicitly did not research it to primary standard.
- **Tags:** `[unverified]`. GP `[single]`. GM's EU AI Act fraud carve-out is `[unverified]`.
- **Finding:**
  - **OP:** lists items to check (the AI Act, PSD3/PSR, DORA from 17 January 2025, CFPB s1033 and Regulation E) without researching them.
  - **GM, EU:**
    - The EU AI Act (Regulation (EU) 2024/1689) entered into force on 01 August 2024. Prohibitions apply from February 2025, and high-risk obligations phase in through August 2026.
    - DORA applies from 17 January 2025.
    - The Act classifies AI used for retail creditworthiness assessment and risk pricing as high-risk, requiring conformity assessment, human oversight and transparency.
    - GM says the Act explicitly carves out AI used solely for detecting financial fraud and AML from the high-risk class. Customer-facing transaction agents remain subject to transparency and payment rules.
  - **GM, US:** oversight rests on Federal Reserve and OCC SR 11-7 model risk guidance, CFPB adverse-action explainability rules, and FinCEN advisories on deepfake and AI-generated identity fraud.
  - **GP:**
    - A US Federal Reserve discussion in September 2026 covered payment standards that can register agents and preserve evidence of cardholder approvals.
    - European banking authorities have been monitoring general-purpose and agentic AI.
    - The UK is currently more explicit than either in consulting specifically on consent and liability for agentic payments.
- **Evidence and citations:**
  - **GP:** tokens turn12search3, turn12search11 `[ref-incomplete]`. No title or URL is given.
  - **GM:** Protecht UK, *Emerging risks: Understanding, managing, and preparing for the future* (26 February 2025), https://www.protechtgroup.com/en-gb/blog/emerging-risks-management-and-preparation. GM markers 30, 68 and 69 `[ref-incomplete]`.
- **Product implication:** Build agent identity and permission evidence so it works in any jurisdiction, with country-specific liability rules layered on top (GP).
- **Panel disagreement:** None. The coverage gap is recorded in M-J.

### M-I-05 — Who is liable when an agent transacts, including under the UK APP reimbursement regime

- **Source IDs:** I-OP-04, I-GP-05, I-GP-06, I-GM-02
- **Convergence:** `[3-source]`
- **Tags:** `[inference]` on how the rules apply to agents. OP's merchant survey is `[single]`.
- **Finding:**
  - **The APP regime (PSR Specific Direction 20), in force since 07 October 2024:**
    - covers in-scope Faster Payments and CHAPS APP scams;
    - reimbursement up to £85,000 per claim;
    - cost split 50:50 between the sending and receiving PSPs;
    - payment within 5 business days, or 35 if the clock is stopped or extended (OP, GP);
    - an optional excess of up to £100, which cannot be applied to vulnerable customers (GP);
    - exceptions for first-party fraud, gross negligence and the consumer standard of caution (OP, GM).
  - **GM:** the regime is reinforced by an FCA Dear CEO letter on APP fraud reimbursement.
  - **The open question:** if a deceived agent makes a payment, is it "authorised" (and so within the APP regime) or "unauthorised" because it fell outside the customer's mandate (PSRs 2017)? This is unresolved (OP, GP, GM).
  - **GP:** the distinction that matters is between an authorised customer instruction delegated to an agent and an agent action outside the actual mandate. The HM Treasury July 2026 consultation exists because current rules predate agentic AI. It is premature to say UK law has a settled answer.
  - **GM:**
    - Under the Payment Services Regulations 2017 (Regulations 67 and 76), an unauthorised payment must be refunded unless the bank proves fraud or gross negligence.
    - Banks may argue that credentials shared with a third-party agent outside regulated payment initiation providers make the payment authorised, or amount to gross negligence.
    - If an autonomous agent is tricked by a synthetic invoice or a prompt-injection attack without human confirmation, it is unclear whether the consumer was "deceived" for APP purposes.
    - GM's regulatory adviser and CRO say the FOS and the Consumer Duty lean towards consumers in ambiguous cases. So banks cannot rely only on contractual liability-transfer disclaimers if they knowingly let unverified agents pay without step-up strong customer authentication.
    - GM attributes to JPMorgan's CEO a warning that customers using external agents face a liability transfer.
  - **OP's merchant survey:** 58% of UK merchants believe agents have transacted on their platforms, but only 41% are confident in the liability frameworks.
- **Evidence and citations:**
  - **OP:** PSR PS25/5, https://www.psr.org.uk/media/rhelv4op/ps25-5-app-scams-reimbursement-consolidated-policy-statement-may-2025.pdf, May 2025; Retail Banker International, https://www.retailbankerinternational.com/news/mills-review-industry-comments/, 6 July 2026.
  - **GP:** PSR, *APP fraud reimbursement protections*, 2026. GP tokens: turn16search0, turn16search16, turn18view1 `[ref-incomplete]`.
  - **GM:**
    - Times of India, https://timesofindia.indiatimes.com/technology/tech-news/americas-largest-bank-ceo-jamie-dimon-makes-it-clear-at-earnings-call-that-not-giving-ai-agents-access-to-banks-data-calls-it-too-risky-for-clients-and-jpmorgan/articleshow/135063165.cms (2026).
    - Bitcoin.com News, https://news.bitcoin.com/finance/jpmorgan-and-wall-street-giants-block-ai-agents-over-security-fears/ (2026).
    - Avyse Partners, citing the FCA Dear CEO letter (November 2024).
    - GM markers 44, 64, 66 and 67 `[ref-incomplete]`.
- **Product implication:**
  - Record mandate scope, agent identity and a mandate check for each transaction (OP).
  - Store the customer's mandate as machine-readable constraints: amount, merchant, purpose, frequency and duration (GP).
  - Track third-party API or agent session anomalies and attempts to bypass strong customer authentication as a leading KRI (GM).
- **Panel disagreement:** None on substance.

### M-I-06 — APP reimbursement outcomes so far

- **Source IDs:** I-OP-05, I-GP-05
- **Convergence:** `[2-source]` that the reimbursement rate is about 88–89%. Amounts differ by period.
- **Tags:** OP `[conflict]` internally. `[near-dup]` across engines (see CF-26).
- **Finding:**

| Period | Rate reimbursed | Amount | Engine |
|---|---|---|---|
| Year one, to 30 September 2025 | About 88% | About £173m | OP |
| 15 months to the end of 2025 | 89% | £243m | OP |
| First 18 months, to 31 March 2026 | 88% | £316m | GP |

  - UK Finance: total APP losses rose 19% to £576.4m in 2025 (OP).
  - Reimbursement rates ranged from 21% to 94% across PSPs (OP).
- **Evidence and citations:**
  - **OP:** Acoru, https://www.acoru.com/en/blog/app-fraud-reimbursement-covers-losses-without-preventing-fraud, 2026; Bratby Law, https://bratby.law/app-fraud-reimbursement-evaluation/, 2026.
  - **GP:** PSR, *APP scams reimbursement dashboard for Q1 2026*, 30 July 2026, https://www.psr.org.uk/information-for-consumers/app-scams-reimbursement-dashboard/. GP token: turn16search5 `[ref-incomplete]`.
- **Product implication:** Because receiving PSPs share the cost, mule detection now hits the P&L (OP). Agentic payment fraud is a direct unit-economic risk to both sending and receiving PSPs (GP).
- **Panel disagreement:** None.

### M-I-07 — Large US banks block third-party agents from transacting, while building their own

- **Source IDs:** I-OP-06, I-GP-07, I-GP-08, I-GM-03
- **Convergence:** `[3-source]` that third-party agents are restricted and the banks are building their own agents
- **Tags:** `[conflict]` on the verdict for claim 4 (see CF-29). OP and GM rely on secondary reporting.
- **Finding:**
  - **JPMorgan:**
    - Blocks outside agents. OP quotes: "You don't want rogue agents, and it could be thousands of them." GP quotes: the bank would not allow "just any outside agent".
    - Read-only data access through authorised open banking providers continues (OP, GM).
    - Blocks third-party agents from sending money, moving funds or paying bills (GM).
    - Its current terms of use set conditions for AI agents interacting with its systems, rather than an absolute ban (GP).
    - Its CFO disclosed a pilot of the bank's own AI tool, "Smart Cash", which predicts cash flow and moves funds to maximise yield (GM).
  - **Citi:**
    - "We do not permit third-party AI agents or assistants to log into a customer's account or transact directly" (OP).
    - The CEO wants "rigorous identity verification" (OP).
    - Citi built an internal platform, Arc (OP).
    - It joined other banks in restricting third-party agents (GM).
    - **But:** Citi's 28 July 2026 paper describes a future in which AI agents execute e-commerce transactions for consumers, and argues that instant-payment rails can support machine-native transactions. This contradicts the broad claim unless it is narrowed to unapproved third-party agents logging in directly (GP).
  - **Bank of America:** restricts access until liability protocols exist and wants human approval for outflows, 14 October 2026 (OP).
  - **Morgan Stanley and Schwab:** also restricting (OP).
  - **Reuters, 22 October 2026:** major US banks are blocking third-party AI agents from operating inside customer accounts and making unauthorised transactions (GP).
- **Evidence and citations:**
  - **OP:** Forbes, https://forbes.com/sites/chrisrosenberg/2026/10/24/jpmorgan-and-citis-ai-agent-limits-show-why-efficiency-isnt-enough, 24 October 2026; The Paypers, https://thepaypers.com/fintech/news/citi-and-bank-of-america-restrict-ai-agents-from-accessing-accounts, October 2026.
  - **GP:**
    - Reuters, https://www.reuters.com/legal/government/us-banks-detect-unauthorized-ai-agents-customer-accounts-axios-reports-2026-10-22/, 22 October 2026.
    - JPMorgan Chase, *Terms of Use — AI Agent or Agentic AI Notices*, accessed 27 October 2026, https://www.chase.com/digital/resources/terms-of-use.
    - Citi, *Agentic Commerce: A New Chapter for Instant Payments*, 28 July 2026, https://www.citigroup.com/global/insights/agentic-commerce-a-new-chapter-for-instant-payments.
    - GP tokens: turn25view0, turn25view1, turn25view2 `[ref-incomplete]`.
  - **GM:**
    - Times of India (2026).
    - Dealroom, https://dealroom.co/news/other-1knxdh8-citi-becomes-latest-us-bank-to-restrict-ai-agents-from-accessing-account/ (2026).
    - KuCoin, https://www.kucoin.com/news/flash/jpmorgan-and-other-wall-street-banks-restrict-ai-agent-trading-access (2026).
    - GM markers 44 and 64 `[ref-incomplete]`.
- **Product implication:**
  - The first product banks can buy is verification of agent identity and mandate at the perimeter (OP).
  - The emerging standard looks like trusted or permissioned agents, not "agents versus no agents" (GP).
  - GM suggests moving the pitch away from governing external customer agents, which banks are blocking at the gateway, towards governing banks' own first-party AI and defending against AI-accelerated fraud.
- **Panel disagreement:** Covered in CF-29. GM rates claim 4 "confirmed" (for third-party agents). OP and GP rate it "partly supported" because both banks are building agentic capability and Citi publicly envisages agent-executed transactions.

### M-I-08 — How fast and at what scale AI-enabled fraud operates

- **Source IDs:** I-OP-07, I-GP-04
- **Convergence:** `[2-source]`
- **Tags:** OP `[single]` for the Axios report. No quantified UK figure for AI-enabled fraud was found by any engine.
- **Finding:**
  - The Mills Review says "financial crime and cyber risk are amplified" (OP).
  - Axios reported agents "attempting to take actions that appear to be independent of user instructions" (OP).
  - At the Bank of England AI Consortium (9 February 2026), participants said agentic AI can compress decision time enough to challenge traditional escalation, human-in-the-loop arrangements, kill switches and circuit breakers. They discussed system-specific controls and real-time monitoring as autonomy increases (GP).
  - Metro's 2025 emerging-risk disclosure lists AI-enabled threats and describes adaptive monitoring as mitigation (GP; see M-B-10).
- **Evidence and citations:**
  - **OP:** InfoSec Today (citing Axios), https://www.infosectoday.io/should-government-websites-block-personal-ai-agent-transactions, October 2026.
  - **GP:** Bank of England, *Artificial Intelligence Consortium minutes — February 2026*, 09 February 2026, https://www.bankofengland.co.uk/minutes/2026/february/ai-consortium-minutes-9-february-2026. GP token: turn19view4 `[ref-incomplete]`.
- **Product implication:**
  - Do not use unsourced statistics on AI-enabled fraud (OP).
  - Agentic financial crime controls need machine-speed detection plus predefined human escalation and kill authority (GP).
- **Panel disagreement:** None.

### M-I-09 — There is no public benchmark for detection latency

- **Source IDs:** I-OP-08, I-GP-10, I-GM-04a, I-GM-04c
- **Convergence:** `[3-source]` that no public benchmark supports the claimed reduction from 30 minutes to under 20 seconds
- **Tags:** `[marketing-grade]`, `[inference]`. Minor `[near-dup]` on HSBC investigation time (see CF-21).
- **Finding:**
  - **OP:** there is no public benchmark. HSBC says Google AML AI cut batch processing "from several weeks to a few days".
  - **GP:** found no robust primary evidence for "30 minutes to under 20 seconds". Vendor material reports changes in alert volume and precision, not latency.
  - **GM:** draws a distinction between two types of detection:
    - real-time payment fraud and anomaly triage, measured in milliseconds to seconds;
    - holistic AML customer risk scoring, which looks at years of network behaviour.
  - **GM on Google AML AI:**
    - It does not score individual transactions in sub-second real time.
    - It is a supervised learning pipeline on Vertex AI and BigQuery that scores consolidated customer AML risk over 2 years of transaction, network and KYC data (per a vendor-adjacent explainer).
    - It cut average investigation time at HSBC from several weeks to about 8 days.
  - **GM on streaming:** moving from end-of-day or 30-minute micro-batch rules to streaming AI inference can cut transaction fraud trigger latency from minutes to seconds. This is not a standard AML benchmark `[inference]`.
- **Evidence and citations:**
  - **OP:** Insights Distilled, https://insightsdistilled.com/editions/june-27/hsbc-google-aml-ai-tool-reducing-fraud-alerts-compliance/, June 2023.
  - **GP:** tokens turn24search5, turn24search11 `[ref-incomplete]`.
  - **GM:**
    - GroundTruth AI, *Google AML AI in 3 minutes*, https://groundtruthai.net/resources/google-aml-ai-in-three-minutes.
    - World Bank AI Repository, *HSBC Dynamic Risk Assessment*, https://airepository.worldbank.org/use-case/hsbc-dynamic-risk-assessment-aml-fraud-detection.
    - SmartDev, *AI Use Cases in AML*, https://smartdev.com/ai-use-cases-in-aml/.
    - GM markers 65 and 72 `[ref-incomplete]`.
- **Product implication:** Measure each firm's own time from event to alert to decision (OP). Sell measurable improvements only where the bank's own baseline proves them (GP).
- **Panel disagreement:** None. The difference between "a few days" and "about 8 days" is recorded in CF-21.

### M-I-10 — PRA SS1/23 governs self-learning and adaptive models

- **Source IDs:** I-OP-09, I-GP-09, I-GM-01a, I-GM-04d
- **Convergence:** `[3-source]`
- **Tags:** `[conflict]` on how widely SS1/23 applies and how strict it is (see CF-23). OP's April 2026 revision is `[single]`.
- **Finding:**
  - **Dates:** SS1/23 (with PS6/23) was published on 17 May 2023 and took effect on 17 May 2024 (OP, GP, GM).
  - **Scope:** it covers "all types of models… including vendor models, regardless of technology" (OP).
  - **Requirements:**
    - a model inventory;
    - tiering;
    - a board-set model risk appetite;
    - independent validation;
    - change control (OP).
  - **GM's five principles:**
    1. model identification and classification;
    2. governance, including a board model risk appetite;
    3. development and implementation;
    4. independent validation;
    5. risk mitigants, including governance of dynamic recalibration and parameter tuning.
  - **Who it applies to:**
    - OP: it formally targets firms with internal model approval, but Principality adopted it in 2024.
    - GM: UK banks are "not permitted" to let self-learning models autonomously re-tune production AML or fraud thresholds in real time without human validation, back-testing against labelled exit and SAR datasets, and documented sign-off. Unvalidated threshold drift could silently blind monitoring, repeating the Metro and Starling failures.
    - GP: Bank of England and FCA AI discussions in 2026 considered how SS1/23 applies to AI systems and components such as generative models, prompts and retrieval layers.
  - **Implication for tuning:** retraining a model or changing parameters is a governed change (OP). An adaptive model must not become an invisible way of changing the firm's effective financial crime appetite (GP).
  - **Revision:** OP notes a reported revision in April 2026 `[single]`.
- **Evidence and citations:**
  - **OP:** Bank of England, https://www.bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks-ss, 17 May 2023.
  - **GP:** PRA *PS6/23*, 17 May 2023, https://www.bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks; Bank of England AI Consortium minutes, 09 February 2026. GP tokens: turn0search4, turn19view4 `[ref-incomplete]`.
  - **GM:** Jaywing, *Model Risk Management in an AI-Driven World: SS1/23*. GM marker 58 `[ref-incomplete]`.
- **Product implication:**
  - Create a record for every parameter change, linked to the risk owner (OP).
  - Record each material tuning change against the appetite metric it affects, with predefined approval (GP).
  - Provide a board model risk appetite view covering drift and approval of tuning (GM).
- **Panel disagreement:** See CF-23. OP's reading of the scope is narrower, and sourced to the regulator text. GM's "not permitted" is an inference from the principles.

### M-I-11 — AI tools for AML and fraud from vendors and banks

- **Source IDs:** I-OP-10, I-GP-10, I-GM-04b
- **Convergence:** `[3-source]` for Google Cloud AML AI at HSBC. `[single]` for the other vendor claims.
- **Tags:** `[marketing-grade]`
- **Finding:**
  - **Google Cloud AML AI:**
    - Launched on 21 June 2023 (OP, GM).
    - HSBC reports "two to four times more true positive risk" (OP), or 2x to 4x more confirmed suspicious activity measured by SARs filed (GM).
    - Alert volumes and false positives fell by more than 60% (OP, GM).
    - It generates consolidated customer risk scores from transaction, network and KYC data (GP).
    - Other users: Bradesco and Lunar (OP, GM).
    - HSBC's system is called "Dynamic Risk Assessment". It won Celent Model Risk Manager of the Year 2023 and Regulation Asia's Best Transaction Monitoring Solution 2024, and appears in the World Bank AI Repository (GM).
    - A Google Cloud SLA guarantees monthly uptime. The figures were lost in export `[ref-incomplete]` (GM).
  - **Legacy rules-based systems:** over 95% false positives at first review, and about 98% of alerts never become a SAR (GM).
  - **Other vendors and banks:**
    - Absa: false positives cut by 77%, 21 previously missed high-risk patterns found, 10.5% hit rate (GM).
    - C3 AI clients: up to 85% fewer false positives, twice the true-positive detection, more than 40% faster case resolution (GM).
    - Credal.ai: integrating an LLM cuts investigation and SAR drafting time by 30–50% (GM).
    - Starling reportedly uses an AI agent on AML alerts (OP).
    - Other names: ThetaRay, Feedzai, Featurespace, NICE Actimize, Quantexa and Hawk (OP, `[unverified]`).
- **Evidence and citations:**
  - **OP:** Google Cloud, https://www.googlecloudpresscorner.com/2023-06-21-Google-Cloud-Launches-AI-Powered-Anti-Money-Laundering-Product-for-Financial-Institutions; The Paypers, https://thepaypers.com/fraud-and-fincrime/news/starling-bank-deploys-an-ai-agent-to-investigate-aml-alerts, 2026.
  - **GP:** Google Cloud AML AI coverage and HSBC case material, June–July 2023. GP tokens: turn24search5, turn24search11 `[ref-incomplete]`.
  - **GM:**
    - Celent award PDF, https://services.google.com/fh/files/misc/hsbc_celent_model_risk_manager_of_the_year_2023.pdf.
    - Google AML AI SLA, https://cloud.google.com/anti-money-laundering-ai/sla.
    - Google training documentation, https://docs.cloud.google.com/financial-services/anti-money-laundering/docs/train-models-to-detect-money-laundering.
    - SmartDev.
    - GM markers 13, 65, 72 and 76 `[ref-incomplete]`.
- **Product implication:**
  - Detection is crowded, so compete on governance above detection (OP).
  - Do not replace engines such as Google AML AI. Sit above them as the board and SMF4/SMF17 governance layer, tracking model drift, false-positive-to-SAR conversion, feed completeness and approval of threshold changes (GM).
- **Panel disagreement:** None.

### M-I-12 — Banks are building their own permissioned agents rather than banning agents

- **Source IDs:** I-GM-03b, I-GP-07, I-OP-06
- **Convergence:** `[3-source]`
- **Tags:** `[inference]`
- **Finding:**
  - Banks are not banning agentic AI. They block external third-party agents from payment and write actions, while building first-party agents inside their own regulatory perimeter.
  - Examples: JPMorgan's Smart Cash (GM); Citi's Arc (OP); Nationwide's AI call summarisation and personalisation tools (GM).
- **Evidence and citations:** As in M-I-07. GM marker 5 `[ref-incomplete]`.
- **Product implication:** The governed object includes the bank's own agents, not only customers' agents.
- **Panel disagreement:** None.

---

## J — Market, buyers and competitors

### M-J-01 — How many building societies there are

- **Source IDs:** J-OP-01, J-GP-01, J-GM-01a
- **Convergence:** `[3-source]`
- **Tags:** `[unresolved-conflict]` on 42 versus 43 (see CF-19)
- **Finding:**
  - **OP:** 42 societies, "including two mutual-owned banks" (BSA, June 2025).
  - **GM:**
    - 42 building societies, plus two mutual-owned banks: The Co-operative Bank, acquired by Coventry, and Virgin Money, acquired by Nationwide on 01 October 2024.
    - 7 large credit unions in the NCUF.
    - More than 26 million members.
    - Combined building society assets of more than £502 billion.
  - **GP:** the BSA "currently represents 43 UK building societies" (BSA, 18 June 2026).
- **Evidence and citations:**
  - **OP:** BSA, https://www.bsa.org.uk/media-centre/press-releases/building-society-sector-grows-as-two-banks-are-mutualised, June 2025.
  - **GP:** BSA, 18 June 2026. GP token: turn20search1 `[ref-incomplete]`.
  - **GM:** BSA *Yearbook 2024/25*, https://www.bsa.org.uk/getmedia/4b40c04d-f257-441a-8d07-a687413fc276/BSA-Yearbook-2024-25-single.pdf; House of Lords Library briefing LLN-2024-0018 (23 April 2024). GM marker 5 `[ref-incomplete]`.
- **Product implication:** Size the addressable market with the current BSA count.
- **Panel disagreement:** See CF-19. The counts come from different dates, and OP and GM differ on whether the two mutual-owned banks are included in the 42.

### M-J-02 — Building societies' share of the UK market, by measure

- **Source IDs:** J-OP-01, J-GP-01, J-GM-01b
- **Convergence:** `[3-source]` on 29% of mortgage balances and 23% of savings balances (including mutual-owned banks)
- **Tags:** `[near-dup]` across dates. `[conflict]` (minor) on Cash ISA share (see CF-20).
- **Finding:** "About 25% of the market" holds only for some measures, so the denominator must always be stated.

| Measure | Share | Value | Date or period | Engine |
|---|---|---|---|---|
| New mortgage lending | Over a quarter | — | January–September 2023 | GM |
| Outstanding mortgage balances, building societies alone | 23% | £370.0bn | 2022/2023 | GM |
| Outstanding mortgage balances, including mutual-owned banks | 29% | — | End March 2025 | OP |
| Outstanding mortgage balances, including mutual-owned banks | 29% | £493bn | March–September 2025 | GM |
| Mortgage balances | — | £493bn | Six months to September 2025 | OP |
| Outstanding mortgage balances | 29% | About £499bn | March 2026 | GP |
| Outstanding savings balances | 23% | £485.7bn | End March 2025 | OP |
| Outstanding savings balances | 23% | £496bn (up from 19% in Q1 2023) | September 2025 | GM (OP gives £496bn for the six months to September 2025) |
| Outstanding savings balances | 23% | About £502bn | March 2026 | GP |
| Savings inflows | 33% | — | Six months to March 2025 | GM |
| Savings inflows | 27% | — | Six months to September 2025 | GM |
| Cash ISA balances | 47% | — | End March 2025 | OP |
| Cash ISA balances | 46%–47% | £191.3bn (March 2025); £205.0bn (September 2025); up from 40% / £153.9bn (September 2024) | 2024–2025 | GM |
| Cash ISA balances | About 46% | — | March 2026 | GP |
| Gross mortgage lending | 32% | £46.5bn | October 2024–March 2025 | OP, GM |
| Net mortgage lending | 52% | £14.8bn | October 2024–March 2025 | OP, GM |
| New mortgage approvals | 31% | More than 220,000 loans | Six months to September 2025 | OP, GM |
| Physical branch network | 30% | — | — | GM |

- **Evidence and citations:**
  - **OP:** BSA trading update, https://www.bsa.org.uk/statistics/sector-info-performance/building-society-trading-updates/building-societies-trading-update-june-2025-883a2eb3673679dc972a3cd8071a65b8, 28 November 2025.
  - **GP:** BSA, *Building Societies Trading Update — June 2026*, 18 June 2026, https://www.bsa.org.uk/statistics/sector-info-performance/building-society-trading-updates/building-societies-trading-update-june-2026. GP tokens: turn20search19, turn20search3 `[ref-incomplete]`.
  - **GM:**
    - BSA *Trading Update June 2025*, https://www.bsa.org.uk/statistics/sector-info-performance/building-society-trading-updates/building-societies-trading-update-june-2025.
    - MPA Magazine (28 November 2025), https://www.mpamag.com/uk/mortgage-industry/market-trends/building-societies-outpace-the-big-banks-in-mortgage-and-savings-surge/558237.
    - Grant Thornton (24 March 2025).
    - GM markers 25, 34, 53, 78 and 79 `[ref-incomplete]`.
- **Product implication:** Building societies are big enough to justify a specialised go-to-market, especially around mortgage and savings risk (GP).
- **Panel disagreement:** GM rates the 25% claim "confirmed" for stock and new lending. OP and GP rate it "partly supported" (see CF-28 and M-E).

### M-J-03 — The statutory limits that shape building society balance sheets

- **Source IDs:** J-GM-01c
- **Convergence:** `[single]`
- **Tags:** `[unverified]`
- **Finding:**
  - Under the Building Societies Act 1986, updated by the Building Societies Act 1986 (Amendment) Act 2024, two limits apply:
    - the nature limit: at least 75% of assets must be loans secured on residential property;
    - the funding limit: at least 50% of funding must come from member deposits, so wholesale funding is capped at 50%. In practice it averages well below 31.5%.
  - Nationwide holds £280.6bn of mortgages (16.3% UK share) and £260.7bn of retail deposits (12.2% share).
- **Evidence and citations:** House of Lords Library, *Building Societies Act 1986 (Amendment) Bill*, LLN-2024-0018, https://researchbriefings.files.parliament.uk/documents/LLN-2024-0018/2024-0018-Building-Societies-Act-1986-(Amendment)-Bill-LARGE.pdf. GM marker 18 `[ref-incomplete]`.
- **Product implication:** Include the nature and funding limits as built-in Level 1 metrics for societies.
- **Panel disagreement:** None recorded.

### M-J-04 — Market tiers and what each tier needs

- **Source IDs:** J-OP-02, J-GP-02, J-GM-01d
- **Convergence:** `[3-source]` that the sector is heterogeneous and tiered
- **Tags:** `[inference]`. OP `[unverified]` for tier counts.
- **Finding:**
  - **OP:**
    - Nationwide dominates, followed by Coventry, Yorkshire, Skipton, Leeds and Principality, then a long tail.
    - Coventry's mortgage share rose from 3.1% to 4.2% after acquiring The Co-operative Bank.
    - Whitecap/BSA 2025 notes CEO turnover and a "lack of proportionality".
  - **GP:** the sector runs from very large mutuals through mid-tier regional societies to small institutions. Smaller firms probably have fewer specialist resources, but asset size is not a direct maturity score.
  - **GM tier table:**

| Tier | Examples | Scale | Maturity | Fit |
|---|---|---|---|---|
| 1. Mega-mutual | Nationwide, including Virgin Money | More than £350bn assets | IRB models, Bank of England stress-tested (14.5% CET1 low point), heavy enterprise GRC stack | Low for full replacement; high for AI governance or subsidiary modules |
| 2. Large regional mutuals and mid-tier challengers (about 10–12 firms) | Coventry (including Co-op Bank), Yorkshire, Skipton (£38.7bn+ assets), Leeds (£32.0bn), Principality; Shawbrook (£19.2bn loan book), OakNorth, Metro, Starling, Monzo | £10bn–£65bn | High ambition and active transformation, but often bridging the board RAS and first-line controls with fragmented GRC tools or spreadsheets | Prime target |
| 3. Mid-sized regional societies (about 10–12 firms) | Nottingham (£5.4bn), Cambridge, Newcastle, West Bromwich, Progressive, Cumberland, National Counties, Monmouthshire | £1bn–£10bn | Moving to the PRA Small Domestic Deposit Takers (SDDT) regime or Basel 3.1 (from July 2025 / 2026); replacing legacy mortgage platforms; looking for turnkey ERM software plus advisory | Prime target for turnkey SaaS |
| 4. Smaller niche societies (about 18–20 firms) | Mansfield, Hanley Economic, Beverley, Harpenden | Under £1bn | Manual underwriting, niches (holiday lets, lending into retirement, self-build), lean second line relying on spreadsheets | Secondary; partner-led light edition |

- **Evidence and citations:**
  - **OP:** Whitecap, https://www.whitecapconsulting.co.uk/wp-content/uploads/2025/05/Building-Societies-Report-2025.pdf, May 2025.
  - **GP:** BSA asset-size ranking; firm reports. GP tokens: turn20search6, turn21view0, turn23view0 `[ref-incomplete]`.
  - **GM:** Grant Thornton (24 March 2025). GM markers 19, 21, 23, 27 and 28 `[ref-incomplete]`.
- **Product implication:**
  - Offer a turnkey RAF for small societies and GRC integration for the top six to eight (OP).
  - Run separate propositions for enterprise integration and for managed or lightweight RAF orchestration (GP).
  - Target tiers 2 and 3 with pre-built SDDT, PRA and Consumer Duty appetite templates that deploy in weeks, not after an 18-month consulting build (GM).
- **Panel disagreement:** None.

### M-J-05 — Risk maturity signals among building societies

- **Source IDs:** J-OP-03, J-GM-01d
- **Convergence:** `[2-source]`
- **Tags:** `[inference]`
- **Finding:**
  - OP's signals:
    - Nationwide's £44m fine;
    - integration risk raised at Coventry and Nationwide;
    - Principality adding model risk.
  - GM: tier 3 and 4 societies rely on spreadsheets or light templates, and many tier 2 firms bridge the RAS and controls with fragmented tools.
- **Evidence and citations:** As in M-H-05, M-B-04, M-B-08 and M-J-04.
- **Product implication:** A module on change risk against appetite is timely (OP).
- **Panel disagreement:** None.

### M-J-06 — Who buys, and who holds the budget

- **Source IDs:** J-OP-04, J-GP-03, J-GM-02a
- **Convergence:** `[3-source]` that the CRO is the economic buyer
- **Tags:** `[inference]`
- **Finding:**

| Role | OP | GP | GM |
|---|---|---|---|
| CRO (SMF4) | Buys | Economic owner | Primary champion and economic buyer; owns the RMF/RAF budget and is accountable for the quality of the board risk pack |
| CFO (SMF2) | Co-signs at societies | Co-sponsor where planning or capital is central | Controls capital and ICAAP alignment, and signs off procurement |
| COO | May sponsor | Co-sponsor for operational and control integration | COO or CTO (SMF24) signs off IT integration and resilience alignment |
| CIO / CDO | — | Co-sponsor for data architecture | — |
| BRC chair (SMF10) | Sponsors but holds no budget | Senior user and influencer | Gatekeeper; decides what the BRC needs and often demands a pack overhaul on appointment |
| SMF16 / SMF17 | — | Influencers | Co-sponsor where the entry point is financial crime or the Consumer Duty |
| CEO, Audit Committee | — | Influencers | — |
| Budget holder | — | Usually executive management, not the NED committee | — |

- **Evidence and citations:**
  - **GP:** Leeds' CRO reports to the CEO and has independent access to the BRC chair. Nationwide places risk-function leadership with the Group CRO. GP tokens: turn23view1, turn21view0 `[ref-incomplete]`.
  - **GM:** markers 8, 27, 29 and 47 `[ref-incomplete]`.
- **Product implication:**
  - Sell to the CRO, design for the BRC chair, and lighten the first line's load (OP).
  - Sell the strategic outcome to the chair or CEO while building the business case with the CRO and operating functions (GP).
- **Panel disagreement:** OP's first-line member warns the product dies if the first line sees it as a burden.

### M-J-07 — Events that trigger a purchase

- **Source IDs:** J-OP-04, J-GP-04, J-GM-02b
- **Convergence:** `[3-source]`
- **Tags:** `[inference]`, except where a firm example is cited
- **Finding:**

| Trigger | Engines | Evidence |
|---|---|---|
| s166 review, VREQ or OIREQ | OP, GP, GM | Starling (VREQ September 2021), Monzo (VREQ August 2020), CB Payments |
| Final Notice or enforcement | OP, GP | — |
| A regulator's "lessons learned" request | OP | Starling |
| M&A, integration or subsidiary remediation | OP, GP, GM | Skipton's SIL intervention (2025); Nationwide–Virgin Money; Shawbrook–ThinCats, TML, Bluestone |
| PS26/2 incident reporting from 18 March 2027 | OP | M-C-04 |
| SMCR Phase 1 | OP | M-D-02 |
| New chair, CEO, CRO or BRC chair | OP, GP, GM | Skipton appointed a new Risk Committee chair at its April 2025 AGM (GM). Incoming chairs and CROs reject inherited spreadsheet packs because they cannot verify "reasonable steps" (GM) |
| Rapid growth or new product expansion | GP | Starling, Monzo |
| Consumer Duty board report weaknesses | GP | — |
| Major operational incident | GP | — |
| Core banking or origination platform change | GM | Leeds replacing its core banking platform in 2025/2026; Nottingham and MQube |
| IPO readiness or private equity exit | GM | Shawbrook's IPO preparation and return to public markets (GM cites the Barclays *Annual Report 2025*) |
| Sector-wide read-across after a peer's fine | GM | The Starling, Metro and Monzo fines prompt BRC chairs to ask their CROs for proof that their own feeds and filters do not have the same gaps |

- **Evidence and citations:** GM: Skipton *Annual Report 2024* and *2025*; Barclays *Annual Report 2025*, https://home.barclays/content/dam/home-barclays/documents/investor-relations/reports-and-events/annual-reports/2025/Barclays-PLC-Annual-Report-2025.pdf. GM markers 9, 11, 17, 23, 26, 27, 29, 47 and 54 `[ref-incomplete]`.
- **Product implication:**
  - Target change events, not generic annual GRC budget cycles (GP).
  - Trigger outreach on FCA Register changes to SMF4, SMF10, SMF16 or SMF17, published VREQs, M&A announcements and peer enforcement notices, with a rapid "board line-of-sight and VREQ/data-feed assurance diagnostic" (GM).
- **Panel disagreement:** None.

### M-J-08 — The competitor landscape

- **Source IDs:** J-OP-05, J-GP-05, J-GM-03
- **Convergence:** `[3-source]` for ServiceNow, MetricStream, Archer, Workiva, IBM OpenPages, SAI360 and consultancies. `[single]` (GM) for Protecht, Diligent, AuditBoard, Ideagen, LogicGate, Centraleyes, Riskonnect, OneTrust and Resolver. `[single]` (OP) for UK SMCR tools and AI-native entrants.
- **Tags:** `[marketing-grade]`, `[unverified]`. `[conflict]` on ServiceNow's board appetite capability (see CF-22).
- **Finding:** Merged capability table. Cells show each engine's view.

| Player | Coverage | Board appetite view | Strategy linkage | Metric tension | Ownership mapping (SMCR and journey) | Segment |
|---|---|---|---|---|---|---|
| ServiceNow IRM | OP: risk, controls, issues, vendor. GP: integrated risk, compliance, third party, workflows. GM: workflow-driven operational, IT and cyber risk, BCM, policy | OP: configurable. GP: yes, configurable (official docs). GM: basic, weak on prudential RAS | OP: limited. GP: possible via platform; no distinctive board strategy chain found. GM: weak, built bottom-up from IT workflows | OP, GP, GM: no | OP: configurable. GP: strong workflow and entity ownership. GM: IT focus | Large enterprises and banks on ServiceNow |
| MetricStream | OP: ERM, ORM, compliance, audit, appetite. GM: ORM, RCSA, compliance, cyber GRC, audit, third party; AI assistants [marketing-grade] | OP: yes. GP: likely or configurable. GM: yes | OP: partial. GP: not verified. GM: partial, heavy to maintain | OP, GM: no. GP: no verified evidence | OP: configurable. GP: likely conventional. GM: partial, strong functionally, weak on journeys | Large and mid-tier; GM: more than 100 BFSI clients globally |
| Archer | OP: ORM, RCSA, compliance, audit. GM: RCSA campaigns, registers, control libraries, KRIs, loss events | OP: configurable. GP: unverified. GM: partial, legacy UI | OP: limited. GM: weak | OP, GM: no | OP: configurable. GM: vertical RCSA ownership | Large FS; tier 1 and 2 banks |
| IBM OpenPages | OP: ORM, model risk, AI governance. GM: modular AI-driven GRC, model risk, audit | OP: yes. GM: yes. GP: unverified | OP, GM: partial | OP, GM: no | OP: configurable. GM: vertical or entity-based | Large banks with IBM estates |
| Workiva | OP: reporting, SOX, ESG. GM: SEC, ESG, annual report and Pillar 3 disclosure | OP: reporting. GM: presentation layer only | OP: disclosure. GM: narrative | No | OP: no | Listed firms |
| SAI360 | OP: GRC, ethics. GP: integrated risk, compliance, ethics. GM: listed among mid-market tools | OP: partial. GP: likely or configurable | OP: limited | OP: no | OP: partial | Mid-market |
| Protecht (ERM plus Cognita AI) | GM: ERM, RCSA, KRI and appetite monitoring, resilience, compliance, SMCR and three-lines alignment, with UK advisory and Protecht Academy | GM: strong | GM: good | GM: emerging thought leadership with GARP, no automated engine | GM: good separation of risk owner and control owner | GM: a direct primary competitor in the UK mid-tier (London office) |
| Diligent | GM: board portal and pack distribution, with ERM add-ons | GM: presentation layer only | GM: narrative | GM: no | GM: maps board committees | Mutual company secretaries |
| AuditBoard | GM: audit-first workflow, SOX, risk | — | GM: narrative | GM: no | GM: maps audit and control owners | Internal audit teams |
| Ideagen, LogicGate, Centraleyes, Riskonnect (Ventiv), OneTrust, Resolver | GM: Ideagen does compliance and ERM for regulated UK mid-market; LogicGate does workflow and Monte Carlo quantification; Centraleyes is cyber-centric ORM; Riskonnect does broad ERM | GM: partial or operational | GM: partial | GM: no | GM: functional | Mid-market financials, fintechs, specialist lenders |
| UK SMCR tools | OP: maps, SoRs, certification | OP: no | OP: no | OP: no | OP: yes | UK mid-tier |
| Consultancies (Big 4 and boutiques; GM names Deloitte, KPMG, Grant Thornton, Avyse Partners, Jaywing) | OP: RAF design, s166, remediation. GM: bespoke RAF and RAS design, s166, VREQ gap analysis, SS1/23, Consumer Duty | OP: bespoke. GM: high conceptual quality, delivered as static slides or spreadsheets | OP: bespoke. GM: high, in static decks | OP: workshops. GM: ad hoc advisory | OP: bespoke. GM: design SoRs and MRMs but leave static files | All tiers; GM sees potential channel partners |
| AI-native entrants | OP: control testing, policy mapping | OP: emerging | OP: rare | OP: rare | OP: rare | Challengers |

- **Evidence and citations:**
  - **OP:** panel knowledge; vendor pages not fetched `[unverified]`.
  - **GP:** ServiceNow official documentation, accessed 27 October 2026. Third-party comparisons only for MetricStream and SAI360. GP tokens: turn24search6, turn24search21, turn24search9, turn24search3 `[ref-incomplete]`.
  - **GM:**
    - Centraleyes (2026).
    - Continuity2, *Top 12 ERM Software for 2026*, https://continuity2.com/blog/erm-software.
    - MetricStream BFSI page, https://www.metricstream.com/industries/banking-and-financial-services.htm.
    - Protecht UK customer success and knowledge hub, https://www.protechtgroup.com/en-gb/customer-success.
    - Ideagen, https://www.ideagen.com/solutions/compliance/enterprise-risk-management.
    - Battleground Group (GRC platforms), https://www.battlegroundgroup.com/article/crisis-management-software-adoption-barriers-duplicate-17734/.
    - GM markers 4, 8, 20, 25, 30, 33, 46, 59, 83 and 86 `[ref-incomplete]`.
- **Product implication:**
  - A board dashboard on its own is not differentiation (GP).
  - Avoid competing head-on as a bottom-up RCSA database. Treat Protecht as the sharpest direct UK rival, and integrate into Diligent and board pack tools (GM).
- **Panel disagreement:** See CF-22 (ServiceNow) and CF-25 (Protecht as a challenge to the white-space claim).

### M-J-09 — Where the white space is

- **Source IDs:** J-OP-05 (implication), J-GP-06, J-GM-03 (implication), synthesis sections from all three
- **Convergence:** `[3-source]`
- **Tags:** `[inference]`. `[conflict]` on how strongly "unserved" can be claimed (see CF-25).
- **Finding:**
  - **OP:** no one appears to combine strategy linkage, tension analysis, SMCR binding and reportability records at a mid-tier price.
  - **GP:** the white space is not another repository. It is a navigable graph:
    - strategic objective → RAS → primary metric → subordinate indicator or limit → policy obligation → control → owner → customer journey or product → incident or complaint → regulatory obligation → reportability decision → assurance finding.
  - **GM:** differentiate by owning:
    - the top-down strategic board layer;
    - automated metric-tension trade-offs;
    - data-feed completeness assurance;
    - horizontal line of sight across the Consumer Duty and SMCR.
- **Evidence and citations:** As in M-J-08. GP tokens: turn0search2, turn23view1, turn24search21 `[ref-incomplete]`.
- **Product implication:** Position the product as a decision and evidence layer across existing GRC and control systems, to reduce replacement friction (GP).
- **Panel disagreement:**
  - In GP, the NED and business owner see a clear gap. The CRO warns that large banks may already approximate it through bespoke data warehouses and committee packs, so the safer claim is "poorly integrated and operationally expensive", not "nobody can do this".
  - GM rates Protecht "strong" on board appetite and "good" on strategy linkage and ownership, which narrows the white space.

### M-J-10 — UK bank innovation and partnership programmes

- **Source IDs:** J-OP-06, J-GP-07, J-GM-04
- **Convergence:** `[3-source]`
- **Tags:** OP `[unverified]`. GM's PoC budget range is `[single]` `[practice-not-rule]`.
- **Finding:**
  - **Models:**
    - paid proof of concept, accelerators (for example NatWest), corporate venture capital, and the FCA Supercharged Sandbox and AI Sprints (OP);
    - zero-equity incubation and co-design, paid PoC sprints, and strategic deployment or venture equity (GM).
  - **NatWest:**
    - launched its Fintech Growth Programme in 2025, bringing fintechs together with senior leaders, with a potential route to scale across a 20-million-customer group;
    - the 2026 programme includes AI-driven firms (GP).
  - **Outcomes:** historic accelerators have led to PoC trials and contracts, but do not assume equity (GP).
  - **Programme names (GM):** NatWest Entrepreneur Accelerator and FinTech scouting, Barclays Rise, Lloyds Launch Innovation, and Nationwide's incubator and open banking partnerships.
  - **Paid PoC terms (GM):** typically £25k–£100k ring-fenced innovation budgets over 8–12 weeks, testing on synthetic or anonymised data without triggering a 9-month tier 1 procurement cycle.
  - **Mutual example (GM):** Nottingham and MQube (2025/2026).
  - **BSA Associate Members (GM):** 49 accredited technology, legal and advisory partners linked to the C-suites of all 42 societies.
- **Evidence and citations:**
  - **OP:** Bratby Law, https://bratby.law/agentic-ai-payments-consent-regulation/, 2026.
  - **GP:** NatWest Group, *Inspiring innovation and partnership to succeed with customers*, 30 October 2025, https://www.natwestgroup.com/news-and-insights/latest-stories/ai-and-data/2025/oct/inspiring-innovation-and-partnership-to-succeed-with-customers.html. GP tokens: turn25search0, turn25search3, turn24search10 `[ref-incomplete]`.
  - **GM:** BSA *Yearbook 2024/25*; Nottingham *2025 Annual Report*. GM markers 27 and 52 `[ref-incomplete]`.
- **Product implication:**
  - A bank-backed PoC on real appetite and financial crime data is a credible route (GP).
  - The FCA sandbox suits the agentic module (OP).
  - Join the BSA Associate Member ecosystem and co-deliver paid 8-week "board risk pack and VREQ readiness" PoCs with specialist consultancies (GM).
- **Panel disagreement:** None.

---

## K — Claims to verify (merged findings)

The full per-engine verdict table is in M-E. The merged findings are summarised here so that section K appears in the merged body.

| ID | Claim | Merged verdict | Convergence | Source IDs |
|---|---|---|---|---|
| M-K-01 | A risk appetite statement should have no more than 10–12 metrics | Not supported as a rule; partly supported as practice for a board headline view | `[3-source]` on "no rule" | K row 1 (OP, GM), K-GP-01, M-A-08 |
| M-K-02 | Every SMF certifies to the regulator every six months | Not supported | `[3-source]` | K row 2 (OP, GM), K-GP-02, M-D-03 |
| M-K-03 | Building societies are about 25% of the UK market | Partly supported; true only for some measures | `[3-source]` on the figures | K row 3 (OP, GM), K-GP-03, M-J-02 |
| M-K-04 | JPMorgan and Citi said they will not let AI agents execute transactions | Partly supported; true for third-party agents only | `[3-source]` on the restriction | K row 4 (OP, GM), K-GP-04, M-I-07 |
| M-K-05 | The FCA raises conduct expectations by comparing firms to the best in the market | Partly supported | `[3-source]` | K row 5 (OP, GM), K-GP-05 |
| M-K-06 | Building a board risk framework from spreadsheets takes 12–18 months | Unverifiable | `[2-source]` on "unverifiable" (OP, GP) | K row 6 (OP, GM), K-GP-06 |
| M-K-07 | Self-learning models cut trigger latency from about 30 minutes to under 20 seconds | Not supported as stated | `[3-source]` that no source gives these figures | K row 7 (OP, GM), K-GP-07, M-I-09 |

Merged evidence on claim 5, which has no separate body finding:
- **OP:** rules are fixed, but published good and poor practice reports and Final Notices ratchet expectations upward, and the published record can aggravate penalties (M-H-14) `[inference]`.
- **GP:** the FCA increasingly uses outcomes-based rules, supervisory comparisons, good and poor practice reports and fair value evidence. But "the best firm in the market becomes the legal standard" is not a general FCA rule.
- **GM:** under Principle 12, the FCA runs multi-firm reviews and publishes good and poor practice updates, plus its *Raising Standards Together* programme, which benchmark firms against their best peers.
- **Sources:**
  - OP: Linklaters (December 2025).
  - GP: tokens turn25search8, turn25search18, turn25search2 `[ref-incomplete]`.
  - GM: FCA *Consumer Duty Focus Areas 2025/26*; FCA *Payments Consumer Duty Multi-Firm Review*; FCA good and poor practice reports (February, June, September and December 2024). GM marker 35 `[ref-incomplete]`.

Merged evidence on claim 6, which has no separate body finding:
- **OP:** remediation took years at Starling, Monzo and Nationwide, but no source gives 12–18 months for building a framework.
- **GP:** no reliable sector-wide benchmark. Time depends on taxonomy, data lineage, governance redesign and remediation scope `[single]`.
- **GM ("confirmed"), from remediation timelines:**
  - CB Payments took more than 12 months, from a formal control review (December 2022) and a written framework (April 2023) through to full remediation;
  - Starling took 31 months from the September 2021 VREQ to zero monthly breaches (April 2024), and 14 months from the January 2023 discovery;
  - Nottingham needed a dedicated 12-month cycle in 2025.
- **Adversarial reviewer:** GM's evidence measures remediation and platform consolidation, not building a board framework from spreadsheets. It cannot confirm the claim.

---

## S — Merged synthesis themes (carried from each engine's synthesis)

This section keeps each engine's synthesis conclusions so that nothing from them is lost. It adds no new evidence: each item points back to the merged findings above.

### M-S-01 — What a UK board-level risk view must show

- **Source IDs:** OP synthesis 1; GP synthesis 1; GM synthesis 1
- **Convergence:** `[3-source]` on the core items
- **Merged ordered list** (engine in brackets; evidence IDs from this merge):
  1. **Strategic objectives and growth appetite.** Show each objective with the risk capacity it uses, and whether control capacity is keeping pace with growth [OP, GP, GM]. Evidence: M-A-01, M-A-09, M-A-10, M-A-12, M-E-05.
  2. **The board-approved RAS.** For each principal risk, the qualitative statement and a few primary metrics. OP suggests about 12–15 headline metrics with full Level 1 coverage; GM suggests 10–12; GP suggests "sparse" [OP, GP, GM]. Evidence: M-A-01, M-A-08.
  3. **Status against nested thresholds, with forecast, trend and headroom.** Include the calibration rationale, velocity warnings and four-quarter trajectory arrows (GM). "Green" alone is not enough [OP, GP, GM]. Evidence: M-A-04, M-A-07, M-A-10.
  4. **Leading indicators beneath each board metric.** Show the path by which a lower-tier deterioration becomes a breach [GP, GM]. Evidence: M-A-13.
  5. **Top and emerging risks,** mapped to principal risks, with time horizons [OP, GP, GM]. Evidence: M-B-02 to M-B-17.
  6. **Strategic tensions and guardrail collisions:** which growth metric is constrained by which risk metric, and whether a regulatory floor is involved [GP, GM]. Evidence: M-G-03, M-G-04.
  7. **Named accountability:** SMF owner, risk owner, control owner, journey owner, challenger and assurer [OP, GP, GM]. Evidence: M-D-01, M-D-04, M-D-05, M-E-02.
  8. **VREQs and s166 reviews as Level 1 items, with population-level adherence tests** [OP, GP, GM]. Evidence: M-G-02, M-H-02, M-H-03.
  9. **Completeness of critical data feeds:** a source-to-monitoring completeness badge, and the status of monthly attestation [OP, GM]. Evidence: M-D-06, M-H-04.
  10. **An exception feed, not a wall of green:** Level 1 reds and ambers, persistent Level 2 ambers, unremediated issues past SLA, overdue actions [GP, GM]. Evidence: M-B-19, M-B-20.
  11. **Reportability decisions and their clocks,** including documented "not reportable" decisions [OP, GP, GM]. Evidence: M-C-01 to M-C-13.
  12. **Consumer Duty outcomes against tolerances,** and readiness of the annual board report [OP, GM]. Evidence: M-F-01, M-F-02.
  13. **Drill-through from the board view down to controls, incidents and assurance findings** [GP]. Evidence: M-A-02.
- **GP's design principle:** "The board page should be sparse; the evidence graph beneath it should be exhaustive."

### M-S-02 — Qualifiers versus differentiators

- **Source IDs:** OP synthesis 2; GP synthesis 2; GM synthesis 2
- **Convergence:** `[3-source]`
- **Qualifiers** (every serious competitor has these):

| Capability | Named by |
|---|---|
| Risk register | OP |
| RCSA and control library | OP, GP, GM |
| Controls testing | OP |
| Issue and action management | OP, GP |
| KRIs with RAG thresholds | OP, GP, GM |
| Configurable appetite and tolerance | GP |
| Policy repository | OP |
| Audit | OP, GP |
| Dashboards | OP, GP |
| Regulatory feeds and rule mapping | OP, GP, GM |
| Workflow and role-based ownership | GP |
| Loss-event and incident intake | GM |
| Three-lines permissions | GM |

  GP adds that traffic lights, AI summarisation, heat maps, controls linked to risks, and a single CRO dashboard will not be seen as differentiation.
- **Candidate differentiators** (validate before relying on them):

| Differentiator | Named by |
|---|---|
| Strategy-to-control lineage for mid-tier firms in one model | OP, GP, GM |
| Risk capacity as growth intelligence (headroom; growth simulation) | GP, GM |
| Tension register and automated conflict detection | OP, GP, GM |
| Native SMCR binding and reasonable-steps evidence | OP, GM |
| Line of sight over technology changes | OP, GM |
| Immutable reportability records | OP, GP, GM |
| Read-across from Final Notices | OP |
| Growth-normalised control capacity | OP, GM |
| Early-warning graph with lead times | GP |
| Ownership graph across functions and journeys | GP, GM |
| Population-level testing of restriction adherence | GP, GM |
| Governance of AI and agent controls (identity, mandate, tuning lineage) | GP, GM |
| Assurance of silent failures and data-feed completeness | GM |
| Escalation health and anti-suppression governance | GM |

- **Panel disagreement:** GP's CRO prefers "poorly integrated and operationally expensive" to "unserved" (CF-25).

### M-S-03 — The ten product requirements each engine proposed

- **Source IDs:** OP synthesis 3; GP synthesis 3; GM synthesis 3
- **Convergence:** shown per theme

| Theme | OP requirement | GP requirement | GM requirement | Convergence |
|---|---|---|---|---|
| Configurable cascade with nested thresholds | 1. Configurable L1/2/3 taxonomy, nested thresholds and rationale | 2. Board-primary metric layer; 4. Leading-indicator cascade | 1. Four-tier relational cascade engine | `[3-source]` |
| Strategy objects and growth headroom | 2. Strategy objects and headroom view | 1. Strategic risk graph; 3. Risk-capacity and growth simulator | 2. Paired metric-tension and strategic lever simulator | `[3-source]` |
| Proxy for zero tolerance | 3. Measurable proxy for every zero-tolerance statement | — | — | `[single]` |
| SMCR and ownership | 4. SMF/SoR binding, with unmapped items in red | 6. Multi-dimensional ownership | 5. Dual-axis ownership matrix | `[3-source]` |
| Technology change lineage | 5. Ingest technology change logs | — | 5. (pipes IT parameter changes to the risk owner) | `[2-source]` |
| Data completeness and attestation | 6. Feed reconciliations with evidence-based attestation | — | 4. Automated control-completeness and zero-alert monitor | `[2-source]` |
| Reportability | 7. Reportability workflow with immutable records | 7. Regulatory notification decision trail | 7. Defensible reportability triage and read-across | `[3-source]` |
| Tension and policy coverage | 8. Tension register and policy-to-metric coverage map | 5. Tension and conflict engine; 8. Population-level policy adherence | 3. Clause-to-code policy and VREQ traceability | `[3-source]` |
| Consumer Duty | 9. Outcomes with tolerances and journey owners | — | 8. Consumer Duty outcomes and annual board report generator | `[2-source]` |
| Escalation and read-across | 10. Regulatory read-across and consistent escalation | 9. Board-to-control drill-through | 6. Immutable escalation filtering and culture/suppression index | `[3-source]` |
| SMF attestation and resource strain | — | — | 9. SMF attestation and resource-escalation shield | `[single]` |
| AI and model governance | — | 10. Agentic AI governance layer | 10. PRA SS1/23 AI and model risk governance overlay | `[2-source]` |

### M-S-04 — Is the agentic-AI financial crime entry point credible?

- **Source IDs:** OP synthesis 4; GP synthesis 4; GM synthesis 4
- **Convergence:** `[3-source]` that the entry point is not credible as framed (governing external customer agents' payments today). The engines differ on what to do instead.
- **Verdicts:**
  - **OP:** not as the first product, but credible as a second module in 2027–2028. The better wedge is financial crime appetite and governance for fast-growing challengers: VREQ adherence, screening coverage, control capacity against growth, parameter-change lineage and reportability clocks.
  - **GP:** yes, but narrowed: "Govern and detect financial crime across human and AI-initiated payments: prove who or what was authorised to act, continuously test that actions remain inside the mandate and risk appetite, and give the accountable human the evidence to intervene and report." Credible in October 2026 because it solves governance before autonomy is common.
  - **GM:** credible only if reframed from governing external customer payment agents to board and SMF4/SMF17 governance of AI-driven financial crime controls and SS1/23 model risk. The wedge is "financial crime and VREQ control-to-board assurance, including SS1/23 AI model governance", expanding to the full nine-domain appetite platform.
- **Strongest evidence for:**
  - the FCA's framework work and the Mills Review (M-I-01);
  - HM Treasury's consultation on consent and liability (M-I-01, M-I-05);
  - unresolved liability (M-I-05);
  - US bank restrictions showing the risk has reached boards (M-I-07);
  - widespread deployment of agents inside firms (M-I-02);
  - SS1/23 already governs adaptive models (M-I-10);
  - APP reimbursement puts losses on PSPs (M-I-06);
  - the size of financial crime fines (M-H).
- **Strongest evidence against:**
  - no UK AI-specific rules (M-I-01);
  - broad autonomy at only 2%, and no more than 9% planned for consequential actions (M-I-02);
  - banks blocking third-party agents, so there is little to monitor (M-I-07);
  - a crowded detection market (M-I-11);
  - unverifiable latency claims (M-I-09);
  - building societies are likely late adopters (OP, `[inference]`);
  - mid-tier firms are fined for basic data and VREQ failures, not agentic exploits (GM).
- **Panel disagreement:** On timing. OP defers the entry point to 2027–2028. GP says a governance-first framing is credible now. GM says financial crime control assurance is the right wedge now, with AI model governance inside it. All three agree the proposition should not lead with external customer agents.

---

# M-C — Conflict register

Source hierarchy, strongest first:
1. regulator and standard-setter texts;
2. firm annual reports and Pillar 3;
3. industry bodies;
4. trade press;
5. vendor material.

A side supported only by an untraceable token or marker counts as unsourced.

| ID | Subject | Claim A (engines) | Claim B (engines) | Stronger side and reason | Status |
|---|---|---|---|---|---|
| CF-01 | How established the Level 1/2/3 naming is | "Universal UK industry practice" (GM) | No universal definition found; a useful pattern only (GP) | Neither cites a regulator text. Both agree it is not a rule. GP's narrower claim is the safer default | Resolved: present as common practice, not universal |
| CF-02 | Size of the full Level 1 metric suite | 25–45 metrics; GM's CRO adds that the board is "legally required" to approve the full suite annually (GM) | About 10–30, by inference (OP); no total given, 8–15 primary (GP) | None of the three has a regulatory or firm-disclosure source for a total. GM's "legally required" has no rule cited | `[unresolved-conflict]`; "legally required" flagged `[unverified]` |
| CF-03 | What counts as a disclosed appetite metric | Headline KPIs (CET1, LCR, arrears, cost of risk) counted as about 8–12 disclosed appetite metrics per firm (GM) | Appetite disclosure is narrative; no public count of RAS metrics (OP, GP) | Definitional. Annual reports disclose KPIs, but whether they are RAS metrics needs the firm's own labelling | `[unresolved-conflict]`; define "appetite metric disclosed" before reuse |
| CF-04 | Nationwide principal-risk list | 8: credit; liquidity and funding; capital; market; pension; business; operational and conduct; model (OP from ARA 2025; GP from ARA 2026) | 7–8: includes operational and resilience, conduct and compliance, strategic/execution, climate; omits pension, business and model (GM, from ARA 2024 / Pillar 3 2025, marker only) | OP and GP: two engines, two report years, both annual reports cited, matching lists | Resolved in favour of OP and GP; GM list `[unverified]` |
| CF-05 | Coventry emerging risks (ARA 2024) | Climate; Co-op Bank integration; change; cyber; financial crime (OP) | Economic/geopolitical; housing, mortgage and funding market; customer behaviour; technology/digital innovation (GP) | Both cite Coventry reports; OP also uses H1 2025. The lists may reflect different categories (top versus emerging) or documents | `[unresolved-conflict]`; read the document |
| CF-06 | Skipton ARA 2024 publication date | 25 February 2025 (GP) | March 2025 (GM) | GP gives an exact date; GM gives a month only | `[unresolved-conflict]` (minor) |
| CF-07 | Leeds ARA 2025 publication date | 26 February 2026 (GP) | 06 March 2026 (GM) | Both cite the same PDF. Possibly results date versus AGM-pack date | `[unresolved-conflict]` (minor) |
| CF-08 | Leeds climate risk classification | Climate is emerging or cross-cutting, not a standalone principal risk (OP, GP) | Climate is one of the principal risks, assessed through the CRMF across all of them (GM) | OP and GP: two engines with explicit wording | Resolved in favour of OP and GP; verify |
| CF-09 | Metro principal-risk count | About 10 (OP) | 11, with the full list (GP) | GP: explicit enumeration from ARA 2025 (15 April 2026) | Resolved in favour of GP |
| CF-10 | Current operational incident reporting regime | New regime under FCA PS26/2 and PRA PS7/26 (18 March 2026) applies from 18 March 2027; until then Principle 11, FR7 and existing outsourcing rules apply (OP, GP) | Immediate notification on impact tolerance breach now, under PS21/3, SS1/21, SS2/21, PS16/24 and "CP24/28", with staged reports (GM) | OP and GP cite regulator policy statements with URLs. GM cites a consultation paper with no URL | Resolved in favour of OP and GP on the regime and its date; GM's current-state description `[unverified]` |
| CF-11 | How Starling's reporting is characterised | Starling did not report a VREQ breach immediately and the FCA recorded disappointment (OP: July–August 2022) | Starling notified its screening gap promptly and was credited (GM: February 2023) | Different incidents; both may be true | Resolved: not a contradiction; keep both (M-C-08, M-C-09) |
| CF-12 | Consequences of over-reporting | No text penalises over-reporting; costs are governance costs (OP, GP) | Over-reporting erodes supervisory confidence, invites read-across requests and a watch-list (GM) | Neither cites a rule. GM's is an inference about supervisor behaviour | Resolved as compatible: no penalty rule, possible supervisory cost `[inference]` |
| CF-13 | Monthly data attestation | Mature UK firms run monthly human data-completeness attestation, and it sharpens accountability (GM) | Frequency and population vary; no evidence it improves outcomes (GP); first-line rubber-stamping risk (OP) | No primary source on either side. GM cites BankingNewsAI (trade or aggregator) | `[unresolved-conflict]`; test with practitioners (M-J, Q7) |
| CF-14 | IIA Three Lines Model date | July 2020 (OP, GM) | 08 September 2020, updated 2024 (GP, citing the IIA PDF) | GP cites the standard-setter document; the PDF path itself contains "july-2020" | `[unresolved-conflict]` (minor); likely announced July 2020 |
| CF-15 | Must every policy map to a metric? | Every policy and VREQ must map to at least one control and one KRI in a compliant architecture (GM); each policy statement maps to at least one metric or test (OP, implication) | Too strong; no rule requires one-to-one; implementation can be evidenced by controls, testing, approvals or training (GP) | No regulator text on either side. GP's position matches the absence of a rule | Resolved as a rule-versus-practice question: not a rule. Strict mapping is a product design choice |
| CF-16 | Monzo high-risk count in the VREQ breach | More than 34,000 high-risk customers (GP, citing the FCA press release of 08 July 2025; OP's first figure) | 26,325 accounts (OP's second figure, source not specified) | GP cites the regulator press release | Leaning to 34,000+ customers; customers versus accounts may explain the gap. `[unresolved-conflict]` until checked against the Final Notice |
| CF-17 | Starling Final Notice date | 27 September 2024 (OP) | 02 October 2024 (GP press release; GM "Final Notice") | Both cite FCA documents. Likely the Notice is dated 27 September and was published 2 October | `[unresolved-conflict]`; check the face of the Notice |
| CF-18 | Date of the FCA Consumer Duty board reports review | 11 December 2024 (GP); December 2024 (GM) | Updated 24 February 2025 (OP) | Compatible: original publication and later update | Resolved |
| CF-19 | Number of UK building societies | 42 (OP and GM, June–November 2025) | 43 (GP, BSA, 18 June 2026) | Same industry body; GP's date is later. OP says "including" two mutual-owned banks; GM says "plus" | `[unresolved-conflict]`; use the current BSA count and state whether mutual-owned banks are included |
| CF-20 | Cash ISA share | 47% (OP, March 2025) | About 46% (GP, March 2026); 46–47% (GM, 2025) | Different dates from the same body | Resolved as `[near-dup]` by date |
| CF-21 | HSBC investigation time with Google AML AI | "From several weeks to a few days" (OP) | "From several weeks to about 8 days" (GM) | Both vendor-adjacent `[marketing-grade]` | `[unresolved-conflict]` (minor); do not quote either without the primary case study |
| CF-22 | ServiceNow board appetite capability | Yes, configurable; official documentation supports appetite and tolerance configuration (GP); configurable (OP) | Basic; weak on prudential RAS (GM, citing third-party comparison) | GP cites vendor documentation, which outranks third-party comparison sites, though both are vendor-tier | Resolved in favour of "configurable", with GM's caveat on prudential depth noted |
| CF-23 | Scope and strictness of SS1/23 | Formally targets firms with internal model approval; others may adopt it (OP, citing the regulator text) | UK banks are "not permitted" to let self-learning models re-tune production thresholds without validation (GM); applies to AI systems and components (GP) | OP cites the regulator text. GM's "not permitted" is an inference | Resolved on scope in favour of OP; GM's prohibition wording `[inference]` |
| CF-24 | Source and date of the 86% AI adoption figure | Trade press dated 20 October 2026, `[single]` (OP) | Bank of England and FCA report, 26 October 2026, with full breakdown (GP) | GP cites the regulator report | Resolved in favour of GP's primary source |
| CF-25 | Strength of the white-space claim | No one combines strategy linkage, tension, SMCR and reportability (OP); clear white space (GM synthesis; GP NED view) | Protecht is strong on appetite and good on strategy linkage and ownership (GM's own table); large banks may approximate it with bespoke tooling (GP CRO) | All vendor-tier or inference | `[unresolved-conflict]`; validate with buyers and a Protecht demo |
| CF-26 | APP reimbursement figures | About 88%, about £173m (year one, OP); 89%, £243m (15 months, OP) | 88%, £316m (18 months to 31 March 2026, GP) | Different periods. GP cites the PSR dashboard (regulator) | Resolved as `[near-dup]` by period; prefer the PSR dashboard |
| CF-27 | Claim 1 verdict | Not supported (GP); not supported as a rule (OP) | Partly supported (GM); partly supported as practice (OP) | No regulator cap exists | Resolved: not supported as a rule, partly supported as practice |
| CF-28 | Claim 3 verdict | Confirmed for stock and new lending (GM) | Partly supported (OP, GP) | All three use the same BSA figures; the verdict depends on the measure | Resolved: partly supported, with the measure stated |
| CF-29 | Claim 4 verdict | Confirmed, for third-party agents (GM) | Partly supported (OP, GP); Citi's 28 July 2026 paper envisages agent-executed transactions (GP) | GP cites the bank's own publication and terms of use. GM relies on trade and crypto press | Resolved: partly supported |
| CF-30 | Claim 5 verdict | Confirmed (GM) | Partly supported (OP, GP) | No FCA rule makes best practice the standard (GP) | Resolved: partly supported |
| CF-31 | Claim 6 verdict | Confirmed, from remediation timelines (GM) | Unverifiable (OP, GP) | GM's evidence measures something else | Resolved: unverifiable |
| CF-32 | Claim 7 verdict | Partly supported for streaming fraud; not supported for AML (GM) | Unverifiable (OP); not supported (GP) | No source gives the figures | Resolved: not supported as stated |

---

# M-D — Single-source register

Every merged finding or sub-claim that only one engine supports, why it may matter, and the risk of relying on it.

| Merged ID | Engine | Single-source claim | Why it may matter | Reliance risk |
|---|---|---|---|---|
| M-A-05 | GM | Aggregating non-financial Level 3 metrics to Level 1 is the hardest design problem | Defines the roll-up engine's hardest requirement | Panel view only |
| M-A-11 | GM | Nottingham cut lending from £1.2bn to £0.9bn to embed MQube | Best example of appetite used as a throttle | Firm report, marker unmapped |
| M-A-12 | GM | Bank of Scotland (2012) precedent of personal enforcement for growth without control capacity | Supports the growth-capacity gate | Outside the five-year scope |
| M-A-14 | OP | No dedicated FCA risk appetite guidance for solo-regulated firms | Shapes the proposition for FCA-only firms | `[unverified]` |
| M-A-13 (part) | GM | "Tortoises versus hares" view of risk velocity | Useful framing for leading indicators | Unmapped source |
| M-A-07 (part) | GM | SS31/15 and SS24/15 expect early-warning indicators well ahead of minima | Would give a regulatory basis for amber buffers | Rule attribution `[unverified]` |
| M-A-04 (part) | OP | Tapestry Networks submission to the FSB on buffers | Primary practitioner evidence on the nested-threshold design | 2013 consultation submission |
| M-B-09 | OP | OSB: appetite at entity and group level; very low reputational appetite | Entity-level appetite requirement | `[unverified]` counts |
| M-B-13 | OP | Paragon Bank report reviewed; group report not found | Coverage gap | Thin |
| M-B-14 | GM | Shawbrook: top and emerging risks separated from principal risks; credit appetite linked to faster completions | Strong challenger example | Marker unmapped |
| M-B-15 | GM | Nottingham disclosure with directional arrows | Tier 3 example | Marker unmapped |
| M-B-16 | GM | Cambridge proportionate disclosure | Tier 3 example | Marker unmapped |
| M-B-17 | GM | OakNorth IRRBB-centred appetite | Specialist lender example | Marker unmapped |
| M-B-18 | GM | 30% of branches, £2.3bn fair-value premium, NIM compression | Sector positioning | Grouped row |
| M-B-20 (part) | GM | Metro minute-deletion timeline | Strongest evidence for immutable escalation | Final Notice detail via LearnSignal; check the Notice |
| M-B-20 (part) | OP | Starling committees received different information | Supports a single source of truth | Quote only |
| M-C-01 (part) | GM | 24–72 hour triage window before notification | Would set the default clock | `[practice-not-rule]` `[unverified]` |
| M-C-03 | OP | Handbook Notice 139 amended SUP 15 and inserted 15.18 and 15.19 | Rule library versioning | `[unverified]` |
| M-C-07 | GM | OFSI immediate and ICO 72-hour notifications | Completes the triage engine | `[unverified]` |
| M-C-08 | OP | Starling's late VREQ report and FCA disappointment | Demo story for "days to notify" | Final Notice quote |
| M-C-09 | GM | Starling's prompt screening notification was credited | Demo contrast | Paragraph reference `[unverified]` |
| M-C-10 | GM | Metro notification dates (17 April 2019 found, 29 May 2019 notified) | Measures flag-to-notify time | Marker unmapped |
| M-D-02 (part) | GP | PRA CP14/26 Phase 2 (23 October 2026): 43% fewer pre-approvals; about 7,700 certifications removed | Changes what the SMCR module must model from H2 2027 | Very recent; check |
| M-D-02 (part) | GM | DP1/23 (30 March 2023) | Reform history | No URL |
| M-D-03 (part) | GM | Supervisors require periodic SMF attestations under a VREQ or s166 | Explains the six-monthly recollection; supports a supervisory attestation template | `[practice-not-rule]` `[single]` |
| M-D-04 (part) | OP | "Performer" role distinct from control owner | Data model field | Practice |
| M-E-01 (part) | GM | The RBNZ adopted Three Lines Model wording in 2026 | Context only | Outside the UK |
| M-E-02 | GP | Leeds as a clean three-lines implementation | Reference design | Annual report |
| M-E-03 (part) | GM | Self-identification ratio as a third-line maturity metric | Differentiating metric | Vendor-adjacent source |
| M-E-06 | GM | Starling para 4.15 on skills; Sonali Bank MLRO precedent | Supports the resource strain indicator | Paragraph `[unverified]`; Sonali `[scope]` |
| M-E-07 | GM | Reliance on occasional external reviews at Monzo and Starling | Supports continuous assurance | Marker unmapped |
| M-F-03 | GM | Fair value assessments must go beyond competitor fee benchmarking | Conduct metric design | IFA-focused source `[scope]` |
| M-F-06 (part) | GM | Risk is most severe in the most profitable areas (operational risk commentator) | Culture metric rationale | Commentary |
| M-G-03 (part) | GP | Liquidity buffers versus return tension | Tension register example | Inference |
| M-G-03 (part) | GM | Member pricing versus capital; vulnerability versus privacy (FCA/ICO joint statement) | Building society-specific tensions | Marker unmapped |
| M-H-01 | OP | 13 AML bank fines since 2021, totalling £300,767,526 | Sales context | Check the FCA source |
| M-H-06 | OP | Metro PRA fine £5,376,000 (2021) | Regulatory reporting case | Regulator source |
| M-H-07 | GP | Metro FCA disclosure fine £10.0m (2022) | Disclosure-control case | Regulator source (token) |
| M-H-08 | OP | TSB £48.65m (2022) | Change and resilience case | Press source |
| M-H-10 | GP | HSBC £63.9m (2021), transaction monitoring parameters | Parameter governance case | Token only |
| M-H-11 | GP | NatWest £264.8m criminal fine (2021) | Profile-deviation case | Token only |
| M-H-13 | GM | CB Payments £3.5m (2024): VREQ coded from a draft | Clause-to-code traceability | `[scope]` |
| M-H-14 | OP | The FCA cited published notices as aggravating factors (Nationwide) | Read-across feature | Law firm commentary |
| M-I-02 (part) | GP | Survey autonomy breakdown (2% broad autonomy; at most 9% planned for consequential actions) | Key "against" evidence for the agentic entry point | Very recent; check |
| M-I-03 | OP | FSB 12 practices for agentic AI (October 2026) | Agent governance mapping | `[unverified]` |
| M-I-04 (part) | GM | EU AI Act carve-out for fraud and AML detection | Affects the EU proposition | `[unverified]` |
| M-I-04 (part) | GP | Fed September 2026 discussion on registering agents | US proposition | Token only |
| M-I-05 (part) | OP | Merchant survey: 58% believe agents have transacted; 41% confident in liability | Market signal | `[single]` |
| M-I-08 (part) | OP | Axios: agents acting independently of user instructions | Risk narrative | Secondary |
| M-I-10 (part) | OP | Reported April 2026 revision of SS1/23 | Rule library | `[single]` |
| M-I-11 (part) | GM | Absa, C3 AI and Credal.ai performance claims | Vendor landscape | `[marketing-grade]` |
| M-J-03 | GM | Nature limit 75% and funding limit 50%; Nationwide shares | Built-in society metrics | `[unverified]` |
| M-J-04 (part) | GM | Four-tier segmentation with SDDT transition | Go-to-market segmentation | `[inference]` |
| M-J-07 (part) | GM | Skipton new risk committee chair (April 2025); Leeds core banking change; Shawbrook IPO | Named trigger examples | Marker unmapped |
| M-J-08 (part) | GM | Protecht as the direct UK mid-tier competitor | Critical to positioning | Vendor-tier |
| M-J-08 (part) | OP | UK SMCR tools and AI-native entrants as categories | Competitive framing | Panel knowledge |
| M-J-10 (part) | GM | PoC budgets of £25k–£100k over 8–12 weeks; 49 BSA associate partners | Pricing and channel | `[practice-not-rule]` |

---

# M-E — Claims verdict table

| # | Claim | OP verdict | GP verdict | GM verdict | Merged verdict | Best source | Confidence |
|---|---|---|---|---|---|---|---|
| 1 | A risk appetite statement should have no more than 10–12 metrics | Not supported as a rule; partly supported as practice | Not supported | Partly supported: right for principal risks and the board cover dashboard, not for the full schedule (25–45) | **Not supported as a rule; partly supported as practice** for a headline board view. Principal risks alone number 7–11, before supporting metrics | FSB, *Principles for an Effective Risk Appetite Framework*, 18 November 2013; firm reports (Nationwide 8, Leeds 8, Metro 11) | High that there is no rule; low on the size of the full suite (CF-02) |
| 2 | Every SMF gives a six-monthly certification to the regulator | Not supported | Not supported | Not supported | **Not supported.** The Certification Regime covers non-SMF staff and is annual and firm-run. Six-monthly SMF attestations are internal practice or bespoke VREQ/s166 requirements | HM Treasury SMCR consultation response, 22 April 2026; FCA PS26/6 and PRA PS12/26, April 2026 | High |
| 3 | Building societies are about 25% of the UK market | Partly supported | Partly supported | Confirmed for stock and new lending; higher on flows and ISAs | **Partly supported.** Savings balances 23%; mortgage balances 29% (including mutual-owned banks; 23% for societies alone in 2022/23); new lending over 25% (January–September 2023); gross lending 32%; net lending 52%; Cash ISAs 46–47% | BSA trading updates (June 2025, November 2025, 18 June 2026) | High on figures; the verdict depends on the measure |
| 4 | JPMorgan and Citi said they will not let AI agents execute transactions | Partly supported | Partly supported | Confirmed for third-party agents | **Partly supported.** True for unapproved third-party agents logging in or transacting. Both banks are building their own agents (Smart Cash, Arc), and Citi has published a vision of agent-executed commerce | Reuters, 22 October 2026; JPMorgan Chase terms of use (accessed 27 October 2026); Citi, 28 July 2026 | Medium (mostly secondary reporting of statements) |
| 5 | The FCA raises conduct expectations by comparing firms to the best in the market rather than setting fixed standards | Partly supported | Partly supported | Confirmed | **Partly supported.** Rules are outcomes-based and fixed, but good and poor practice publications, multi-firm reviews and Final Notices ratchet expectations up. The best firm does not legally become the standard | FCA Consumer Duty good and poor practice reports (2024–2026); Linklaters on Nationwide (December 2025) | Medium |
| 6 | Building a board risk framework from spreadsheets typically takes 12–18 months at a fast-growing bank | Unverifiable | Unverifiable | Confirmed, from remediation timelines | **Unverifiable.** GM's evidence measures remediation and platform consolidation, not building a framework | No primary benchmark; Final Notices give remediation durations only | Low; needs practitioner evidence |
| 7 | Financial crime trigger latency can be cut from about 30 minutes to under 20 seconds with self-learning models | Unverifiable | Not supported | Partly supported for streaming fraud; not supported for holistic AML or under SS1/23 | **Not supported as stated.** No source gives these figures. Streaming inference can cut payment-fraud triggers to seconds (GM inference). AML AI scores customers holistically, and SS1/23 requires governed tuning | Google AML AI and HSBC material (June 2023, `[marketing-grade]`); PRA SS1/23, 17 May 2023 | Medium |

---

# M-F — Coverage check

Each theme that appears in any input is listed below with where it sits in the merged body. "Recall gap" marks themes that an input touched only thinly, so the merged treatment is thin too.

| Theme | GP | OP | GM | Where in M-B | Recall gap |
|---|---|---|---|---|---|
| FSB RAF definitions and the strategy link | ✓ | ✓ | ✓ | M-A-01 | — |
| Terminology (RMF, RAF, RAS, KRI, KCI, RCSA, RCM) | ✓ | ✓ | ✓ | M-A-02 | — |
| Level 1/2/3 is practice, not rule | ✓ | ✓ | ✓ | M-A-03 | — |
| Nested thresholds and buffers | ✓ | ✓ | ✓ | M-A-04 | — |
| Rolling non-financial metrics up the levels | — | — | ✓ | M-A-05 | Only GM covers it; no method given |
| Zero tolerance and proxies | ✓ | ✓ | ✓ | M-A-06 | — |
| Calibrating amber and red; wider lower-tier bands; amber fatigue | ✓ | ✓ | ✓ | M-A-07 | No calibration method is evidenced anywhere |
| Number of metrics | ✓ | ✓ | ✓ | M-A-08 | — |
| Strategy, planning and ICAAP links | ✓ | ✓ | ✓ | M-A-09 | — |
| Credit appetite as a growth lever | ✓ | ✓ | ✓ | M-A-10 | — |
| Appetite as a throttle | — | — | ✓ | M-A-11 | — |
| Matching growth to control capacity | ✓ | ✓ | ✓ | M-A-12, M-E-05 | — |
| Leading and lagging indicator library | ✓ | ✓ | ✓ | M-A-13 | — |
| FCA guidance for solo-regulated firms | — | ✓ | — | M-A-14 | Thin |
| PRA rule anchors | ✓ | ✓ | ✓ | M-A-15 | Many anchors are `[unverified]` |
| Disclosure versus internal packs | ✓ | ✓ | ✓ | M-B-01 | — |
| Firm-by-firm disclosures (15 firms) | ✓ | ✓ | ✓ | M-B-03 to M-B-17 | Monzo, Paragon and Principality counts unverified; Coventry, Yorkshire and Principality not covered firm-specifically by GM |
| Sector benchmarks (branches, fair value premium) | — | — | ✓ | M-B-18 | — |
| Escalation filtering | ✓ | ✓ | ✓ | M-B-19 | No primary source; practice only |
| Suppression of bad news (Metro) | ✓ | ✓ | ✓ | M-B-20 | — |
| Principle 11 and SUP 15 | ✓ | ✓ | ✓ | M-C-01 | — |
| PRA FR7 | ✓ | ✓ | ✓ | M-C-02 | FR7 wording not quoted from source |
| SUP 15 amendments in 2026 | — | ✓ | — | M-C-03 | — |
| Incident and third-party regime from 2027 | ✓ | ✓ | ✓ | M-C-04 | GM's description conflicts (CF-10) |
| Conduct Rule notifications | ✓ | ✓ | ✓ | M-C-05 | Timings unverified |
| SARs | ✓ | ✓ | ✓ | M-C-06 | — |
| OFSI and ICO | — | — | ✓ | M-C-07 | — |
| Notification timing cases (Starling, Metro) | — | ✓ | ✓ | M-C-08 to M-C-10 | — |
| Under- and over-reporting; read-across | ✓ | ✓ | ✓ | M-C-11 | — |
| Defensible decision step | ✓ | ✓ | ✓ | M-C-12 | — |
| One event, many clocks | ✓ | ✓ | ✓ | M-C-13 | — |
| SMCR architecture | ✓ | ✓ | ✓ | M-D-01 | — |
| SMCR reform timeline | ✓ | ✓ | ✓ | M-D-02 | — |
| The six-monthly certification claim | ✓ | ✓ | ✓ | M-D-03 | — |
| Risk owner versus control owner | ✓ | ✓ | ✓ | M-D-04 | — |
| Horizontal and vertical ownership; line of sight | ✓ | ✓ | ✓ | M-D-05 | — |
| Monthly attestation | ✓ | ✓ | ✓ | M-D-06 | Evidence of efficacy missing (CF-13) |
| The IIA model | ✓ | ✓ | ✓ | M-E-01 | IIA text not quoted |
| Leeds three-lines example | ✓ | — | — | M-E-02 | — |
| Metric suites by line | ✓ | ✓ | ✓ | M-E-03 | — |
| Independence of internal audit | ✓ | — | ✓ | M-E-04 | — |
| Controls outpaced by growth | ✓ | ✓ | ✓ | M-E-05 | — |
| Under-resourced second line | — | — | ✓ | M-E-06 | — |
| Reliance on external reviews | — | — | ✓ | M-E-07 | — |
| Audit findings not reaching the board | ✓ | ✓ | ✓ | M-E-08 | — |
| Consumer Duty board report | ✓ | ✓ | ✓ | M-F-01 | — |
| Outcomes by cohort and vulnerability | — | ✓ | ✓ | M-F-02 | — |
| Fair value | — | — | ✓ | M-F-03 | Source is out of scope |
| Journey ownership | ✓ | ✓ | ✓ | M-F-04 | — |
| Culture and non-financial misconduct | ✓ | ✓ | ✓ | M-F-05 | — |
| Data versus judgement | ✓ | ✓ | ✓ | M-F-06 | — |
| Policy-to-metric linkage | ✓ | ✓ | ✓ | M-G-01, M-G-02 | — |
| Metric tensions | ✓ | ✓ | ✓ | M-G-03, M-G-04 | — |
| Tools for detecting conflicts | ✓ | ✓ | ✓ | M-G-05 | No published method found by any engine |
| Enforcement cases (13) | ✓ | ✓ | ✓ | M-H-01 to M-H-15 | No building society case other than Nationwide; no case found involving a mid-tier society's appetite framework |
| UK agentic AI statements | ✓ | ✓ | ✓ | M-I-01 | — |
| Survey on AI and agent adoption | ✓ | ✓ | — | M-I-02 | — |
| FSB agentic practices | — | ✓ | — | M-I-03 | Unverified |
| EU and US positions | ✓ | ✓ | ✓ | M-I-04 | Not researched to primary standard by any engine |
| Liability and the APP regime | ✓ | ✓ | ✓ | M-I-05, M-I-06 | — |
| US bank stances | ✓ | ✓ | ✓ | M-I-07 | Mostly secondary sources |
| Speed and scale of AI fraud | ✓ | ✓ | — | M-I-08 | No quantified UK figure |
| Latency benchmarks | ✓ | ✓ | ✓ | M-I-09 | No benchmark exists in the inputs |
| SS1/23 | ✓ | ✓ | ✓ | M-I-10 | — |
| Vendors | ✓ | ✓ | ✓ | M-I-11 | All marketing-grade |
| First-party bank agents | ✓ | ✓ | ✓ | M-I-12 | — |
| Number of building societies and market shares | ✓ | ✓ | ✓ | M-J-01, M-J-02 | — |
| Statutory nature and funding limits | — | — | ✓ | M-J-03 | — |
| Market tiers | ✓ | ✓ | ✓ | M-J-04, M-J-05 | — |
| Buyers and triggers | ✓ | ✓ | ✓ | M-J-06, M-J-07 | No buyer interview evidence |
| Competitors | ✓ | ✓ | ✓ | M-J-08, M-J-09 | Feature claims unverified; no pricing evidence |
| Partnership programmes | ✓ | ✓ | ✓ | M-J-10 | Programme terms unverified |
| Claims 1–7 | ✓ | ✓ | ✓ | K, M-E | — |
| Synthesis: board view, qualifiers, requirements, agentic verdict | ✓ | ✓ | ✓ | M-S-01 to M-S-04 | — |
| Questions for a former CRO | ✓ | ✓ | ✓ | M-J (register) | — |

Main recall gaps:
1. PX is missing, so a fourth independent view is absent throughout.
2. No engine opened full annual report PDFs to count appetite metrics.
3. No engine verified competitor features against product documentation (except ServiceNow, via GP).
4. EU and US agentic AI positions were not researched to primary standard.
5. No engine found evidence on buyer budgets or pricing.

---

# M-G — Verify-before-use list

Every statistic, date, rule reference or quote below must be checked against its primary source before it goes into a pitch, board demo or client document. ★ marks the highest-risk items: those most likely to be wrong, most likely to be quoted, or carrying legal weight.

### Rule references and regulatory texts

| Item | Merged ID | Why check |
|---|---|---|
| ★ SUP 15.3.1R wording ("immediately", "reasonably suggests") and SUP 15.3.11R | M-C-01 | Core of the reportability engine |
| ★ The FR7 wording; GM's claim that it "mirrors Principle 11 verbatim" | M-C-02 | Not quoted from source by any engine |
| ★ FCA PS26/2 and PRA PS7/26 (18 March 2026) and the 18 March 2027 start; standard and enhanced tiers; about 90% of firms standard | M-C-04 | Fixed-date buying trigger; conflicts with GM (CF-10) |
| GM's CP24/28, PS16/24, PS21/3, SS1/21, SS2/21 references | M-C-04 | Instrument numbers unverified |
| ★ SMF Conduct Rule notification: 7 business days; Forms C and D; REP008 within two months | M-C-05 | Timings from panel knowledge |
| POCA ss.330–331; SAMLA; UK GDPR Article 33 (72 hours) | M-C-06, M-C-07 | Statute citations |
| Handbook Notice 139 (SUP 15.3 amended; 15.18 and 15.19 inserted) | M-C-03 | Single source |
| SS5/21 / PS6/25 (20 May 2025) in relation to FR7 | M-C-02 | Relevance to deposit-takers unclear |
| FSMA s66A/66B and s.66A(5); s.63F; SUP 10C.11; SYSC 24.2 PR(d); SYSC 25; SYSC 27; COCON 4.2 | M-D-01, M-D-03 | Section numbers |
| ★ PRA CP14/26 (23 October 2026): 43% fewer pre-approvals; about 7,700 certifications removed; closes 22 January 2027; H2 2027 | M-D-02 | Very recent; likely to be quoted |
| FCA PS26/6 and PRA PS12/26 (April 2026); 30 July 2026 directory changes | M-D-02 | Dates |
| CP25/21, CP18/25 (15 July 2025); DP1/23 (30 March 2023) | M-D-02 | Dates |
| HM Treasury consultation response (22 April 2026) | M-D-02, M-D-03 | Basis for the claim 2 verdict |
| PRA Rulebook "ICAA 3.1" and "General Organisational Requirements 2.1" | M-A-03 | Unverified |
| SS31/15, SS24/15 on early-warning indicators | M-A-07 | Unverified attribution |
| FR2, FR5, FR6; SS5/16; SS28/15 | M-A-15 | Unverified wording |
| ★ SS1/23: 17 May 2023 and 17 May 2024; scope ("all types of models… including vendor models"); whether it applies beyond firms with internal model approval; the April 2026 revision | M-I-10 | Scope conflict (CF-23) |
| PRIN 2A.8.3R–2A.8.5R; 31 July 2023 and 31 July 2024 | M-F-01 | Rule numbers |
| FCA PS25/23 (non-financial misconduct); July 2025 and April 2026 COCON updates | M-F-05 | Instrument number |
| ★ PSR APP regime: 07 October 2024; £85,000; 50:50; 5 and 35 business days; £100 excess; PS25/5 | M-I-05 | Likely to be quoted |
| PSRs 2017 Regulations 67 and 76 | M-I-05 | Regulation numbers |
| Building Societies Act limits: 75% nature, 50% funding | M-J-03 | Single source |
| ★ EU AI Act dates (01 August 2024, February 2025, August 2026) and the claimed carve-out for fraud and AML | M-I-04 | Not researched to primary standard |
| DORA (17 January 2025); SR 11-7 | M-I-04 | — |
| IIA Three Lines Model date (July versus 08 September 2020) | M-E-01 | CF-14 |

### Enforcement figures and dates

| Item | Merged ID | Why check |
|---|---|---|
| ★ Starling: £28,959,426 / £40,959,426; Final Notice date 27 September or 02 October 2024; 54,359 accounts / 49,183 customers; 39 of 3,088; 294 exited customers; about £900k; zero alerts 1 July 2022 to 30 January 2023; April 2024 first zero-breach month; 161 prior SAR subjects; 309 further breaching accounts; para 2.11 and para 4.15 | M-H-02, M-C-08, M-C-09, M-E-06 | Anchor case in any demo |
| ★ Starling notification dates: 21 July 2022 / 24 August 2022; 10 February / 16 February / 24 February 2023 | M-C-08, M-C-09 | Demo story |
| ★ Monzo: £21,091,300; 7 or 8 July 2025; 34,000+ versus 26,325; £10.0m deterrence uplift on £805,250; 1 October 2018 to 4 August 2020; VREQ August 2020 to February 2025 | M-H-03, M-C-11 | CF-16 |
| ★ Metro (FCA): £16,675,200 / £23,821,700; 60,483,951 of 1,008,426,668; £51.25bn of £675.8bn; 166,358 + 71,627 accounts; 153 SARs; 43 closures; 1,352,665 to 438 a month; 3,135 discrepancy; minute deletion January 2018; 16 August 2018; 17 April 2019; 29 May 2019 | M-H-04, M-B-20, M-C-10 | Detail from LearnSignal |
| Metro (PRA) £5,376,000, 21 December 2021; Metro (FCA) £10.0m, 12 December 2022 | M-H-06, M-H-07 | — |
| ★ Nationwide: £44,078,500; 12 December 2025; £26.01m furlough fraud in eight days | M-H-05 | Building society anchor |
| TSB £48,650,000 (£29.75m / £18.9m; £69.5m before discount; £32.7m redress) | M-H-08 | Press source |
| Santander £107,793,300; 560,000+ customers; £298m | M-H-09 | — |
| HSBC £63.9m (17 December 2021); NatWest £264.8m (13 December 2021) | M-H-10, M-H-11 | Token-only sources |
| Barclays about £42m (£3.09m + £39.3m), 16 July 2025 | M-H-12 | — |
| CB Payments £3,503,546; 1,034; 199; 62 SARs (about $1.75m) | M-H-13 | Out of scope |
| ★ 13 AML bank fines since 2021, totalling £300,767,526 | M-H-01 | Single source; likely headline |
| Starling s166 28 May 2021; VREQ 17 September 2021 | M-C-11 | — |
| FCA challenger bank review, 22 April 2022 | M-E-05 | — |

### Market and firm statistics

| Item | Merged ID | Why check |
|---|---|---|
| ★ Number of building societies: 42 or 43 | M-J-01 | CF-19 |
| ★ Market shares: 29% / 23% / 32% / 52% / 31% / 46–47% / 27% / 33% / 30% branches; £485.7bn / £493bn / £496bn / £499bn / £502bn | M-J-02 | Claim 3 verdict depends on these |
| Nationwide £280.6bn mortgages (16.3%); £260.7bn deposits (12.2%) | M-J-03 | Single source |
| Nationwide CET1 19.1%, leverage 5.3%, LCR 169%, cost of risk 11 bps, +8.6 points, 14.5% vs 10.7% | M-B-03 | GM only |
| Leeds CET1 25.5%, cost-income 46.1%, arrears 0.57%, 94%, 8.4/10 (89%, 1,653), +0.90%, climate targets | M-B-07, M-F-05 | GM only |
| Skipton HQLA £6.0bn, 50% first-time buyers, 8.2%, 8.9%, "1 in 8" | M-B-06 | GM only |
| Shawbrook CET1 12.4%, 14.8%, 8.4%, 310.9%, £19.2bn, 47/51 bps, 39.0%, 17.2%, 46% / 18% / 36–46% | M-B-14, M-A-10 | GM only |
| Nottingham £5.4bn, £1.2bn to £0.9bn, £16.7m, 1.72%, 13.7%, 4.9%, 172% | M-B-15 | GM only |
| Coventry lending +43% to £9.6bn, LTV 67%, 0.38% arrears; share 3.1% to 4.2% | M-A-10, M-J-04 | Trade press |
| Leeds Income Plus £66,000 more at 95% LTV | M-A-10 | GM only |
| Starling 43,000 to 3.6m; Monzo 600,000 to 5.8m | M-E-05 | Press release quotes |
| £2.3bn sector fair value premium; 12% versus 44% branch reduction | M-B-18 | Grouped row |
| Tier asset bands and firm assets (Skipton £38.7bn+, Leeds £32.0bn) | M-J-04 | GM only |

### AI, fraud and vendor statistics

| Item | Merged ID | Why check |
|---|---|---|
| ★ Bank of England / FCA survey: 196 responses; 86%; 80% agents; 80/46/22/2%; at most 9% | M-I-02 | Key "against" evidence for the agentic entry point |
| ★ Mills Review: 6 July 2026; 147 pages; seven recommendations; quoted wording | M-I-01 | Likely to be quoted |
| HM Treasury AI Adoption Plan and payments consultation (14 July 2026) | M-I-01 | — |
| FCA speech and AI review (19 October 2026); "ultimately agentic" | M-I-01 | Trade press for the quote |
| FCA payments priorities (25 March 2026) quote | M-I-01 | Trade press |
| FSB 12 agentic practices (October 2026) | M-I-03 | Single, unverified |
| ★ APP outcomes: 88% / £173m; 89% / £243m; 88% / £316m; £576.4m (+19%); 21–94% | M-I-06 | Period differences (CF-26) |
| Merchant survey: 58% / 41% | M-I-05 | Single |
| ★ JPMorgan, Citi, Bank of America and Morgan Stanley quotes and dates (14, 22 and 24 October 2026; 28 July 2026); Smart Cash; Arc | M-I-07 | Secondary sources; reputational risk if misquoted |
| ★ Google AML AI and HSBC: 2–4x; >60%; "a few days" versus "about 8 days"; awards | M-I-09, M-I-11 | `[marketing-grade]` (CF-21) |
| Absa 77% / 21 / 10.5%; C3 AI 85% / 2x / 40%; Credal.ai 30–50%; >95% false positives; about 98% no SAR | M-I-11 | `[marketing-grade]` |
| Bank of England AI Consortium, 9 February 2026 | M-I-08 | — |

### Quotes

All direct quotes in the merged body must be checked word for word before reuse. This includes quotes from the FSB principles, Final Notices, FCA press releases, the FCA good practice reports, the Mills Review and bank executives. The engines may have paraphrased them inside quotation marks.

---

# M-H — Engine behaviour notes

| Dimension | GP (ChatGPT) | OP (Claude) | GM (Gemini) |
|---|---|---|---|
| **Depth** | Broadest structured coverage: 79 findings. Strongest on sections C, D and I. Most current sources (19–26 October 2026) | Good breadth: 72 findings. Strongest on sections A, C and H. Clear verdicts and caveats | Fewest IDs (36) but the longest prose. Very detailed on case facts (H), firm metrics (B) and market tiers (J) |
| **Citation quality** | Mixed. About 35 sources are written out with title and URL, and many are regulator texts. The rest are internal tokens that cannot be traced | Best traceability: about 50 inline URLs, mostly to regulators, firm reports and law firms. Flags its own gaps honestly | Weakest. Inline markers cannot be mapped to the unnumbered works-cited list. Heavy use of secondary, aggregator, vendor and crypto-press sources. Some titles do not match their URLs (the Greenberg Traurig link) |
| **Signs of hallucination or over-reach** | Low. Tags absence of evidence carefully. Uses non-scheme tags (`[confirmed]`, `[partly-supported]`) | Low. Some rule details are from panel knowledge, flagged as such. Blank cells in H-OP-06 to H-OP-08 | Moderate. Verdict inflation in K (four "confirmed" where the evidence is partial). "Legally required" and "regulators reject" statements without rule citations. Instrument numbers that do not match the other engines (CP24/28, PS16/24). Starling and Monzo principal risks attributed to Final Notices. Specific practice ranges (24–72 hours; £25k–£100k) without sources. Symbols lost in export |
| **Scope discipline** | Good | Good | Drifts: CB Payments (e-money), Bank of Scotland 2012, Sonali Bank 2016, IFA fair value source |
| **Best sections** | C (reportability), D (SMCR reform including CP14/26), I (UK agentic statements, survey, Citi counter-evidence) | A (RAF architecture), C (reportability timeline), H (case table with sources), K (calibrated verdicts) | B (firm metrics for more firms), D-03 and D-05 (ownership failures in Final Notices), G (tension pairs), H (case detail), J (tiers, triggers, competitor breadth including Protecht) |
| **Weakest sections** | B (several counts unverified; Principality unsourced); J competitor table (mostly unverified) | B (counts from extracts; Monzo and Shawbrook not reviewed); I-OP-03 (EU and US not researched); J-OP-05 (panel knowledge) | C (instrument numbers); K (verdicts); I-GM-01 EU carve-out unverified; reference integrity throughout |
| **Unique contributions** | PRA CP14/26; the survey autonomy breakdown; Citi agentic commerce paper; JPMorgan terms of use; HSBC, NatWest and Metro disclosure cases; efficient frontier framing; regulatory floor in trade-offs | FSB consultation evidence on buffers and generic statements; OSB and Paragon; TSB; 13-fine total; SUP 15 2026 amendments; FSB agentic practices; merchant survey; tension register | Nottingham, Cambridge, OakNorth, Shawbrook; Metro minute deletion; CB Payments; OFSI and ICO clocks; four tension pairs; Protecht; tiers; SDDT; statutory limits; self-identification ratio; resource strain indicator |
| **How to weight in later stages** | High for regulatory facts with written URLs; low where only tokens are given | High overall; check rule details marked as panel knowledge | Use for leads and product ideas. Check every figure before reuse |

---

# M-I — Requirement evidence matrix

Each requirement gets one of four verdicts:
- **supported:** the evidence backs it as stated;
- **refined:** the evidence backs a modified version, and the change is stated;
- **contradicted:** the evidence goes against it;
- **no evidence:** none of the three inputs addresses it.

IDs refer to merged findings.

| # | Requirement | Supporting IDs | Contradicting or limiting IDs | Refining IDs | Verdict |
|---|---|---|---|---|---|
| 1 | Start from the risk appetite statement, with Level 1, 2 and 3 metrics below it | M-A-01, M-A-03, M-A-04, M-S-01 | — | M-A-01 (strategy is the first object, above the RAS); M-A-03 (L1/2/3 is practice, so tier names must be configurable) | **Refined:** start from strategy, then the RAS, then configurable tiers. Do not present L1/2/3 as regulatory |
| 2 | Keep the RAS lean; do not dump operational metrics into it | M-A-02 (board does not consume RCSA directly), M-A-08 (headline set), M-S-01 | M-A-08 / CF-02 (the full Level 1 schedule may hold 25–45 limits, GM) | M-A-08 | **Refined:** keep the board headline view lean, with a full RAS schedule one click down. Operational metrics sit at Level 3 and roll up |
| 3 | Show appetite set against actual operating position, not only red/amber/green | M-A-07, M-A-10 (headroom), M-S-01 item 3, M-B-15 (directional arrows) | — | M-A-07 (add forecast, trend, velocity) | **Supported** |
| 4 | Support zero-tolerance appetite where needed | M-A-06, M-B-04, M-B-11 | M-A-06 (GM: literal numeric zero keeps the board permanently red) | M-A-06 (each zero statement needs a measurable proxy such as coverage or completeness) | **Refined:** support zero statements, but require a measurable proxy and avoid literal zero numeric thresholds on operational metrics |
| 5 | Link the RAS directly to the control framework | M-A-01, M-A-02, M-A-04, M-G-01, M-H-15, M-J-09 | — | M-G-01 (via policy obligations, many-to-many) | **Supported** |
| 6 | Show what informs each control-level metric | M-D-05 (line of sight), M-D-06 (completeness), M-H-04 (Metro data feed), M-H-02 (screening configuration) | — | M-D-06 (pair each metric with its source-to-target reconciliation) | **Supported** |
| 7 | Show strategic objectives on every dashboard | M-A-01, M-A-09, M-S-01 item 1 | — | M-A-02 (each layer sees only the level it can act on) | **Refined:** strategy belongs on board and executive views and as the root of the lineage. Nothing supports putting it on every operational dashboard |
| 8 | Include growth and strategic risk metrics | M-A-09, M-A-10, M-A-12, M-E-05, M-B-03 (business risk), M-B-10 (strategic risk) | — | M-E-05 (pair growth with control capacity) | **Supported** |
| 9 | Give credit risk equal weight at CRO level | M-A-10 (credit is the clearest growth lever), M-B-02 to M-B-17 (credit is a principal risk everywhere) | M-H (enforcement concentrates on financial crime, data and ownership) | — | **Refined:** credit is a principal risk and the main growth lever. No input addresses "equal weight". Enforcement evidence argues financial crime and data controls need at least equal prominence |
| 10 | No more than 10–12 board appetite metrics | M-A-08 (NED view; headline cover page) | M-A-08, CF-02, M-E claim 1 (no rule; principal risks alone are 7–11; full suite larger) | M-A-08 | **Refined:** a configurable headline cap (default about 10–12) on top of full Level 1 coverage. It is not a rule and must not be marketed as one |
| 11 | Separate top, emerging and obligatory risks on one page | M-B-03, M-B-04 (top and emerging filtered above principal risks), M-B-14 (Shawbrook separates them), M-B-10 (time to crystallise) | — | M-S-01 item 8 (VREQs and s166 as Level 1 items, the closest evidence to "obligatory") | **Refined:** top and emerging versus principal is supported. "Obligatory" is not a term the inputs use. Regulatory restrictions (VREQs, s166 actions, mandatory obligations) can sit as Level 1 items on the same page |
| 12 | Weight categories by importance | — | — | M-B-14 (scenario probability weights for ECL, not category weighting) | **No evidence** |
| 13 | Mix leading and lagging indicators, with leading ones in high-risk areas | M-A-13 (all three engines), M-S-01 item 4 | — | M-A-13 (GP: leading-indicator tree with historical lead time) | **Supported.** The emphasis on "high-risk areas" is not specifically evidenced |
| 14 | Board sees only reds and ambers at Level 1, and only reds at Level 3 | M-B-19 (cascades are firm practice) | M-B-19 (GM and OP cascades show the BRC all of Level 1 including green, and no engine routes Level 3 reds to the board); M-B-20 (filtering suppressed Metro's issue); M-B-19 (GP: escalation should be materiality-based) | M-B-20 (immutable escalation of unremediated items past SLA) | **Refined:** filtering by forum is legitimate practice, but it must be materiality- and decision-based, with an override for persistent or unremediated issues. The BRC typically sees all Level 1 status. Level 3 items reach the board only through roll-up or exception |
| 15 | Tight thresholds on big risks, wider amber ranges on lower ones | M-A-07 (all three engines) | M-A-07 (GM's first line warns of amber fatigue) | M-A-07 (GP: calibrate width from lead time, volatility and response time) | **Refined:** supported directionally. The amber width should be calibrated and its rationale stored, not set arbitrarily |
| 16 | Continuously test that the RAS is correct and linked | M-G-01, M-G-02 (policy coverage), M-D-06 (completeness), M-H-15 (prove the population obeyed) | — | M-G-01 (coverage of obligations, not one-to-one) | **Refined:** test linkage coverage and population adherence continuously. Whether the RAS itself is "correct" is a board judgement, not an automated test |
| 17 | Every view is actionable | M-F-01 (FCA criticised data without explanation and action plans without owners), M-A-02 (each layer sees what it can act on), M-S-01 item 10 | — | — | **Supported** |
| 18 | A reportable / not-reportable layer for external regulatory reporting | M-C-01 to M-C-13 | — | — | **Supported** (`[3-source]`) |
| 19 | Defined escalation routes per governance forum, with thresholds | M-B-19, M-C-12 | — | M-B-19 (materiality-based, not static traffic lights) | **Supported** (as firm practice) |
| 20 | A human escalation step, or criteria defined upfront, for the reportable decision | M-C-12, M-C-11 | — | M-C-12 (AI may prepare; a named SMF decides; not-reportable decisions documented) | **Supported** |
| 21 | Detect conflicting metrics and policies | M-G-03, M-G-05 (no verified tool exists), M-S-02 | — | M-G-05 (use causal or semantic links) | **Supported** as a need and a differentiator. The technique is unvalidated |
| 22 | Monitor deliberate tensions and set ranges with them in mind | M-G-03, M-G-04 | — | M-G-04 (record the trade-off decision; regulatory floors cannot be traded) | **Supported** |
| 23 | Track whether every policy is monitored | M-G-01, M-G-02 | CF-15 (GP: one-to-one mapping is too strong) | M-G-01 | **Refined:** track whether every material policy obligation has evidence of implementation and monitoring. Strict one metric per policy is a design option, not a requirement |
| 24 | Named accountable owners at SMF level | M-D-01, M-H-02, M-H-03 | — | M-D-02 (model SMCR mappings as versioned metadata given Phase 2) | **Supported** |
| 25 | Distinguish risk owner from control owner | M-D-04 | — | M-D-04 (add the performer role) | **Supported** |
| 26 | Risk owners see complaints, operational errors and parameter changes | M-D-05 (all three engines), M-H-02, M-H-04, M-H-13 | — | M-D-05 (add overrides, rejected records, audit findings, restrictions) | **Supported** |
| 27 | Show when a risk originates outside the accountable person's area | M-D-05 (journey versus function hand-offs; Starling engineers; CB Payments migrations) | — | M-D-05 (two-axis ownership with divergence flags) | **Supported** |
| 28 | Support periodic SMF certification: risks, reasonable steps, progress, evidence | M-D-01 (reasonable steps evidence pack), M-D-03 (internal and supervisory attestations) | M-D-03, M-E claim 2 (no regulatory six-monthly SMF certification) | M-D-03 | **Refined:** support configurable internal attestations and a supervisory attestation template for VREQ or s166 firms. Label them firm practice, not a regulatory requirement |
| 29 | Monthly human attestation that data is correct, with a flag when not confirmed | M-D-06 (GM) | CF-13 (GP: no evidence it improves outcomes; OP: risk of rubber-stamping) | M-D-06 (attest to a specific reconciliation result) | **Refined:** practice, not rule. Attest to evidence (a reconciliation), not a bare value, and challenge by exception. Efficacy is unproven |
| 30 | Conduct needs more human overlay because it reflects culture | M-F-05, M-F-06 | — | — | **Supported** |
| 31 | Align risk ownership with Consumer Duty journey ownership | M-F-04, M-D-05, M-F-01 | — | M-F-04 (good practice, not mandated) | **Supported** (practice, not rule) |
| 32 | Cyber reporting is proactive, including red and blue team activity at board level | M-A-13 (cyber leading indicators: patch latency, phishing, privileged access) | — | — | **No evidence** for red or blue team board reporting. Only general cyber indicators are evidenced |
| 33 | Metric suites for the first, second and third lines | M-E-03 | — | M-E-03 (self-identification ratio); M-E-04 (independence) | **Supported** |
| 34 | A self-learning alert loop that keeps tightening (financial crime) | M-I-11 (ML reduces false positives) | M-I-10 (SS1/23 requires governed, validated change; GM: autonomous re-tuning is not permitted); M-I-09 (no latency benchmark); M-E claim 7 | M-I-10 | **Refined, partly contradicted:** adaptive models are allowed only with governed, human-approved tuning linked to the appetite metric they change. An autonomous loop that keeps tightening conflicts with SS1/23 expectations |
| 35 | Client-set parameters, with the product suggesting where to tighten | M-I-10 (change control), M-I-11 (sit above detection engines) | — | M-I-10 (suggest, then a human approves, with records) | **Refined:** supported as decision support with a human approval record. There is no direct evidence on suggestion features |
| 36 | Parallel cohorts to test tightening options | — | — | M-I-10 (GM: back-test against labelled exit and SAR datasets) | **No evidence.** The closest is back-testing within SS1/23 validation |
| 37 | Tunable at SMF, executive and board level | M-I-10 (board-set model risk appetite), M-D-01 (SMF ownership), M-B-19 (forum tiers) | — | M-I-10 (tiered approval by materiality) | **Refined:** tie tuning authority to materiality. The board sets appetite (including model risk appetite), SMFs approve material changes, and the executive and first line operate within them |
| 38 | Board learning cohorts so boards actively move the dials | — | — | — | **No evidence** |

Verdict summary:
- **Supported:** 18 requirements: 3, 5, 6, 8, 13, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 30, 31, 33.
- **Refined:** 16 requirements: 1, 2, 4, 7, 9, 10, 11, 14, 15, 16, 23, 28, 29, 34, 35, 37. Requirement 34 is also partly contradicted.
- **Contradicted outright:** none.
- **No evidence:** 4 requirements: 12, 32, 36, 38.

---

# M-J — Gap register and next questions

## Gaps none of the engines answered well

| # | Gap | Why it matters | What would close it | Linked IDs |
|---|---|---|---|---|
| G-01 | PX output missing | Convergence is capped at three sources, and a fourth view may change tags | Run PX and re-merge | All |
| G-02 | Appetite metric counts per firm not taken from full annual report or Pillar 3 PDFs | The 10–12 debate and the board view design need real counts | Primary reading of Nationwide, Coventry, Yorkshire, Skipton, Leeds, Principality, Metro, Shawbrook and OSB reports | M-B-03 to M-B-17, CF-02, CF-03 |
| G-03 | No calibration method for amber and red thresholds in any source | Core product logic | Practitioner interview (Q2) | M-A-07 |
| G-04 | No method for rolling non-financial Level 3 metrics up to Level 1 | Core product logic | Practitioner interview (Q1) | M-A-05 |
| G-05 | Primary texts not quoted: FR7, SUP 15.11, SS5/16, SS28/15, PRA Rulebook sections, SS31/15, SS24/15 | Reportability engine and rule tagging | Primary-source reading of the FCA Handbook and PRA Rulebook | M-A-15, M-C-02, M-C-05 |
| G-06 | The current operational incident regime before 18 March 2027 is contested | Reportability clocks | Primary reading of PS26/2, PS7/26 and current SUP 15 | CF-10, M-C-04 |
| G-07 | EU and US agentic AI positions not researched to primary standard | International proposition | Primary reading of the EU AI Act, PSD3/PSR, CFPB, Fed and FinCEN | M-I-04 |
| G-08 | Competitor capabilities not checked against product documentation (except ServiceNow) | Positioning and white-space claim | Vendor demos and documentation, especially Protecht and MetricStream | M-J-08, CF-22, CF-25 |
| G-09 | No pricing or budget evidence | Business case | Buyer interviews | M-J-06 |
| G-10 | No evidence on how long a framework rebuild takes (claim 6) | Sales narrative | Practitioner interview (Q9) | M-K-06 |
| G-11 | No quantified UK figure for AI-enabled fraud; no latency benchmark | Agentic entry point | Primary data from UK Finance, the PSR or banks | M-I-08, M-I-09 |
| G-12 | No evidence on whether monthly attestation improves accountability | Requirement 29 | Practitioner interview (Q7) | CF-13, M-D-06 |
| G-13 | No evidence on category weighting, red and blue team board reporting, parallel cohort testing or board learning cohorts | Requirements 12, 32, 36, 38 | Practitioner interview; primary research | M-I matrix |
| G-14 | No building society enforcement case below Nationwide; no case directly about a mid-tier society's appetite framework | Building society proposition | Search of FCA and PRA notices and supervisory letters | M-H |
| G-15 | Starling Final Notice date, Monzo breach count and Nationwide principal-risk list unresolved | Demo accuracy | Read the Final Notices and the Nationwide report | CF-04, CF-16, CF-17 |
| G-16 | Shawbrook, Monzo and Paragon disclosures reviewed by only one engine or not at all | Challenger evidence | Primary reading | M-B-12 to M-B-14 |
| G-17 | Terms of the FCA Supercharged Sandbox, AI Sprints and NatWest programmes unverified | Go-to-market route | Programme pages | M-J-10 |
| G-18 | GM's practice ranges (24–72 hour triage window; £25k–£100k PoC budgets) unsourced | Defaults in product and pricing | Practitioner and buyer interviews | M-C-01, M-J-10 |

## Ten questions for a former UK CRO who rebuilt a framework under supervision

Each question draws on the questions the three engines proposed (OP, GP, GM) and is tied to a gap or conflict.

1. **Metric count and roll-up** (CF-02, G-02, G-04, claim 1)
   - How many metrics did the board itself see, how many sat in the full RAS schedule, and which ones did the board actually discuss?
   - How did you roll non-financial Level 3 indicators up to a Level 1 "no appetite for regulatory breach" statement without keeping the board permanently in amber?
   - Sources: OP Q2; GP Q2; GM Q1.

2. **Calibration** (G-03, M-A-07)
   - How did you set amber, and did anything ever go straight from green to red?
   - What was the earliest operational indicator that reliably predicted a later board breach, and how much warning did it give?
   - Sources: OP Q3; GP Q4.

3. **Filtering and suppression** (M-B-19, M-B-20, requirement 14)
   - What did the board see that the BRC did not, and who set the filter?
   - What stopped executive sub-committees from rewording or dropping uncomfortable ambers and reds, as happened in the Metro case?
   - Sources: OP Q4; GM Q4.

4. **The reportable call** (M-C-01, M-C-12, G-18)
   - For a borderline Principle 11 or FR7 decision, how long did internal triage run before notifying?
   - Who made the final call, and what was recorded when the decision was not to report?
   - What would make you comfortable letting AI prepare, but not make, that judgement?
   - Sources: OP Q5; GP Q7; GM Q5.

5. **Technology change and ownership** (M-D-05, requirements 26 and 27)
   - When a technology team changed a parameter or rule that materially changed risk exposure, how did the accountable risk owner find out, approve it and prove that approval later?
   - How were disputes settled where a journey failed because of a functional team's change or a manual override?
   - Sources: OP Q6; GP Q5, Q6; GM Q6.

6. **Adaptive models and agents** (M-I-10, CF-23, claim 7, M-S-04)
   - When financial crime models re-tune alerting parameters, who signs off, and how does the BRC set model risk appetite under SS1/23?
   - If agents begin initiating customer payments at scale, what new board metric would you insist on?
   - Sources: GP Q10; GM Q9.

7. **Attestation** (CF-13, M-D-03, M-D-06, requirements 28 and 29)
   - Did internal SMF attestations or monthly data attestations change behaviour, or become rubber stamps?
   - Under heightened supervision, what did the FCA or PRA actually require in periodic SMF attestations?
   - Which spreadsheet reconciliations survived longest, and which carried the greatest risk of the board seeing the wrong answer?
   - Sources: OP Q7; GP Q8; GM Q2, Q7.

8. **Tension** (M-G-03 to M-G-05, requirements 21 and 22)
   - How did you document the tension between growth and financial crime controls, and who arbitrated it?
   - Was the conflict visible anywhere systematically, or only discovered in committee debate?
   - What paired guardrail told the first line when to throttle back?
   - Sources: OP Q8; GP Q3, Q9; GM Q3.

9. **Rebuild duration and sequence** (claim 6, G-10)
   - Which layer did the skilled person find broken first, and how long did each layer take to fix?
   - How long did it take to move from spreadsheets to a working board framework?
   - Sources: OP Q1; GP Q1.

10. **Buying and adoption** (M-J-06, CF-25, G-08, G-09)
    - Would the CRO, CFO or BRC chair sign for this tool?
    - What stops a bank buying an incumbent such as MetricStream, Archer or Protecht instead?
    - What must a challenger vendor show in week one to win a paid pilot?
    - What would make the first line adopt it?
    - Sources: OP Q10; GM Q10.

**Reserve questions**, for use if time allows:
- What did regulator read-across requests cost in person-days? (OP Q9; M-C-11)
- How was compliance capacity against commercial growth quantified for the board so that resource requests were undeniable? (GM Q8; M-E-06)
- Can you give an example where being well inside appetite meant leaving profitable growth on the table, and how did you quantify the unused capacity? (GP Q3; M-A-10)

---

*End of Stage 1 merged corpus.*
