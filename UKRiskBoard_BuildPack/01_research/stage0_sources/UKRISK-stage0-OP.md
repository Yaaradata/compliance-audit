OP

# UK Board-Level Risk Intelligence: Evidence Base for Redesigning a Risk and Compliance Platform for Mid-Tier Banks, Building Societies and Challengers (Stage 0)

The reviewer is right. In every recent UK bank and building society enforcement case we examined, the failure sat above the control layer: growth outran appetite, ownership, management information (MI) and the board's line of sight. So regulators have already documented the need for a product that links strategy, the risk appetite statement (RAS), Level 1/2/3 metrics, controls, named owners and the "reportable or not" decision. Agentic-AI financial crime is a credible second module but a weak entry point today. UK rules are still being designed (FCA Mills Review, 6 July 2026), and large US banks are blocking third-party agents rather than buying controls for them.

## TL;DR

- **Sell the board view, with the control view underneath.** The Starling (27 September 2024), Monzo (7 July 2025), Metro (November 2024) and Nationwide (12 December 2025) Final Notices share four failures that a control-level tool cannot see:
  - controls did not keep pace with growth;
  - board MI was inconsistent or missing;
  - ownership was unclear;
  - nobody tracked whether restrictions were being followed.
- **Most practitioner claims are folklore, not rules.**
  - "10–12 RAS metrics" is not in FSB, PRA or FCA texts.
  - There is no "six-monthly SMF certification to the regulator".
  - Building societies are "about 25%" only on savings balances (23%) or mortgage balances (29%) (BSA, June 2025).
  - JPMorgan and Citi block *third-party* agents (October 2026) but are building their own.
- **Lead with a board-level risk appetite and accountability spine for building societies and fast-growing challengers. Add agentic-AI financial crime as a second module in 2027–2028.** Its timing depends on the FCA's agentic framework, the PSR reimbursement review and the operational incident regime from 18 March 2027.

---

## A — Risk appetite framework architecture

**A-OP-01 — The FSB defines the risk appetite framework (RAF) and ties it to strategy and pay.**
- *Definition:* The RAF is the "systems through which risk appetite is established, communicated, and monitored". It includes the RAS, risk limits, and roles and responsibilities.
- *Strategy link:* The RAS "should be linked to the firm's short- and long-term strategic, capital and financial plans, as well as compensation programmes".
- *Content:* It uses "quantitative limits and qualitative statements for risks that are difficult to measure". Limits allocate appetite to business lines, entities, risk categories and concentrations.
- *Source:* FSB, *Principles for an Effective Risk Appetite Framework*, https://www.fsb.org/uploads/r_131118.pdf, 18 November 2013.
- *Implication:* Treat capacity, appetite, limits and profile as linked objects, and link each RAS line to a plan item.

**A-OP-02 — UK terminology.**
- *Terms in use:*
  - ERMF/RMF: taxonomy, policies, governance and the three lines.
  - RAF and RAS.
  - Level 1 (principal) risks and their sub-categories.
  - KRI: a monitored indicator with thresholds.
  - RCSA: first-line self-assessment.
  - Risk and control matrix: maps risks to controls, owners and tests.
- *Coventry:* its ERMF defines "risk strategy; risk appetite; governance and control".
- *Starling (Pillar 3 2025):* uses "Level 1 risks" with "a risk appetite statement for each of the identified sub-categories" and "a series of risk appetite limits and key risk indicators".
- *OSB:* "Risk appetite metrics and thresholds are set at both individual entity and Group levels."
- *Sources:*
  - Coventry ARA 2022, https://www.coventrybuildingsociety.co.uk/content/dam/cbs/member/pdfs/financial-results/2022/annual-report-and-accounts-2022.pdf
  - Starling Pillar 3 2025, https://www.starlingbank.com/docs/annual-reports/Pillar3-2025.pdf
  - OSB ARA 2024, https://www.osb.co.uk/media/gbujhlan/osbg-2024-ara.pdf
- *Tags:* [practice-not-rule] for RCSA and the risk and control matrix.
- *Implication:* Use a configurable taxonomy rather than a fixed list of nine domains.

**A-OP-03 — The cascade nests limits inside appetite, and appetite inside capacity.**
- *Evidence:* Banks told the FSB there should be "a sufficient buffer between risk appetite and risk [capacity]… day-to-day limits should be set such that they remain well within the risk appetite".
- *Source:* Tapestry Networks submission to the FSB, https://www.fsb.org/uploads/c_131011ad.pdf, October 2013.
- *Tags:* [practice-not-rule] [single]
- *Implication:* Order thresholds as capacity, then appetite (red), then trigger (amber), then operating limit. Level 3 breaches should roll up automatically.

**A-OP-04 — Calibration: zero tolerance versus ranges.**
- *Evidence:*
  - Coventry: "The Group has no appetite for any breach."
  - OSB constrains solvency appetite "within the leverage ratio" and has "very low appetite" for reputational risk.
- *Source:* Coventry Interim Financial Report H1 2025, https://www.coventrybuildingsociety.co.uk/content/dam/cbs/member/pdfs/financial-results/2025/2025-Interim-Financial-Report.pdf
- *Tags:* [practice-not-rule]
- *Panel view (CRO):* zero statements need a measurable proxy. Starling's sanctions screening covered only "a fraction of the names on the Consolidated List" from 2017 to January 2023, so a "zero breaches" statement alone would not have caught the gap.
- *Implication:* Require a coverage or completeness proxy for every zero-tolerance statement.

**A-OP-05 — Setting amber and red thresholds.**
- *Finding:* No UK rule prescribes how to set them. In practice:
  - red sits at the board limit;
  - amber is an early-warning trigger set from volatility, stress results or time to remediate;
  - lower-tier metrics get wider amber bands, so they warn earlier.
- *Supporting evidence:* The FCA's outcomes monitoring review (27 July 2026) praised board reporting "throughout the year… with… defined tolerance levels".
- *Source:* CMS, https://cms.law/en/gbr/legal-updates/fca-review-consumer-duty-outcomes-monitoring-good-practice-and-areas-for-improvement, 2026.
- *Tags:* [inference] [practice-not-rule]
- *Implication:* Store the calibration rationale for each threshold. Flag amber bands that are narrower than the metric's normal volatility.

**A-OP-06 — The number of board metrics is set by practice, not rule.**
- *Finding:* None of the FSB, PRA or FCA texts we reviewed sets a number. The FSB wants a RAS that is "easy to communicate". A consultation respondent warned that high-level statements "may be too generic to be actionable".
- *Evidence:* UK firms disclose 7–10 principal risks (section B), which implies roughly 10–30 Level 1 metrics.
- *Source:* FSB consultation response, https://www.fsb.org/uploads/c_131011i.pdf, October 2013.
- *Tags:* [practice-not-rule] [inference] [conflict]
- *Panel view:* the NED prefers about 12; the CRO prefers 12–15 with drill-down.
- *Implication:* Offer a configurable headline set (default 12) on top of full Level 1 coverage.

**A-OP-07 — Strategy links to the RAS through business risk, planning and stress testing.**
- *Nationwide:* its principal risks "are explored fully within the annual financial planning and stress testing framework". On new business banking and cards: "Whilst we remain within risk appetite, these risks will be assessed further."
- *Metro:* maps strategic pillars to principal risks.
- *Skipton:* assigns business risk to "The Board".
- *Source:* Nationwide ARA 2025, https://www.nationwide.co.uk/-/assets/nationwidecouk/documents/about/how-we-are-run/results-and-accounts/2024-2025/annual-report-and-accounts-2025.pdf
- *Implication:* Add strategy objects and show how much appetite each initiative consumes.

**A-OP-08 — Credit appetite as a growth lever.**
- *Evidence:*
  - Coventry: "The Board sets prudent credit risk limits within the context of the Society's overall risk appetite."
  - Coventry grew lending 43% to £9.6bn in 2025, at an average LTV of 67%, with 0.38% of loans three or more months in arrears.
- *Source:* The Intermediary, https://theintermediary.co.uk/2026/02/coventry-building-society-reports-profit-surge-in-2025-results/, February 2026.
- *Tags:* [inference]
- *Implication:* Make headroom-to-limit a board metric. This is the "strategic lever" view.

**A-OP-09 — Leading and lagging indicators.**

| Domain | Leading | Lagging |
|---|---|---|
| Credit | High-LTV/LTI share of new lending; affordability override rate; early-arrears roll rates | 3m+ arrears; ECL charge; write-offs |
| Market (IRRBB) | Repricing gap trend; hedge-effectiveness drift; pipeline swap coverage | EVE/NII limit breaches; realised hedge ineffectiveness |
| Liquidity | Deposit outflow velocity; rate-sensitive concentration; encumbrance | LCR/NSFR vs internal limit; contingency funding plan activation |
| Conduct | Complaints per 1,000 by journey; vulnerability identification rate; out-of-target sales | FOS uphold rate; redress; s166 or VREQ |
| Climate | New lending to EPC E–G; flood exposure in new lending | Financed emissions vs pathway; climate-adjusted ECL |
| Financial crime | KYC refresh backlog; alert age; screening-list coverage; restricted onboarding exceptions | Late SARs; sanctions breaches; enforcement |
| Operational resilience | Services near impact tolerance; change failure rate; third-party concentration | Tolerance breaches; reportable incidents |
| Cyber | Critical patch latency; phishing click rate; privileged-access exceptions | Intrusions; breach notifications |
| Regulatory | Overdue regulator actions; late attestations; overdue audit findings | SUP 15 notifications; fines; s166 |

- *Tags:* [practice-not-rule] [inference]
- *Implication:* Seed the product with this indicator library and let firms edit it.

**A-OP-10 — FCA material for solo-regulated firms is thin.**
- *Finding:* We found no dedicated FCA guidance on risk appetite. The FCA's levers are Principle 3, SYSC and the Consumer Duty.
- *Example:* Monzo's "financial crime risk appetite" rested on a UK-only customer policy that its onboarding did not enforce.
- *Source:* HSF Kramer, https://www.hsfkramer.com/notes/fsrandcorpcrime/2025-posts/aml-update-5-aug-2025, 5 August 2025.
- *Tags:* [unverified] [inference]
- *Implication:* For solo-regulated firms, frame appetite against Principle 3 and the Consumer Duty.

**A-OP-11 — PRA anchors.**
- *Relevant provisions:*
  - Fundamental Rules FR2, FR5, FR6 and FR7;
  - SS5/16 (board responsibilities);
  - SS28/15 (accountability);
  - SS1/23, which expects a board-set "model risk appetite".
- *Enforcement example:* The PRA fined Metro £5,376,000 (21 December 2021) under FR2 and FR6 for reporting failures.
- *Source:* Bank of England, https://www.bankofengland.co.uk/news/2021/december/pra-fines-metro-bank-5376000-for-failing-in-its-regulatory-reporting-governance-and-controls
- *Tags:* [unverified] for the SS5/16 and FR5 wording.
- *Implication:* Tag every metric with the rule it evidences.

---

## B — How boards actually see risk (UK evidence)

**B-OP-01 — Firm-by-firm disclosure table.**
- *Basis:* search extracts of official reports; the full PDFs were not opened.
- *Tags:* [unverified] for all appetite-metric counts.

| Firm | Document | Principal risks | Emerging risks | Appetite metrics | Presentation | Notable practice |
|---|---|---|---|---|---|---|
| Nationwide BS | ARA 2025; Interim September 2025 | 8: credit; liquidity and funding; capital; market; pension; business; operational and conduct; model | 7: climate; cyber; emergent technology; geopolitical; integration (new); macroeconomic; technology and resilience | Narrative | Risk / Mitigation / Related principal risks | Emerging risks mapped to principal risks |
| Coventry BS | ARA 2024; H1 2025 | 7; 8 from January 2025 (change risk added) | Climate; Co-operative Bank integration; change; cyber; financial crime | "No appetite for any breach" | Strategic report section | Change risk elevated "to support enhanced monitoring by the Board" |
| Yorkshire BS | FY2024 RNS; Pillar 3 2024 | 8 | Geopolitical/tariffs; climate | Not verified | Emerging risk / Principal risk(s) / Commentary | Board Risk Committee (BRC) receives the CRO's quarterly view |
| Skipton BS | ARA 2024/2025; Pillar 3 | Not verified (includes business, model, capital/MREL, climate) | Macro; housing | Credit limits, including climate | Principal risk / Description / Primary Oversight | Each principal risk mapped to an oversight body |
| Leeds BS | ARA 2024/2025 | 8 | Macro; geopolitical; competition; resilience; change; AI; climate | Not verified | Principal and emerging overview | Climate treated as cross-cutting |
| Principality BS | ARA 2024/2025 | 9: credit, market, liquidity and funding, solvency, conduct, legal and regulatory, operational, business, model | Not verified | Not verified | Risk overview | Model risk added in 2024 under SS1/23 |
| OSB Group | ARA 2024 | About 10 | Macro/rates; climate | Appetite statement for each risk | Per-risk pages | Qualitative appetite disclosed |
| Metro Bank | ARA 2024/2025 | About 10 | Geopolitical; UK growth; fraud | "Monitored via key risk indicators" | Includes "Crystallising time horizon" column | Strategic pillars mapped to risks |
| Starling | Pillar 3 2025 | "Level 1 risks" | Executive risk committee oversees | Per sub-category, with limits and KRIs | Narrative | BRC recommends "appetite and tolerances to the Board" |
| Paragon Bank PLC | ARA 2025 | Not verified | Not verified | Not verified | Principal risks and mitigations | Group report not located |
| Shawbrook; Monzo | Not reviewed | — | — | — | — | Gap |

- *Additional sources:*
  - Skipton ARA 2025, https://www.skiptongroup.com/wp-content/uploads/2026/02/annual-report-and-accounts-2025.pdf
  - Leeds ARA 2025, https://www.leedsbuildingsociety.co.uk/_resources/pdfs/press-pdfs/financial-results-pdfs/2025-annual-report-and-accounts.pdf
  - Principality ARA 2025, https://www.principality.co.uk/getmedia/c455d45e-9c14-458e-87b4-2726b1ff6925/Annual-Report-and-Accounts-2025.pdf
  - Metro ARA 2025, https://www.metrobankonline.co.uk/globalassets/documents/investor_documents/metro-bank---annual-report-2025.pdf
- *Implication:* Mirror this disclosure convention in the board output.

**B-OP-02 — No public RAG dashboards.**
- *Finding:* No extract showed a public "within appetite" dashboard; disclosure is narrative.
- *Tags:* [unverified] [inference]
- *Implication:* Keep RAG in the private board pack, with a separate narrative export.

**B-OP-03 — Escalation filtering is firm practice.**
- *Evidence:* Skipton maps each risk to a committee; Yorkshire's BRC receives the CRO's quarterly view; Starling's executive committee sits below the BRC.
- *Typical cascade (panel practice):*
  - management committees see all KRIs;
  - the executive committee sees Level 2 ambers and reds;
  - the BRC sees all Level 1 plus Level 2 reds;
  - the board sees Level 1 status and breaches.
- *Counter-evidence:* At Starling, "different committees receiv[ed] different information".
- *Tags:* [practice-not-rule] [inference]
- *Implication:* Run every forum from a single source of truth, and show what each filter suppresses.

---

## C — Reportable versus not reportable

**C-OP-01 — Principle 11 and SUP 15.3.1R require "immediate" notification.**
- *The rule:* Notify "immediately it becomes aware, or has information which reasonably suggests" any of the following has occurred, may have occurred or may occur:
  - a threshold-condition failure;
  - significant reputational impact;
  - serious consumer detriment;
  - serious financial consequences.
- *Related rules:* SUP 15.3.11R covers significant breaches of rules, Principles or COCON. SUP 15.6 covers false or misleading information.
- *Timing:* The firm does not need to have completed an investigation before notifying.
- *Source:* FCA Handbook SUP 15.3, https://handbook.fca.org.uk/handbook/sup15/sup15s3, accessed October 2026.
- *Implication:* Start the clock at "reasonably suggests".

**C-OP-02 — Late reporting is held against firms.**
- *Starling timeline:*
  - Found a VREQ breach on 21 July 2022 and fixed it within a day.
  - Told the FCA on 24 August 2022. The FCA recorded its "disappointment that Starling did not immediately report".
  - Had not adequately conveyed a November 2018 internal audit report "to either Starling's Board or the Authority".
- *Source:* FCA Final Notice, Starling Bank Limited, https://www.fca.org.uk/publication/final-notices/starling-bank-limited-2024.pdf, 27 September 2024.
- *Implication:* Timestamp awareness, decision and notification, and use "days to notify" as a KRI.

**C-OP-03 — PRA FR7 (open and co-operative) runs in parallel for dual-regulated firms.**
- *Evidence:* The Metro PRA case (A-OP-11) shows the PRA enforcing reporting accuracy.
- *Tags:* [unverified] for the FR7 wording.
- *Implication:* Record the FCA and PRA reporting decisions separately.

**C-OP-04 — SUP 15 changes in 2026.**
- *Finding:* Handbook Notice 139 records two changes: the Redress Reforms Instrument 2026 amended SUP 15.3, and the operational incident instrument inserted SUP 15.18 and 15.19.
- *Source:* Regulation Tomorrow, https://www.regulationtomorrow.com/2026/03/handbook-notice-no-139/, March 2026.
- *Tags:* [single] [unverified]
- *Implication:* Version the rule library by in-force date.

**C-OP-05 — Operational incident and third-party reporting from 18 March 2027.**
- *Instruments:* FCA PS26/2 and PRA PS7/26, published 18 March 2026.
- *Content:*
  - one incident definition;
  - reporting thresholds;
  - "standard" and "enhanced" tiers (about 90% of FCA firms are standard);
  - notification of material third-party arrangements;
  - an annual register.
- *Source:* FCA PS26/2, https://www.fca.org.uk/publications/policy-statements/ps26-2-operational-incident-third-party-reporting, 18 March 2026.
- *Tags:* [unverified] for the submission clocks.
- *Implication:* This is a buying trigger with a fixed date. Build incident classification now.

**C-OP-06 — Conduct Rule breach notifications.**
- *Finding:* A firm must notify only where it has taken formal disciplinary action: a written warning, suspension, dismissal, or reduction or recovery of pay.
- *Source:* Clifford Chance, https://www.cliffordchance.com/insights/resources/blogs/regulatory-investigations-financial-crime-insights/2026/05/fca-streamlines-senior-managers-and-certification-regime.html, May 2026.
- *Tags:* [unverified] for the timescales (7 business days for SMFs; annual REP008), which are panel knowledge.
- *Implication:* Link conduct cases to HR outcomes, with configurable timers.

**C-OP-07 — Financial crime reporting.**
- *Finding:* SARs and DAML requests go to the NCA under POCA 2002 and the Terrorism Act 2000. The MLRO reports annually.
- *Evidence:* Metro filed 153 SARs after its review. In Starling's VREQ breach cohort, 161 customers had previously been the subject of a SAR.
- *Source:* Objectivus, https://objectivus.com/review-of-fca-final-notice-on-metro-bank-plc-2/, November 2024.
- *Tags:* [unverified] for the statute citations.
- *Implication:* Keep the SAR workflow separate and access-restricted.

**C-OP-08 — Consequences and read-across.**
- *Escalation ladder:* supervisory letter, then s166, then VREQ, then enforcement.
  - Starling: s166 on 28 May 2021; VREQ on 17 September 2021.
  - Monzo: VREQ from August 2020 to February 2025.
- *Read-across at Starling:*
  - The FCA asked the board for a "lessons learned" review.
  - The second line found 309 more breaching accounts.
  - The firm re-screened its sanctions history back to 2017.
- *Over-reporting:* No text penalises it.
- *Source:* Mishcon de Reya, https://www.mishcon.com/news/fca-fines-monzo-21-million-for-failings-in-anti-money-laundering-systems-and-controls, July 2025.
- *Tags:* [inference]
- *Implication:* When an issue is logged, propose read-across on controls with the same design or data feed.

**C-OP-09 — What a defensible human decision step contains.**
- *Elements:*
  - a named decision-maker (SMF16, plus SMF4 or SMF17 depending on the matter);
  - a test against each limb of SUP 15.3 and FR7;
  - timestamps;
  - recorded dissent;
  - a re-test when facts change;
  - escalation to the chair on threshold matters.
- *Evidence:* At Starling, senior managers "had different understandings of whom… had responsibility for the VREQ".
- *Tags:* [inference] [practice-not-rule]
- *Implication:* Make the decision record immutable and exportable.

---

## D — Accountability: SMCR, risk owners and control owners

**D-OP-01 — SMCR architecture.**
- *Components:*
  - Statements of Responsibilities (SoRs);
  - Management Responsibilities Maps;
  - prescribed responsibilities;
  - certification;
  - the Conduct Rules;
  - the Duty of Responsibility (FSMA s66A/66B, "reasonable steps").
- *Evidence:* At Starling there was "no single person with sufficient authority and oversight" for the VREQ.
- *Tags:* [unverified] for the section numbers.
- *Implication:* Bind every metric, policy and VREQ to an SoR, and show unmapped items in red.

**D-OP-02 — SMCR reform timeline.**

| Date | Event |
|---|---|
| 15 July 2025 | HM Treasury, FCA (CP25/21) and PRA (CP18/25) consult |
| 7 October 2025 | Consultations close |
| April 2026 | Phase 1 rules: FCA PS26/6 and PRA PS12/26 |
| 30 July 2026 | Directory changes take effect |
| No date set | HM Treasury removes the Certification Regime from legislation "when Parliamentary time allows" |

- *Phase 1 content:* SMF7 and SMF18 guidance, flexibility on the 12-week rule, more time for SoR updates, and streamlined annual certification.
- *Sources:*
  - FCA PS26/6, https://www.fca.org.uk/publications/policy-statements/ps26-6-senior-managers-certification-regime-review, April 2026.
  - PRA PS12/26, https://www.bankofengland.co.uk/prudential-regulation/publication/2026/april/review-of-the-smcr-phase-1-policy-statement, April 2026.
- *Implication:* The SMF and SoR structure is stable; certification may change.

**D-OP-03 — There is no rule requiring "six-monthly SMF certification".**
- *What actually exists:*
  - Firms certify their own certified staff annually; this is not a certification to the regulator.
  - SMF fitness is assessed on an ongoing basis.
  - SoRs are resubmitted when they change.
  - The Consumer Duty and MLRO reports are annual.
- *Where the claim comes from:* Six-monthly SMF "reasonable steps" attestations are internal firm practice.
- *Source:* BDO, https://www.bdo.co.uk/en-gb/insights/industries/financial-services/hmt-fca-pra-consultations-on-sm-cr-reform-practical-implications, 2025.
- *Tags:* [practice-not-rule]
- *Implication:* Offer configurable attestation cycles, labelled as firm practice.

**D-OP-04 — Risk owner versus control owner.**
- *Definitions:*
  - The risk owner is accountable for keeping the risk within appetite.
  - The control owner is accountable for a control's design and operation.
  - The performer executes the control.
- *Horizontal and vertical ownership:* Horizontal (journey) owners see outcomes; vertical (function) owners own controls. When ownership is mis-assigned, complaints cluster on journeys that have no single owner.
- *Evidence:*
  - Starling's engineers "were not informed of the existence of the VREQ".
  - Metro staff flagged data gaps in 2017 and 2018; they were not fixed until 2019–2020.
- *Source:* Lexology, https://www.lexology.com/library/detail.aspx?g=60de7c1e-a6a8-4364-a05b-a716017b20ef, November 2024.
- *Tags:* [practice-not-rule]
- *Implication:* A risk owner's line of sight must include:
  - complaints;
  - incidents;
  - technology changes to parameters, rules and data feeds;
  - audit findings;
  - restrictions.

**D-OP-05 — Monthly data attestation is not required.**
- *Evidence:*
  - Starling added "daily testing and assurance activity" from 17 January 2023 and "automated daily controls" by 31 May 2023.
  - Metro lacked checks "on an ongoing basis, that data was being correctly processed".
- *Tags:* [practice-not-rule] [single]
- *Panel view:* the first line warns of rubber-stamping; the enforcement adviser says attestations evidence "reasonable steps".
- *Implication:* Have owners attest to a specific reconciliation result.

---

## E — Three lines of defence

**E-OP-01 — IIA Three Lines Model (July 2020).**
- *Finding:* The model emphasises governing-body accountability and independent assurance. UK enforcement still uses 1LOD/2LOD/3LOD.
- *Evidence:* Starling's Final Notice found all three lines "inadequate in their oversight". Its third line "was unaware of the VREQ until late 2022".
- *Tags:* [unverified] (IIA text not fetched).
- *Implication:* Show where second-line challenge and third-line coverage are missing.

**E-OP-02 — Typical metric suites.**
- *First line:* control performance, KRIs, RCSA completion, backlogs and complaints.
- *Second line:* appetite utilisation, policy breaches and assurance results.
- *Third line:* plan completion, overdue and repeat findings, and coverage.
- *Tags:* [practice-not-rule]
- *Implication:* Provide default dashboards for each line.

**E-OP-03 — Controls failing to "keep pace with growth".**
- *Evidence:*
  - The FCA's 2 October 2024 press release states Starling grew "from approximately 43,000 customers in 2017 to 3.6 million in 2023" while "measures to tackle financial crime did not keep pace with its growth"; the fine would have been £40,959,426 before the 30% discount.
  - Monzo grew from about 600,000 (2018) to over 5.8m (2022).
  - The FCA challenger review (22 April 2022) said controls must be "commensurate with a bank's expansion".
- *Source:* FCA press release, https://www.fca.org.uk/news/press-releases/fca-fines-monzo-21m-failings-financial-crime-controls, 8 July 2025.
- *Implication:* Make growth-normalised control capacity a Level 1 indicator.

**E-OP-04 — Audit findings not reaching the board.**
- *Evidence:* Starling's 2018 audit gaps were not conveyed to the board. The audit committee's direct line to internal audit is set by the UK Corporate Governance Code and IIA practice.
- *Tags:* [unverified]
- *Implication:* Track the age of audit findings and escalate automatically.

---

## F — Conduct, culture and Consumer Duty

**F-OP-01 — Consumer Duty board reports.**
- *Scope:* The FCA reviewed 180 first-year reports.
- *Good practice:* outcome MI, cohort and vulnerability analysis, and recorded board challenge.
- *Weaknesses:*
  - "poor data quality or missing thresholds";
  - weak oversight of distribution chains;
  - "action plans without owners, timescales or success metrics".
- *Year 2:* some firms "presented extensive data without sufficiently explaining" it.
- *Sources:*
  - FCA, https://www.fca.org.uk/publications/good-and-poor-practice/consumer-duty-board-reports-good-practice-areas-improvement, updated 24 February 2025.
  - FCA, https://www.fca.org.uk/news/blogs/year-2-consumer-duty-board-reports-progress-and-what-comes-next, 2026.
- *Implication:* Each outcome metric needs a threshold, owner, action, due date and success measure.

**F-OP-02 — Outcomes monitoring.**
- *Evidence:*
  - The 27 July 2026 review found "limited evidence of how outcomes differ across customer groups".
  - In March 2025, "most firms… were unable to show how they effectively monitor" outcomes for vulnerable customers.
- *Source:* FCA, https://www.fca.org.uk/publications/good-and-poor-practice/delivering-vulnerable-customers, 7 March 2025.
- *Implication:* Apply appetite mechanics to conduct metrics.

**F-OP-03 — Journey ownership.**
- *Evidence:* The FCA's good practice is "unambiguous ownership of the consumer understanding outcome… part of the daily inner workings of the firm".
- *Source:* TLT, https://www.tlt.com/insights-and-events/insight/fca-publishes-consumer-understanding-good-practice-and-areas-for-improvement, 2025.
- *Tags:* [single]
- *Implication:* Let the journey owner also be the horizontal risk owner.

**F-OP-04 — Culture.**
- *Context:* FCA PS25/23 (non-financial misconduct) feeds into the SMCR changes.
- *Indicators:*
  - speak-up volumes;
  - anonymity rate;
  - time to close cases;
  - retaliation reports;
  - time from first flag to the board (about two years at Metro).
- *Tags:* [practice-not-rule] [unverified]
- *Implication:* Use "bad news travel time" as a culture KRI.

**F-OP-05 — Data versus judgement.**
- *Data can measure:* rates, tolerances, backlogs and coverage.
- *Humans must judge:* whether outcomes are "good", whether a breach is "significant", what the culture is, and whether MI is complete.
- *Tags:* [inference]
- *Implication:* Make owner commentary and a conclusion mandatory.

---

## G — Policy-to-metric linkage and metric tension

**G-OP-01 — Policies untracked or breached.**
- *Monzo:* its UK-only appetite was not enforced. Customers it had exited for financial crime reopened accounts that were rated "No Risk Identified".
- *Starling:* had no "formal monitoring programme" for its VREQ. It opened 54,359 accounts for 49,183 high-risk customers in breach of it.
- *Nationwide:* allowed business use of personal accounts "without effective mitigating controls".
- *Sources:*
  - SteelEye, https://www.steel-eye.com/news/monzo-fca-fine-financial-crime-vreq-breach, July 2025.
  - Shoosmiths, https://www.shoosmiths.com/perspectives/stories/articles/nationwide-fined-44m-key-lessons-on-financial-crime, December 2025.
- *Implication:* Each policy statement maps to at least one metric or test. Unmapped statements are a Level 1 gap.

**G-OP-02 — Tension between growth and restriction.**
- *Evidence:*
  - Starling's MI focused on "how the VREQ could be reduced or removed".
  - On Monzo, the FCA said "rapid customer growth must not come at the detriment of compliance".
- *Panel view (CRO):* use paired metrics with a trade-off the board has agreed.
- *Implication:* Keep a tension register that flags when one metric in a pair improves while its partner deteriorates.

**G-OP-03 — Conflict-detection tools.**
- *Finding:* We found no published method or verified vendor feature.
- *Tags:* [unverified] [inference]
- *Implication:* This is a potential differentiator, to be validated with design partners.

---

## H — Enforcement case studies

- *Context:* Since 2021 the FCA has fined banks 13 times for AML failings, totalling £300,767,526 (FCA, 12 December 2025).
- *Tags:* rows H-OP-06 to H-OP-08 are now sourced to FCA and press reports of the regulators' announcements.

| ID | Case | What failed | Layer | Adherence tracked? | Leading indicator | Source |
|---|---|---|---|---|---|---|
| H-OP-01 | Starling, 27 September 2024, £28,959,426 | Partial sanctions list since 2017; 54,359 VREQ-breaching accounts; no single SMF owner; inconsistent MI | Strategy, ownership, data, control, culture | No; daily testing only from January 2023 | List coverage; VREQ exceptions; overdue audit findings | FCA Final Notice (C-OP-02) |
| H-OP-02 | Monzo, 7 July 2025, £21,091,300 | Onboarding, CDD/EDD and monitoring 2018–2020; VREQ breaches | Strategy (tenfold growth), policy, control, data | No; [conflict] 34,000+ vs 26,325 accounts | Non-UK attributes at onboarding; re-onboarding of exited customers | FCA (E-OP-03) |
| H-OP-03 | Metro (FCA), November 2024, £16,675,200 | Data feed missed more than 60m transactions (£51bn), 2016–2020 | Data lineage, control, escalation | No | Feed completeness; flag-to-fix time | Lexology (D-OP-04) |
| H-OP-04 | Nationwide, 12 December 2025, £44,078,500 | CDD refresh and risk assessment 2016–2021; missed furlough fraud (£26.01m in 8 days) | Control, data, policy, remediation | Weaknesses known but not fixed "in a timely manner" | CDD past refresh date; velocity anomalies | https://www.fca.org.uk/news/press-releases/fca-fines-nationwide-44m-failings-financial-crime-controls |
| H-OP-05 | Metro (PRA), 21 December 2021, £5,376,000 | Wrong COREP risk weights | Data, governance | No | Return reconciliation exceptions | Bank of England (A-OP-11) |
| H-OP-06 | TSB IT migration, FCA/PRA, 20 December 2022, £48,650,000 (FCA £29.75m, PRA £18.9m; £69.5m before the 30% settlement discount) | "Operational risk management and governance failures, including management of outsourcing risks"; £32.7m redress paid | Change, resilience | — | Readiness criteria | CNBC/Reuters, 20 December 2022, https://www.cnbc.com/2022/12/20/british-bank-tsb-fined-48point65-million-over-it-platform-migration-failures.html |
| H-OP-07 | Santander UK AML, FCA, 9 December 2022, £107,793,300 | "Serious and persistent gaps" in AML controls over more than 560,000 business banking customers, 31 December 2012 to 18 October 2017; over £298m passed through before the accounts were closed | Control, data | — | Monitoring coverage | CNBC, 9 December 2022, https://www.cnbc.com/2022/12/09/uk-financial-watchdog-fines-santander-132-million.html |
| H-OP-08 | Barclays, FCA, 16 July 2025, £42m total (£3.09m Barclays Bank UK PLC re WealthTek; £39.3m Barclays Bank PLC re Stunt & Co) | Financial crime risk management failings in two client relationships | Control | — | — | FCA, https://www.fca.org.uk/news/press-releases/fca-fines-barclays-42-million-poor-handling-financial-crime-risks |

**H-OP-09 — The published record counts against firms.**
- *Evidence:* The FCA cited JMLSG and FCA guidance and "numerous published FCA notices" as aggravating factors against Nationwide.
- *Source:* Linklaters, https://financialregulation.linklaters.com/post/102lxng/fca-fines-nationwide-44m-for-financial-crime-control-failings, December 2025.
- *Implication:* Map each new Final Notice to the firm's own controls.

---

## I — Agentic-AI financial crime risk

**I-OP-01 — UK statements.**

| Date | Statement |
|---|---|
| January 2026 | The Treasury Select Committee seeks AI accountability guidance by the end of 2026; the Mills Review is launched |
| 25 March 2026 | The FCA will consider "whether change or development of regulation is needed to support agentic AI payments" |
| 6 July 2026 | The Mills Review (147 pages, seven recommendations) recommends "a trusted framework for AI agent participation… how agents can be authorised, identified and held accountable… consent mandates, identity, control and liability", and finds existing frameworks sound |
| 19 October 2026 | The FCA will become "ultimately agentic"; an FCA and Bank of England survey shows 86% of firms using AI; no AI-specific rules planned |

- *Sources:*
  - Payment Expert, https://paymentexpert.com/2026/03/25/fca-2026-payments-regulatory-priorities-report/
  - A&O Shearman, https://www.aoshearman.com/en/insights/report-issued-by-the-mills-review-the-future-of-ai-in-retail-financial-services, July 2026.
  - Trade2Spike, https://www.trade2spike.com/ai-in-action/fca-plans-to-become-agentic-regulator-86-percent-of-uk-firms-use-ai-no-new-rules, 20 October 2026.
- *Tags:* [single] for the 86% figure. The Mills Review makes recommendations; it is not rules.
- *Implication:* Build an agent-mandate data model, but do not sell compliance with rules that do not yet exist.

**I-OP-02 — The FSB published 12 practices for agentic AI (October 2026).**
- *Source:* Payment Expert, https://paymentexpert.com/2026/10/21/ai-agents-fsb-payment-expert-podcast/
- *Tags:* [single] [unverified]

**I-OP-03 — EU and US positions were not researched to primary standard.**
- *To check:* the AI Act, PSD3/PSR, DORA (17 January 2025), CFPB s1033 and Regulation E.
- *Tags:* [unverified]

**I-OP-04 — Liability.**
- *APP regime:* PSR reimbursement has applied since 7 October 2024:
  - up to £85,000 per claim;
  - split 50/50 between sending and receiving PSPs;
  - paid within 5 business days (35 if extended);
  - exceptions for fraud and the consumer standard of caution.
- *Open question:* If a deceived agent makes a payment, is it "authorised" (APP regime) or "unauthorised" because it fell outside the mandate (PSRs 2017)? This is unresolved.
- *Merchant survey:* 58% of UK merchants believe agents have transacted on their platforms; only 41% are confident in the liability frameworks.
- *Sources:*
  - PSR PS25/5, https://www.psr.org.uk/media/rhelv4op/ps25-5-app-scams-reimbursement-consolidated-policy-statement-may-2025.pdf, May 2025.
  - Retail Banker International, https://www.retailbankerinternational.com/news/mills-review-industry-comments/, 6 July 2026.
- *Tags:* [inference] [single]
- *Implication:* Record mandate scope, agent identity and a mandate check for each transaction.

**I-OP-05 — APP outcomes.**
- *Evidence:*
  - Year one (to 30 September 2025): about 88% reimbursed, about £173m.
  - 15 months to the end of 2025: 89%, £243m.
  - UK Finance: total APP losses rose 19% to £576.4m in 2025.
  - Reimbursement rates ranged from 21% to 94% across PSPs.
- *Sources:*
  - Acoru, https://www.acoru.com/en/blog/app-fraud-reimbursement-covers-losses-without-preventing-fraud, 2026.
  - Bratby Law, https://bratby.law/app-fraud-reimbursement-evaluation/, 2026.
- *Tags:* [conflict]
- *Implication:* Because receiving PSPs share liability, mule detection now affects the P&L.

**I-OP-06 — US bank stances (October 2026).**
- *JPMorgan:* blocks outside agents ("You don't want rogue agents, and it could be thousands of them"). Read-only access continues, and it is building its own agents.
- *Citi:* "we do not permit third-party AI agents or assistants to log into a customer's account or transact directly". Its CEO wants "rigorous identity verification", and it has built an internal platform, Arc.
- *Bank of America:* restricts access until liability protocols exist and wants human approval for outflows (14 October 2026).
- *Morgan Stanley and Schwab:* also restricting.
- *Sources:*
  - Forbes, https://forbes.com/sites/chrisrosenberg/2026/10/24/jpmorgan-and-citis-ai-agent-limits-show-why-efficiency-isnt-enough, 24 October 2026.
  - The Paypers, https://thepaypers.com/fintech/news/citi-and-bank-of-america-restrict-ai-agents-from-accessing-accounts, October 2026.
- *Tags:* these are FT, Reuters and CNBC reports accessed through secondary sources.
- *Implication:* The first product banks can buy is perimeter verification of agent identity and mandate.

**I-OP-07 — Speed and scale.**
- *Evidence:*
  - The Mills Review says "financial crime and cyber risk are amplified".
  - Axios reported agents "attempting to take actions that appear to be independent of user instructions".
- *Source:* InfoSec Today (citing Axios), https://www.infosectoday.io/should-government-websites-block-personal-ai-agent-transactions, October 2026.
- *Tags:* [single]. We found no quantified UK figure for AI-enabled fraud.
- *Implication:* Do not use unsourced statistics.

**I-OP-08 — Latency.**
- *Finding:* There is no public benchmark.
- *Evidence:* HSBC says Google AML AI cut batch processing "from several weeks to a few days".
- *Source:* Insights Distilled, https://insightsdistilled.com/editions/june-27/hsbc-google-aml-ai-tool-reducing-fraud-alerts-compliance/, June 2023.
- *Tags:* [marketing-grade] [inference]
- *Implication:* Measure each firm's own event-to-alert-to-decision time.

**I-OP-09 — PRA SS1/23 governs self-learning models.**
- *Dates:* published 17 May 2023; effective 17 May 2024.
- *Scope:* covers "all types of models… including vendor models, regardless of technology".
- *Requirements:*
  - a model inventory;
  - tiering;
  - a board-set model risk appetite;
  - independent validation;
  - change control.
- *Applicability:* It formally targets firms with internal model approval, but Principality adopted it in 2024.
- *Effect:* Retraining a model or changing its parameters counts as a governed change.
- *Source:* Bank of England, https://www.bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks-ss, 17 May 2023.
- *Tags:* [single] for a reported April 2026 revision.
- *Implication:* Each parameter change creates a record linked to the risk owner.

**I-OP-10 — Vendors.**
- *Google Cloud AML AI:* launched 21 June 2023. HSBC reports "two to four times more true positive risk" and alert volumes down more than 60%. Bradesco and Lunar also use it.
- *Starling:* reportedly uses an AI agent on AML alerts.
- *Others:* ThetaRay, Feedzai, Featurespace, NICE Actimize, Quantexa and Hawk [unverified].
- *Sources:*
  - Google Cloud, https://www.googlecloudpresscorner.com/2023-06-21-Google-Cloud-Launches-AI-Powered-Anti-Money-Laundering-Product-for-Financial-Institutions
  - The Paypers, https://thepaypers.com/fraud-and-fincrime/news/starling-bank-deploys-an-ai-agent-to-investigate-aml-alerts, 2026.
- *Tags:* [marketing-grade]
- *Implication:* Detection is crowded, so compete on governance above detection.

---

## J — Market, buyers and competitors

**J-OP-01 — Building societies.**
- *Sector:* 42 societies, including two mutual-owned banks.
- *End-March 2025:* 29% of mortgage balances; 23% of savings balances (£485.7bn); 47% of cash ISAs.
- *Six months to March 2025:* 32% of gross lending; 52% of net lending.
- *Six months to September 2025:* mortgages £493bn; savings £496bn; 31% of approvals.
- *Sources:*
  - BSA, https://www.bsa.org.uk/media-centre/press-releases/building-society-sector-grows-as-two-banks-are-mutualised, June 2025.
  - BSA, https://www.bsa.org.uk/statistics/sector-info-performance/building-society-trading-updates/building-societies-trading-update-june-2025-883a2eb3673679dc972a3cd8071a65b8, 28 November 2025.
- *Implication:* "About 25%" holds only for savings balances. Name the measure.

**J-OP-02 — Tiers.**
- *Structure:* Nationwide dominates. Coventry, Yorkshire, Skipton, Leeds and Principality follow, then a long tail.
- *Evidence:*
  - Coventry's mortgage share rose from 3.1% to 4.2% after acquiring The Co-operative Bank.
  - Whitecap/BSA 2025 notes CEO turnover and "lack of proportionality".
- *Source:* Whitecap, https://www.whitecapconsulting.co.uk/wp-content/uploads/2025/05/Building-Societies-Report-2025.pdf, May 2025.
- *Tags:* [unverified] for tier counts.
- *Implication:* Offer a turnkey RAF for small societies and GRC integration for the top six to eight.

**J-OP-03 — Maturity signals.**
- *Evidence:*
  - Nationwide's £44m fine.
  - Integration risk elevated at Coventry and Nationwide.
  - Principality's addition of model risk.
- *Tags:* [inference]
- *Implication:* A module on change risk against appetite is timely.

**J-OP-04 — Buyers and triggers.**
- *Buyers:*
  - The CRO (SMF4) buys.
  - The CFO co-signs at societies.
  - The COO may sponsor.
  - The BRC chair sponsors but holds no budget.
- *Triggers:*
  - s166 reviews;
  - VREQs;
  - Final Notices;
  - "lessons learned" requests;
  - M&A;
  - PS26/2;
  - SMCR Phase 1;
  - a new chair, CEO or BRC chair [inference].
- *Tags:* [inference]
- *Panel view (first line):* the product dies if it is seen as a burden.
- *Implication:* Sell to the CRO, design for the BRC chair, and lighten the first line's load.

**J-OP-05 — Competitors.**
- *Basis:* panel knowledge; vendor pages not fetched.
- *Tags:* [unverified] [marketing-grade]

| Player | Coverage | Board appetite | Strategy link | Tension | SMCR | Segment |
|---|---|---|---|---|---|---|
| ServiceNow IRM | Risk, controls, issues, vendor | Configurable | Limited | No | Configurable | Large banks |
| MetricStream | ERM, ORM, compliance, audit, appetite | Yes | Partial | No | Configurable | Large and mid-tier |
| Archer | ORM, RCSA, compliance, audit | Configurable | Limited | No | Configurable | Large FS |
| Workiva | Reporting, SOX, ESG | Reporting | Disclosure | No | No | Listed firms |
| IBM OpenPages | ORM, model risk, AI governance | Yes | Partial | No | Configurable | Large banks |
| SAI360 | GRC, ethics | Partial | Limited | No | Partial | Mid-market |
| UK SMCR tools | Maps, SoRs, certification | No | No | No | Yes | UK mid-tier |
| Consultancies | RAF design, s166, remediation | Bespoke | Bespoke | Workshops | Bespoke | All tiers |
| AI-native entrants | Control testing, policy mapping | Emerging | Rare | Rare | Rare | Challengers |

- *Implication:* No one appears to combine strategy linkage, tension analysis, SMCR binding and reportability records at a mid-tier price.

**J-OP-06 — Partnership routes.**
- *Options:* paid proof-of-concept; accelerators (for example NatWest); corporate venture capital; the FCA Supercharged Sandbox and AI Sprints.
- *Source:* Bratby Law, https://bratby.law/agentic-ai-payments-consent-regulation/, 2026.
- *Tags:* [unverified]
- *Implication:* The sandbox suits the agentic module.

---

## K — Claims to verify

| # | Claim | Verdict | Best source | Date | Note |
|---|---|---|---|---|---|
| 1 | A RAS should hold no more than 10–12 metrics | not supported as a rule; partly supported as practice | FSB Principles | 18 November 2013 | No regulatory number; 7–10 principal risks imply more than 12 Level 1 metrics |
| 2 | Every SMF certifies to the regulator six-monthly | not supported | FCA PS26/6; PRA PS12/26 | April 2026 | Firms certify certified staff annually; six-monthly SMF attestation is firm practice |
| 3 | Building societies are about 25% of the market | partly supported | BSA | June 2025 | Savings balances 23%; mortgage balances 29%; gross lending 32%; net lending 52% |
| 4 | JPMorgan and Citi will not let AI agents execute transactions | partly supported | Forbes; The Paypers | 16–24 October 2026 | True for third-party agents; both are building their own |
| 5 | The FCA raises the bar by comparing firms with the best | partly supported | FCA good/poor practice; Linklaters | February–December 2025 | Rules are fixed, but published practice and notices ratchet expectations up and can aggravate penalties [inference] |
| 6 | Building a board framework from spreadsheets takes 12–18 months | unverifiable | Starling, Monzo, Nationwide notices | 2024–2025 | Remediation took years; no source for 12–18 months |
| 7 | Self-learning models cut latency from about 30 minutes to under 20 seconds | unverifiable | HSBC/Google ("weeks to days") | June 2023 | No public benchmark [marketing-grade] |

---

## Synthesis

### 1. What a UK board-level risk view must show
1. Strategy and growth objects linked to principal risks (A-OP-07, A-OP-08).
2. The RAS: capacity, appetite and limits, with about 12–15 headline metrics and full Level 1 coverage (A-OP-01, A-OP-06).
3. Status against nested thresholds, with the calibration rationale (A-OP-03, A-OP-05).
4. Headroom-to-limit as the growth lever (A-OP-08).
5. Emerging risks mapped to principal risks, with time horizons (B-OP-01).
6. One SMF owner for each metric, policy and restriction (D-OP-01).
7. VREQs and s166 reviews as Level 1 items (H-OP-01, H-OP-02).
8. Completeness of critical data feeds (H-OP-03, D-OP-05).
9. Reportability decisions and their clocks (C-OP-01, C-OP-02, C-OP-05).
10. Consumer Duty outcomes against tolerances (F-OP-01, F-OP-02).

### 2. Qualifiers versus differentiators
- **Qualifiers (every serious competitor has these):**
  - risk register;
  - RCSA;
  - controls testing;
  - issue management;
  - KRIs with RAG;
  - policy repository;
  - audit;
  - dashboards;
  - regulatory feeds.
- **Differentiators (apparently unserved; validate before relying on them):**
  - strategy-to-control linkage in one model for mid-tier firms;
  - a tension register and conflict detection;
  - native SMCR binding;
  - line of sight over technology changes;
  - immutable reportability records;
  - Final Notice read-across;
  - growth-normalised control capacity.

### 3. Ten product requirements

| # | Requirement | Evidence |
|---|---|---|
| 1 | Configurable Level 1/2/3 taxonomy with nested thresholds and rationale | A-OP-02, A-OP-03, A-OP-05 |
| 2 | Strategy objects and headroom view | A-OP-07, A-OP-08 |
| 3 | Measurable proxy for every zero-tolerance statement | A-OP-04, H-OP-01 |
| 4 | SMF/SoR binding, with unmapped items in red | D-OP-01, H-OP-01 |
| 5 | Ingestion of technology change logs | D-OP-04, H-OP-03, I-OP-09 |
| 6 | Feed reconciliations with evidence-based attestation | D-OP-05, H-OP-03, H-OP-05 |
| 7 | Reportability workflow (SUP 15, FR7, PS26/2, Conduct Rules) with immutable records | C-OP-01 to C-OP-09 |
| 8 | Tension register and policy-to-metric coverage map | G-OP-01 to G-OP-03 |
| 9 | Consumer Duty outcomes with tolerances and journey owners | F-OP-01 to F-OP-03 |
| 10 | Regulatory read-across and consistent escalation | B-OP-03, C-OP-08, H-OP-09 |

### 4. Is the agentic-AI entry point credible now?
- **Verdict:** Not as the first product. It is credible as a second module in 2027–2028.
- **For:**
  - The FCA is building a framework (I-OP-01).
  - Liability is unresolved (I-OP-04).
  - US bank blocks show the risk has reached boards (I-OP-06).
  - SS1/23 already governs self-learning models (I-OP-09).
- **Against:**
  - There are no UK rules yet.
  - Banks are blocking third-party agents, so there is little agent activity to monitor.
  - Detection is crowded (I-OP-10).
  - The latency claims cannot be verified (claim 7).
  - Building societies are likely late adopters [inference].
- **Better wedge:** financial crime appetite and governance for fast-growing challengers, built on the Starling, Monzo, Metro and Nationwide precedents. It would cover:
  - VREQ adherence;
  - screening coverage;
  - control capacity relative to growth;
  - parameter-change lineage;
  - reportability clocks.

### 5. Ten questions for a former UK CRO
1. Which layer did the skilled person find broken first, and how long did each take to fix?
2. How many Level 1 metrics did your final RAS hold, and which did the board actually discuss?
3. How did you calibrate amber, and did anything go straight from green to red?
4. What did the board see that the BRC did not, and who set the filter?
5. Which "reportable or not" call did you nearly get wrong?
6. How did risk owners see technology changes to rules and feeds?
7. Did internal SMF attestations change behaviour?
8. How did you document the tension between growth and financial crime, and who arbitrated it?
9. What did regulator read-across requests cost in person-days?
10. Would the CRO, CFO or BRC chair sign for this tool, and what would make the first line adopt it?

## Caveats
- **Unverified items:**
  - the Section B counts;
  - the IIA text;
  - EU and US agentic positions;
  - competitor capabilities;
  - bank programme terms.
- **Secondary sources only:** US bank stances, the 86% figure and the FSB agentic practices.
- **Rule details from panel knowledge, to check against current texts before coding:**
  - SUP 15.11 timelines;
  - FR7;
  - SS5/16;
  - FSMA s66A/66B;
  - SYSC 6.3.
