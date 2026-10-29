**Engine tag: GP**

# UK Risk Board View — Stage 0 Research

**Research cut-off: 27 October 2026.** The panel’s overall conclusion is that the practitioner’s core diagnosis is substantially right: a control-level compliance view is below the natural decision altitude of a bank board. UK rules do not prescribe a universal three-tier “Level 1/2/3” appetite taxonomy or a fixed number of board metrics, but the regulatory and firm evidence consistently points to an end-to-end chain of **strategy → board-approved risk appetite → quantitative limits/triggers and qualitative statements → business-level limits and indicators → controls → monitoring/escalation → assurance**. The commercial opportunity is therefore not another risk register; it is a decision layer that preserves traceability down to controls while allowing directors and Senior Managers to see strategic trade-offs, ownership and impending appetite breaches. citeturn0search2turn15search4turn21view0turn22view0

The agentic-AI financial-crime hypothesis is also credible, but for a different reason than “banks are already letting autonomous agents freely make payments”. They mostly are not. On 26 October 2026 the Bank of England/FCA survey found agent deployment widespread but broad autonomy rare, while HM Treasury, the FCA and Bank of England have explicitly identified agentic payments, delegated authority, identity, liability, consent, fraud and compressed decision latency as emerging regulatory problems. That makes the opportunity **early and strategically relevant, rather than mature and proven**. citeturn19view0turn19view1turn19view2turn18view1

## A — Risk appetite framework architecture

### A-GP-01 — The regulatory architecture is strategy-to-risk, not control-to-compliance

**Finding.** The FSB’s canonical Risk Appetite Framework establishes the conceptual order that a board-facing product should reproduce: business objectives and strategy are pursued subject to risk capacity; the board articulates aggregate appetite through a Risk Appetite Statement; appetite is then translated into limits that constrain legal entities, businesses and risk-taking activities. The RAF includes the policies, processes, controls, systems and governance needed to establish, communicate and monitor that appetite. UK supervisory material follows the same logic: boards set strategy and risk appetite, while management operates within it. citeturn0search2turn15search4

**Evidence.** Nationwide says its Board-approved appetite sets “the level of risk which is acceptable in the delivery of the Group’s strategy”, with statements supported by metrics, limits and triggers. Leeds says its Strategic Risk Appetite contains qualitative statements and quantitative metrics defining the parameters within which the Society should operate to deliver strategy, and that those metrics feed corporate planning and stress testing. citeturn21view0turn22view0turn23view1

**Source.** *Principles for an Effective Risk Appetite Framework*, Financial Stability Board, 18 November 2013, URL: `https://www.fsb.org/2013/11/r_131118/`; *Regulatory expectations*, Prudential Regulation Authority/Bank of England, 02 February 2026, URL: `https://www.bankofengland.co.uk/prudential-regulation/new-bank-start-up-unit/regulatory-expectations`; *Annual Report and Accounts 2026*, Nationwide Building Society, 20 May 2026, URL: `https://www.nationwide.co.uk/-/assets/nationwidecouk/documents/about/how-we-are-run/results-and-accounts/2025-2026/annual-report-and-accounts-2026.pdf`. citeturn0search2turn15search4turn21view0

**Tags:** `[confirmed]`

**Product implication.** Make **strategy the first object in the data model**, not a decorative field added above a risk register.

### A-GP-02 — “Level 1/2/3” is a useful implementation pattern, but not prescribed UK terminology

**Finding.** RAF, RAS, RMF/ERMF, KRI, limit, trigger, policy, control and three lines terminology is well evidenced. A universal regulatory definition of “Level 1, Level 2 and Level 3 appetite metrics” was not found. That hierarchy should therefore be marketed as a practical architecture rather than a PRA or FCA requirement. `[practice-not-rule]` citeturn0search2turn23view1

A defensible product taxonomy would be:

| Layer | Practical UK interpretation |
|---|---|
| Board / Level 1 | A small set of enterprise or principal-risk appetite statements and primary metrics that constrain strategy |
| Executive / Level 2 | Risk-type, business-line, product, portfolio or legal-entity limits and leading indicators allocating the board appetite |
| Operational / Level 3 | Process, journey, desk, model or control-level KRIs/KPIs, tolerances and exceptions that give early warning before higher-level limits fail |
| Controls | Preventive/detective controls, policy requirements, RCSAs, testing and remediation that keep the Level 3 profile inside appetite |
| Assurance | Second-line challenge and third-line independent assurance that the chain is designed correctly and actually operating |

Leeds provides unusually clear public evidence for the substance of this cascade: first line defines and adheres to appetite, second line co-ordinates appetite and policy, third line independently assures first- and second-line risk management; the board’s Strategic Risk Appetite spans eight principal risks and is reinforced by policies and standards. citeturn23view1

**Source.** *Annual Report and Accounts 2025*, Leeds Building Society, 26 February 2026, URL: `https://www.leedsbuildingsociety.co.uk/_resources/pdfs/press-pdfs/financial-results-pdfs/2025-annual-report-and-accounts.pdf`; *Principles for an Effective Risk Appetite Framework*, FSB, 18 November 2013. citeturn23view1turn0search2

**Tags:** `[practice-not-rule]`

**Product implication.** Support configurable tier names. Do not hard-code “L1/L2/L3” as though the regulator defined them.

### A-GP-03 — RMF, RAF, RAS, RCSA and control matrices perform different jobs and should not be collapsed

**Finding.** A useful product distinction is:

**RMF/ERMF** is the wider operating system for identifying, assessing, managing, monitoring and reporting risk. **RAF** is the governance and process for defining how much risk the organisation is prepared to take. **RAS/SRA** is the board articulation of that appetite. **KRIs/limits/triggers** measure whether exposure is approaching or outside that appetite. **RCSA** is a bottom-up assessment of inherent risk, controls and residual risk. A **risk-and-control matrix** is the traceability structure connecting a risk to its causes, controls, evidence, tests and owners. FSB formally defines the first three concepts; firms such as Leeds and Nationwide demonstrate how appetite sits within a wider RMF. citeturn0search2turn21view0turn23view1

The panel disagrees with the proposition that a board should directly consume the RCSA or control matrix. The CRO and first-line member want drill-through access; the NED wants the board page to stay at strategy/appetite/exceptions. Both are consistent if the control detail is **one click down rather than one level up**.

**Source.** FSB, 18 November 2013; Nationwide, 20 May 2026; Leeds Building Society, 26 February 2026. citeturn0search2turn21view0turn23view1

**Tags:** `[inference]`

**Product implication.** Preserve the entire lineage but show each governance layer only the altitude it can act on.

### A-GP-04 — Threshold calibration should distinguish “no intentional tolerance” from numerical operating bands

**Finding.** The sources support quantitative measures, limits and early-warning triggers but do not prescribe a standard red/amber/green calibration formula. FSB expects risk limits to constrain actual risk-taking; Nationwide explicitly uses both limits and triggers; Leeds says it uses early-warning indicators and escalation procedures. citeturn0search2turn21view0turn22view0

A robust calibration pattern is therefore `[practice-not-rule]`:

- A **zero/no-intentional-tolerance statement** for matters such as deliberate sanctions breaches, knowingly misleading regulators, internal fraud or material Consumer Duty misconduct. “Zero appetite” should not be represented as a prediction that no incident can ever occur.
- A **green operating range** where normal management discretion applies.
- An **amber early-warning range** where corrective action, forecast and named ownership are required before the hard limit is hit.
- A **red limit/breach state** requiring formal escalation, action and potentially a reportability assessment.

The practitioner contention that lower-tier amber bands should be wider is directionally sound. If operational indicators only go amber immediately before the board metric turns red, they provide no early warning. But widening should be determined from lead time, volatility, control response time and the statistical relationship between lower- and upper-tier indicators, not by an arbitrary percentage. `[inference]`

**Source.** FSB, 18 November 2013; Nationwide, 20 May 2026; Leeds, 26 February 2026. citeturn0search2turn21view0turn23view1

**Tags:** `[practice-not-rule]` `[inference]`

**Product implication.** Threshold configuration should capture not just red/amber values but **response time, escalation action, owner and upstream metric affected**.

### A-GP-05 — There is no authoritative “10–12 board appetite metrics” rule

**Finding.** No PRA, FCA, FSB or reviewed public bank disclosure establishes a maximum of 10–12 RAS metrics. The FSB preference is for an appetite statement that can be communicated and used effectively, not a numerical cap. UK firms often define appetite across roughly a single-digit or low-double-digit number of **principal risks**, but each principal risk can have several supporting metrics. Nationwide has eight principal-risk categories in its 2026 report; Leeds has eight; Metro has eleven. citeturn21view0turn23view0turn22view3

The NED on the panel nevertheless supports a deliberately small **board-primary** set. The CRO objects to turning 10–12 into doctrine because liquidity, capital, credit and operational resilience alone can require several non-substitutable measures. The reconciled design principle is: **few primary decision metrics, unlimited traceable subordinate measures**.

**Source.** FSB, 18 November 2013; *Annual Report and Accounts 2026*, Nationwide, 20 May 2026; *Annual Report and Accounts 2025*, Leeds, 26 February 2026; *Annual Report and Accounts 2025*, Metro Bank Holdings, 15 April 2026, URL: `https://www.metrobankonline.co.uk/globalassets/documents/investor_documents/metro-bank---annual-report-2025.pdf`. citeturn0search2turn21view0turn23view0turn22view3

**Tags:** `[conflict]` `[practice-not-rule]`

**Product implication.** Allow the board to designate perhaps 8–15 “primary” indicators without implying that all other appetite metrics are second-class.

### A-GP-06 — Credit appetite is demonstrably a growth lever

**Finding.** The strongest evidence for “risk as a strategic lever” is credit. Leeds says SRA metrics are used in corporate planning and stress testing, and its 2025 report explicitly refers to deploying credit appetite while using lending policies and limits. Its mortgage policies also disclose maximum LTV boundaries and differentiated underwriting. Metro likewise describes updating credit policy, risk appetite and control frameworks to support strategic growth in retail mortgages and corporate/commercial lending. citeturn22view0turn23view2

This means the board question is not simply “are we within credit appetite?” It is “how much of the available risk capacity are we deliberately using, in which segments, at what risk-adjusted return, and what additional growth could be supported before a constraint becomes binding?” `[inference]`

**Source.** Leeds Building Society, 26 February 2026; Metro Bank Holdings, 15 April 2026. citeturn22view0turn23view2

**Tags:** `[inference]`

**Product implication.** Show **headroom and growth capacity**, not only breaches.

### A-GP-07 — Recommended leading and lagging indicators across the nine target domains

The following is a product design synthesis rather than a regulatory minimum. It reflects the principle that lower-level indicators should warn before outcome metrics fail. `[inference]` citeturn0search2turn23view1turn19view3

| Domain | Leading indicators | Lagging indicators |
|---|---|---|
| Credit | Approval mix migrating toward high LTV/high DTI; underwriting overrides/exceptions rising | Arrears/default flow; realised credit losses/ECL deterioration |
| Market | Sensitivity utilisation approaching limits; growing unhedged basis/duration concentration | Trading/P&L loss; actual limit breaches or valuation losses |
| Liquidity | Deposit concentration/outflow velocity; LCR/internal survival headroom forecast | Liquidity buffer depletion; actual regulatory/internal liquidity breach |
| Conduct | Journey friction/drop-off or vulnerable-customer exceptions; complaint precursor/contact-driver deterioration | Upheld complaints/redress; confirmed Consumer Duty poor outcomes |
| Climate | Exposure migrating toward high physical/transition-risk sectors; collateral EPC/geographic-risk mix | Realised climate-related credit/operational losses; portfolio emissions/target miss |
| Financial crime | High-risk onboarding/override rate; sanctions/AML queue age or false-positive drift | Confirmed control breaches; SARs/losses/enforcement/remediation population |
| Operational resilience | Remaining impact-tolerance headroom; unresolved vulnerabilities/dependency concentration | Important-business-service impact-tolerance breach; outage duration/customer impact |
| Cyber | Critical vulnerabilities past SLA; privileged-access/anomalous-activity trend | Successful compromise/data loss; material cyber incident/service outage |
| Regulatory | Upcoming obligations without accountable owner/control; overdue policy/control remediation | Rule breach; missed filing/notification, VREQ/enforcement/redress |

For financial crime and AI specifically, Metro’s 2025 emerging-risk disclosure already describes adaptive monitoring and behavioural analytics as mitigation for AI-enabled threats; FCA 2026 AI good practice stresses ongoing monitoring, escalation and human accountability. citeturn23view3turn19view3

**Source.** FSB, 18 November 2013; Leeds, 26 February 2026; FCA, *AI in financial services: good practice and areas for improvement*, 19 October 2026, URL: `https://www.fca.org.uk/publications/good-poor-practice/ai-financial-services`. citeturn0search2turn23view1turn19view3

**Tags:** `[inference]`

**Product implication.** Every board metric should have a **leading-indicator tree** showing how much warning each child metric historically provides.

## B — How boards actually see risk (UK evidence)

### B-GP-01 — Public disclosure confirms the architecture but usually hides the board metric pack

**Finding.** Across the reviewed firms, annual reports are much more willing to disclose the **risk taxonomy, governance, principal/emerging risks and qualitative appetite architecture** than the actual number and thresholds of board RAS metrics. That matters commercially: a product should not interpret the absence of published metrics as evidence that firms do not maintain detailed internal suites. Nationwide says appetite is supported by metrics, limits and triggers; Leeds describes qualitative and quantitative SRA metrics; Metro says appetite for principal risks is monitored via KRIs, while none publishes a complete board appetite dashboard. citeturn21view0turn23view1turn22view3

**Source.** Firm reports listed below.

**Tags:** `[confirmed]`

**Product implication.** A credible board product must handle confidential internal metric values while allowing firms to generate a sanitised external narrative.

### B-GP-02 through B-GP-10 — Firm-by-firm evidence

| ID | Firm, document and year | Principal risks | Emerging/top risks | Appetite metrics disclosed | Presentation and governance practice |
|---|---|---:|---|---|---|
| **B-GP-02** | Nationwide, *Annual Report and Accounts 2026* | **8**: credit; liquidity/funding; capital; market; pension; business; operational/conduct; model | Separate “top and emerging” overlay, linked back to principal risks; public section names material macro/geopolitical and other cross-cutting themes | No total metric count; states appetite comprises statements supported by metrics, limits and triggers | Board approves appetite; BRC monitors/challenges and recommends appetite/metrics. Strong explicit strategy-appetite linkage. Source: Nationwide, 20 May 2026, URL above. citeturn21view0turn21view1 |
| **B-GP-03** | Coventry Building Society, *Annual Report & Accounts 2024* | Taxonomy disclosed in RMF; total not safely re-counted from reviewed extract | At least four shown on reviewed page: economic/geopolitical; housing/mortgage/funding market; changing customer behaviour; technology/digital innovation | No public count located | “Top and emerging” risks are filtered above principal risks and closely monitored by Board. Source: Coventry Building Society, 06 March 2025, URL: `https://www.coventrybuildingsociety.co.uk/content/dam/cbs/member/pdfs/financial-results/2024/annual-report-and-accounts-2024.pdf`. citeturn23view4 |
| **B-GP-04** | Yorkshire Building Society, *Risk Management Report 2025* | Public taxonomy present; exact total not safely verified in this extraction | Emerging-risk process disclosed | No public total found | Board ultimately responsible for effective risk management and approval of appetite/certain policies; BRC oversight; executive risk governance below it. Source: Yorkshire Building Society, 2026 posting, URL: `https://www.ybs.co.uk/documents/d/ybs/risk-management-report-2025?download=true`. citeturn7view2 |
| **B-GP-05** | Skipton Group, *Annual Report & Accounts 2024* | Risk taxonomy in risk report; total not safely re-counted here | Prominent emerging themes include economic/geopolitical and technology/innovation | No public metric count found | Board explicitly maintains forward-looking scenario focus; emerging risks are shown with mitigation rather than raw control inventories. Source: Skipton Building Society, 25 February 2025, URL: `https://www.skipton.co.uk/content/dam/sbs-sites/skipton-co-uk/documents/about-us/financial-results/2024/annual-reports-and-accounts-2024.pdf`. citeturn23view5 |
| **B-GP-06** | Leeds Building Society, *Annual Report and Accounts 2025* | **8** | Separate emerging-risk category; climate remains an emerging rather than standalone principal risk | No total metric count; explicitly says SRA contains qualitative statements and quantitative metrics | Board defines SRA across all eight principal risks; continuous monitoring, early-warning indicators and escalation; SRA used in planning and stress testing. Source: Leeds, 26 February 2026. citeturn23view0turn23view1 |
| **B-GP-07** | Principality Building Society, 2025 reporting suite | Public risk reporting exists; a prior risk disclosure identifies a low-double-digit key-risk taxonomy, but the exact 2025 annual-report count was not independently re-extracted in this run | Emerging risks discussed in reporting suite | No count verified | Evidence sufficient to establish conventional board/RMF architecture, insufficient to claim a precise current board metric count. `[unverified]` Source: Principality, 2025 reporting suite; exact publication date not confirmed in accessible extract. |
| **B-GP-08** | Starling Bank, *Annual Report 2025* | Risk taxonomy disclosed; exact count not reliably extracted from the accessible version in this run | Emerging and strategic risk discussion present | No verified public total | Enforcement evidence is much more revealing than public appetite counts: rapid growth materially outpaced financial-crime control capability. `[single]` Source: Starling annual reporting 2025 plus FCA Final Notice/press release, 02 October 2024. citeturn9search0 |
| **B-GP-09** | Monzo Bank, *Annual Report 2026* | Principal-risk reporting present; exact current count not safely verified here | Risk and growth themes reported | No verified public count | Public reporting describes first-line ownership and risk-management structure, but the 2025 FCA case provides stronger evidence about where appetite/control cascades broke during rapid scaling. Source: Monzo, 2026 annual reporting; FCA, 08 July 2025. citeturn9search1 |
| **B-GP-10** | Metro Bank Holdings, *Annual Report and Accounts 2025* | **11**: credit, capital, liquidity/funding, market, financial crime, operational, conduct, regulatory, legal, model, strategic | **5 visibly listed**: geopolitical instability; prolonged macro stagnation; digital disruption/technology competition; AI-enabled threats; climate-related financial risk | No total; says principal-risk appetite is monitored using KRIs | Particularly strong strategy linkage: credit appetite/control framework adjusted for strategic growth. Emerging risks explicitly map back to affected principal risks. Source: Metro Bank, 15 April 2026. citeturn22view3turn23view2turn23view3 |

**Tags:** B-GP-02, 03, 04, 05, 06, 10 `[confirmed]`; B-GP-07, 08, 09 `[unverified]` where stated.

### B-GP-11 — The dominant filtering pattern is board = aggregate/exceptions, management = detail

**Finding.** The public evidence supports layered escalation rather than the simplistic rule “board sees reds only”. The Board typically approves strategy/appetite and receives the aggregate profile, material breaches, top/emerging risks and remediation; the board risk committee performs deeper challenge; executive and specialist committees run the underlying limits, actions and exceptions. Nationwide identifies Board, BRC and specialist committees including asset/liability, credit and model-risk committees; Yorkshire similarly separates Board/BRC from executive risk governance. citeturn21view0turn7view2

No regulator rule was found prescribing “red only to Board, amber/red to BRC”. Such filtering is **firm design**, and a board can legitimately need an amber if it threatens strategy, regulatory commitments or future headroom. `[practice-not-rule]`

**Source.** Nationwide, 20 May 2026; Yorkshire Building Society, 2025 Risk Management Report.

**Tags:** `[practice-not-rule]`

**Product implication.** Escalation should be **materiality- and decision-based**, not a static traffic-light visibility rule.

## C — Reportable versus not reportable

### C-GP-01 — Principle 11/SUP 15 creates an immediate-notification overlay above individual reporting regimes

**Finding.** FCA SUP 15.3 requires a firm to notify the FCA **immediately** once it becomes aware, or has information reasonably suggesting, that specified serious matters have occurred, may have occurred, or may occur in the foreseeable future. Relevant matters include serious regulatory impact, significant fraud/errors and significant rule breaches. Guidance says significance can depend on potential customer/firm loss, frequency, systems-and-controls implications and delay in identifying or correcting the problem. citeturn14view3

This is why a simple “is there a statutory form due?” engine is insufficient. A conduct-rule return or other periodic process can coexist with an **immediate Principle 11/SUP 15 obligation**. SUP itself notes that the same underlying issue can require separate notifications where the timetables differ. citeturn14view3

**Source.** *SUP 15.3 General notification requirements*, Financial Conduct Authority Handbook, current extract 27 March 2026, URL: `https://handbook.fca.org.uk/handbook/sup15/sup15s3`.

**Tags:** `[confirmed]`

**Product implication.** “Reportability” needs a rules engine plus human legal/regulatory judgement, not a single severity threshold.

### C-GP-02 — PRA Fundamental Rule 7 is deliberately broader than a checklist

**Finding.** PRA Fundamental Rule 7 requires PRA firms to deal with regulators openly/co-operatively and disclose appropriately anything relating to the firm of which the PRA would reasonably expect notice. Current operational-incident policy explicitly says firms already notify certain incidents/material outsourcing under FR7 and the PRA notifications rules. citeturn15search2

The breadth is intentional: a firm can fail even if it cannot point to one prescriptive reporting field that exactly matches the incident.

**Source.** *PS7/26 — Operational resilience: Operational incident and third-party reporting*, Prudential Regulation Authority/Bank of England, 18 March 2026, URL: `https://www.bankofengland.co.uk/prudential-regulation/publication/2026/march/operational-incident-and-third-party-reporting-policy-statement`. citeturn15search2

**Tags:** `[confirmed]`

**Product implication.** The decision record should ask “would the PRA reasonably expect notice?” in addition to rule-specific tests.

### C-GP-03 — Incident and third-party reporting is becoming more structured from March 2027

**Finding.** As of 27 October 2026, firms remain subject to existing Principle 11, PRA FR7 and outsourcing/notification obligations. New FCA rules for operational incidents and material third-party arrangements go live **18 March 2027** for in-scope firms including banks and building societies. The FCA expressly tells firms to continue meeting Principle 11 obligations before the new regime commences. citeturn14view4

**Source.** *Reporting material third party arrangements*, FCA, 18 March 2026, URL: `https://www.fca.org.uk/firms/outsourcing-and-operational-resilience/reporting-material-third-party-arrangements`; PRA PS7/26, 18 March 2026. citeturn14view4turn15search2

**Tags:** `[confirmed]`

**Product implication.** A 12–24 month roadmap should include dual operation of **current obligations and future 18 March 2027 reporting logic**.

### C-GP-04 — Conduct-rule reporting has a different clock from serious-event notification

**Finding.** FCA guidance requires disciplinary action for an SMF Conduct Rule breach to be notified on the Senior Manager notification route within the applicable short timetable; non-SMF Conduct Rule breaches are generally reported in the annual REP008 process. But a sufficiently serious underlying matter can separately trigger immediate Principle 11/SUP 15 reporting. citeturn0search29turn0search9turn14view3

This is an important product requirement: **one event can spawn multiple reporting obligations with different clocks, owners and evidence**.

**Source.** *Conduct Rules*, FCA, 29 March 2023 and current Handbook SUP 15.11 as at September 2026, URL: `https://www.fca.org.uk/firms/senior-managers-certification-regime/conduct-rules`; FCA Handbook SUP 15.

**Tags:** `[confirmed]`

**Product implication.** Model notifications as one-to-many children of an incident, not one “reported/not reported” Boolean.

### C-GP-05 — SARs use a suspicion threshold, not a board materiality threshold

**Finding.** The NCA states that people in financial services or related regulated sectors who suspect money laundering or terrorist financing must submit a Suspicious Activity Report. That means a SAR decision is analytically different from Principle 11 materiality: a transaction can be financially small yet suspicious enough to report. citeturn25search1

**Source.** *Money laundering and illicit finance — Suspicious Activity Reports*, National Crime Agency, current 2026 page, URL: `https://www.nationalcrimeagency.gov.uk/what-we-do/crime-threats/money-laundering-and-illicit-finance`.

**Tags:** `[confirmed]`

**Product implication.** Keep **SAR suspicion logic separate from regulator-materiality logic**, while linking the same underlying issue where appropriate.

### C-GP-06 — Under-reporting has clear regulatory downside; over-reporting is mainly an operational/governance problem

**Finding.** Under-reporting can itself become a breach of openness/co-operation irrespective of the original incident. FCA/PRA enforcement repeatedly demonstrates that delay, incomplete escalation and weak systems/control information increase regulatory concern. citeturn14view3turn15search2

By contrast, no general prohibition on “over-reporting” was identified. Excessive notifications can create supervisory noise, unnecessary legal effort, inconsistent precedents and defensive behaviour, but those are governance costs rather than an equivalent regulatory offence. `[practice-not-rule]`

“Read-across” — asking management to test whether the same root cause exists across other products, populations, systems or time periods — is a common and rational supervisory/remediation technique, but no standalone rule requiring a standardised “read-across request” was found. `[practice-not-rule]`

**Product implication.** A reportability module should record **facts, rule basis, materiality analysis, counterargument, decision-maker, time, regulator contact and required read-across population**.

### C-GP-07 — A defensible human decision step is auditable, time-stamped and reversible

**Finding.** A good decision record would show: incident facts known at the time; potentially applicable rules; customer/financial/system/control impact; whether similar events exist; legal/compliance/MLRO advice; decision and rationale; accountable SMF; notification deadline; subsequent facts that could reopen the decision. This is `[inference]` from the open/co-operative standard and current FCA emphasis on accountability and escalation. citeturn14view3turn19view3

**Tags:** `[inference]`

**Product implication.** AI may prepare and challenge the reportability case; **a named human should own the final decision for consequential regulatory notifications**.

## D — Accountability: SMCR, risk owners and control owners

### D-GP-01 — SMCR is fundamentally an allocation-of-accountability architecture

**Finding.** The Senior Managers Regime was created to make responsibility for key risks and decisions identifiable at the top of a firm. Statements of Responsibilities specify what an individual Senior Manager is accountable for; Management Responsibilities Maps show how responsibilities fit together at firm level; prescribed responsibilities ensure specified regulatory responsibilities are allocated. The regime is intended to make senior accountability traceable rather than diffuse. HM Treasury describes its objectives as clear allocation of responsibilities, individual accountability for key risks and robust oversight of senior decision makers. citeturn14view2

**Source.** *Reforming the Senior Managers & Certification Regime: Consultation Response*, HM Treasury, 22 April 2026, URL: `https://www.gov.uk/government/consultations/consultation-reforming-the-senior-managers-certification-regime/outcome/reforming-the-senior-managers-certification-regime-consultation-response`.

**Tags:** `[confirmed]`

**Product implication.** Risk, metric, control, issue and regulatory-obligation objects should all resolve to a named accountable person and their SMCR responsibility where relevant.

### D-GP-02 — Duty of Responsibility is about reasonable steps, not strict liability

**Finding.** SMCR does not mean an SMF is automatically personally liable whenever something goes wrong beneath them. The relevant question is whether reasonable steps were taken in the circumstances. FCA Conduct Rules guidance gives as a failure example not taking reasonable steps to allocate responsibilities clearly or implement adequate controls. citeturn0search37

**Source.** *COCON 4.2 — Specific guidance on individual conduct rules*, FCA Handbook, current 2026, URL: `https://handbook.fca.org.uk/handbook/COCON/4/2.html`.

**Tags:** `[confirmed]`

**Product implication.** A board product should evidence the **reasonable-steps trail**: challenge, action assignment, follow-up, escalation and closure evidence.

### D-GP-03 — The six-monthly “every SMF certifies to the regulator” claim is not supported

**Finding.** The claim conflates Senior Managers with the Certification Regime. Certification historically applies to employees below Senior Manager level whose roles can cause significant harm; firms assess and certify those individuals, including an **annual** recertification cycle. HM Treasury’s April 2026 reform response explicitly describes the annual recertification requirement and proposes removing the Certification Regime from primary legislation. It does not describe six-monthly certification by every SMF to a regulator. citeturn14view2

**Source.** HM Treasury, 22 April 2026.

**Tags:** `[confirmed]`

**Product implication.** Do not encode a fictional six-month SMF regulatory attestation. Make internal attestations configurable.

### D-GP-04 — SMCR is in active reform, but accountability is not being abandoned

**Finding.** Phase 1 reforms took effect in April 2026. On **23 October 2026**, the PRA launched Phase 2 proposals described as the most significant changes since SMCR’s introduction. They include moving almost half of PRA SMFs away from pre-approval toward firm notification, including Chairs of Risk and Audit Committees, and removing PRA Certification Regime requirements for approximately 7,700 people. Implementation is expected in H2 2027, subject to legislation; consultation closes 22 January 2027. citeturn14view0

The joint regulatory announcement estimates a **43% reduction in PRA SMCR pre-approvals** and roughly a halving of the PRA regime’s overall burden, while retaining senior accountability. citeturn14view1

**Source.** *CP14/26 — Review of the SM&CR — Phase 2*, PRA, 23 October 2026, URL: `https://www.bankofengland.co.uk/prudential-regulation/publication/2026/october/review-of-the-smcr-phase-two-consultation-paper`; *Regulators unveil plans to simplify Senior Manager and Certification Regime*, Bank of England/FCA, October 2026. citeturn14view0turn14view1

**Tags:** `[confirmed]`

**Product implication.** Treat SMCR mappings as versioned regulatory metadata, not static implementation.

### D-GP-05 — Risk owner and control owner are different accountability roles

**Finding.** A useful operating definition is: the **risk owner** is accountable for understanding and managing aggregate exposure to a risk and making risk-taking decisions; the **control owner** is accountable for the design, operation and evidence of a specific mitigating control. One risk owner will usually depend on many control owners. `[practice-not-rule]`

Leeds’ first-line description is consistent with this: business lines execute strategy, identify/manage risks, operate critical controls, define/adopt appetite and perform first-line risk reporting; the risk function oversees and challenges rather than becoming the business owner. citeturn23view1

**Source.** Leeds Building Society, 26 February 2026.

**Tags:** `[practice-not-rule]`

**Product implication.** Never use one generic “owner” field for risk, control, data and action.

### D-GP-06 — Product/journey ownership is often more informative than purely vertical ownership

**Finding.** Conduct failures often cross organisational boundaries: product sets the commercial rule, technology changes a parameter, operations executes it, complaints see the outcome, while compliance sees only the rule. The risk owner therefore needs line of sight across **customer outcomes, complaints, incidents, operational errors, technology/configuration changes, overrides and control exceptions**. FCA Consumer Duty work reinforces clear outcome ownership and governance across journeys, while its AI review warns that fragmented ownership across technology and business teams weakens accountability. citeturn25search10turn19view3

**Source.** FCA, *Consumer understanding: good practice and areas for improvement*, 13 March 2026; FCA AI good-practice review, 19 October 2026.

**Tags:** `[inference]`

**Product implication.** Support both **vertical function ownership and horizontal product/journey ownership**, with conflict detection when they diverge.

### D-GP-07 — Monthly data attestation is plausible firm practice, not a regulatory rule

**Finding.** No FCA/PRA requirement was identified requiring every risk owner to attest monthly that reported data is correct. Firms commonly use data-owner sign-offs, metric-owner attestations, committee paper certifications and control attestations, but frequency and population vary. `[practice-not-rule]`

There is a strong accountability rationale: the person who owns a metric should confirm data lineage, known limitations, unexplained movements and threshold status before it is relied on. Evidence from the reviewed sources supports ownership and reliable MI but not the proposition that monthly attestation itself has been empirically proven to improve outcomes. `[single]`

**Product implication.** Offer monthly attestation as configurable governance with exception-based challenge, not a compliance claim.

## E — Three lines of defence

### E-GP-01 — The IIA model separates management ownership from independent assurance

**Finding.** The IIA Three Lines Model places the governing body at the top, management in first- and second-line roles and internal audit as the independent third line. The important point is not the labels but the independence relationship: first line owns delivery and risk-taking; second line provides expertise, monitoring and challenge; internal audit gives independent assurance to the governing body. citeturn1view1turn0search15

**Source.** *The IIA’s Three Lines Model*, Institute of Internal Auditors, 08 September 2020, updated 2024, URL: `https://www.theiia.org/globalassets/documents/resources/the-iias-three-lines-model-an-update-of-the-three-lines-of-defense-july-2020/three-lines-model-updated-english.pdf`.

**Tags:** `[confirmed]`

**Product implication.** Preserve role segregation in permissions and workflow; do not let second line silently become operational owner.

### E-GP-02 — Leeds gives a clean UK implementation of the model

**Finding.** Leeds publicly assigns first line responsibility for executing strategy, managing risks/critical controls, defining appetite, complying with policies and reporting risk. Second line maintains the ERMF, co-ordinates appetite and policy, identifies emerging risks, performs enterprise reporting and independent oversight. Third line performs independent risk-based assurance over the adequacy/effectiveness of first- and second-line risk management. citeturn23view1

**Source.** Leeds Building Society, 26 February 2026.

**Tags:** `[confirmed]`

**Product implication.** A metric should show **owner, challenger and assurer**, not merely “owner”.

### E-GP-03 — The lines should not own identical metric suites

**Finding.** A sensible allocation is `[inference]`:

| Line | Primary metric role |
|---|---|
| First line | Business KPIs, operational KRIs, control performance, exceptions, customer outcomes, loss/event data |
| Second line | Aggregate appetite measures, cross-business trends, challenge indicators, framework compliance, emerging-risk metrics |
| Third line | Audit coverage, assurance ratings, overdue high-risk findings, thematic control-effectiveness evidence |

Internal Audit should not become owner of the underlying business-risk metric it later needs to audit. The IIA model and Leeds’ implementation support that separation. citeturn1view1turn23view1

**Product implication.** Store metric provenance by line and warn where assurance independence is compromised.

### E-GP-04 — Recent enforcement repeatedly shows first-line scaling failures

**Finding.** Starling and Monzo are unusually clear growth cases. Starling’s customer base grew from roughly 43,000 in 2017 to 3.6 million in 2023 while its financial-crime controls failed to keep pace; Monzo’s customer base grew from around 600,000 in 2018 to more than 5.8 million in 2022 while onboarding, customer-risk assessment and transaction-monitoring controls were deficient. citeturn9search0turn9search1

These are not merely “second-line compliance failures”. The first-line proposition, onboarding logic and operating model expanded faster than the control environment could safely support. `[inference]`

**Product implication.** Growth metrics and control-capacity metrics should appear together on the same appetite view.

## F — Conduct, culture and Consumer Duty

### F-GP-01 — The Consumer Duty creates a direct annual board-outcomes obligation

**Finding.** PRIN 2A requires firms to prepare a governing-body report on their monitoring of consumer outcomes and actions required. The FCA’s review examined first annual reports from **180 firms** and stresses that the board should use the report to assess whether customers are receiving good outcomes and whether the firm’s future strategy is consistent with the Duty. citeturn25search2

**Source.** *Consumer Duty board reports: good practice and areas for improvement*, FCA, 11 December 2024, URL: `https://www.fca.org.uk/publications/good-and-poor-practice/consumer-duty-board-reports-good-practice-areas-improvement`.

**Tags:** `[confirmed]`

**Product implication.** Consumer-outcome metrics belong on the board risk architecture, not in a separate compliance silo.

### F-GP-02 — Journey ownership is good practice, not a mandated organisational chart

**Finding.** FCA materials emphasise clear ownership, governance, MI and action across consumer outcomes. Its 2026 consumer-understanding review describes clear ownership as good practice; its AI review favours governance across the whole customer journey rather than isolated models. Neither source requires every firm to appoint a formally titled “customer journey risk owner”. citeturn25search10turn19view3

**Source.** FCA, 13 March 2026 and 19 October 2026.

**Tags:** `[practice-not-rule]`

**Product implication.** Map risk ownership to journey ownership where possible, but let firms configure the exact accountability model.

### F-GP-03 — Culture needs behavioural indicators as well as outcome data

**Finding.** FCA culture work increasingly treats non-financial misconduct as relevant to governance and culture. Its 2024 survey covered **1,028 wholesale firms** and collected data on non-financial misconduct over 2021–2023. citeturn10search17

Potential culture indicators include speak-up volume and substantiation rate, retaliation allegations, time to close concerns, employee-risk survey results, escalation reversals, repeated override behaviour, senior-management challenge evidence, complaint escalation and conduct-event recurrence. The numbers alone can be misleading: rising speak-up volumes can represent deteriorating culture **or** improving willingness to report. Interpretation needs human attestation. `[inference]`

**Source.** *Culture and non-financial misconduct survey — findings*, FCA, 25 October 2024, URL: `https://www.fca.org.uk/data/culture-non-financial-misconduct-survey-findings`.

**Tags:** `[inference]`

**Product implication.** Culture dashboards should require **narrative interpretation**, not automatically score more reports as “worse”.

### F-GP-04 — The right split is machine-measured facts plus accountable human judgement

**Finding.** Data can measure complaints, wait times, dropped journeys, product cancellations, vulnerability indicators, overrides, exceptions, control test results and remediation ageing. It cannot reliably determine, without context, whether board challenge was intellectually honest, escalation felt psychologically safe, a customer outcome was fair in a novel edge case or management is consciously taking an acceptable strategic risk. FCA good practice repeatedly couples data with governance and human accountability. citeturn25search2turn19view3

**Tags:** `[inference]`

**Product implication.** Build **structured attestation beside data**, not instead of it.

## G — Policy-to-metric linkage and metric tension

### G-GP-01 — “Every policy must have a metric” is too strong

**Finding.** No UK rule was identified requiring a one-to-one relationship between every policy and a metric. A policy can be evidenced through a preventive control, detective control, sample testing, approval process, training, automated rule or qualitative assurance rather than a standalone KRI.

The stronger proposition is that every material policy obligation should have **evidence of implementation and monitoring**, and every board appetite statement should have enough measures/controls to establish whether the firm is operating within it. Nationwide describes its framework as appetite supported by detailed metrics/indicators, policies and standards; Leeds says its SRA is reinforced through policies and standards. citeturn21view0turn23view1

**Tags:** `[partly-supported]`

**Product implication.** Model `policy → obligation → control/metric/evidence`, allowing one-to-many and many-to-many relationships.

### G-GP-02 — Enforcement shows the danger of policy/control commitments that are not operationally enforced

**Finding.** Starling agreed in 2021 not to open new accounts for high-risk customers under a VREQ, yet opened more than **54,000 accounts for approximately 49,000 high-risk customers** between September 2021 and November 2023. That is a striking example of a top-level constraint not being translated reliably into execution. citeturn9search0

Monzo similarly breached a restriction intended to prevent onboarding high-risk customers, opening accounts for more than **34,000 high-risk customers** during the relevant period. citeturn9search1

**Source.** FCA Starling, 02 October 2024; FCA Monzo, 08 July 2025.

**Tags:** `[confirmed]`

**Product implication.** A policy or regulatory restriction should be tied to an **executable population test** that independently verifies adherence.

### G-GP-03 — Metric tension is intrinsic to “risk as a strategic lever”

**Finding.** A restrictive financial-crime onboarding policy can reduce fraud/AML exposure while degrading acquisition, conversion and inclusion; relaxed credit cut-offs can increase growth while consuming loss/capital appetite; higher liquidity buffers improve resilience while reducing return. These are legitimate, deliberate tensions rather than necessarily control failures. `[inference]` Leeds’ explicit use of risk appetite in planning and Metro’s growth/risk linkage substantiate the underlying trade-off. citeturn23view1turn23view2

A board-worthy system should therefore show paired metrics such as:

**growth:** approval/conversion, revenue, customer acquisition  
**risk:** high-risk acceptance, expected loss, fraud loss, SAR/control yield  
**friction:** false-positive rate, manual-review rate, abandonment  
**capacity:** analyst queues, model headroom, capital/liquidity consumption.

**Tags:** `[inference]`

**Product implication.** Show the board the **efficient frontier**, not merely whether each metric is green in isolation.

### G-GP-04 — Deliberate trade-offs need explicit decision records

**Finding.** A defensible trade-off record should identify the conflicting objectives, metrics affected, quantitative downside/upside, regulatory floor that cannot be traded away, decision owner, approval forum, expiry/review date and monitoring plan. `[inference]`

This is especially important where commercial appetite approaches a hard regulatory constraint: “we deliberately accepted more credit risk” can be legitimate; “we deliberately accepted non-compliance with a VREQ” is not an equivalent strategic choice. Starling and Monzo illustrate the difference. citeturn9search0turn9search1

**Product implication.** Add a first-class **risk trade-off/decision object** rather than hiding deliberate tensions in committee minutes.

### G-GP-05 — Automated metric-tension detection appears under-served

**Finding.** ServiceNow publicly supports risk appetite/tolerance configuration and integrated risk workflows; mainstream GRC tooling widely addresses risks, controls, issues and dashboards. In the reviewed evidence, no incumbent was found publicly demonstrating a mature capability that automatically detects when one appetite/metric is being optimised at the expense of another strategic objective or control obligation. citeturn24search6turn24search21

That is an absence-of-evidence conclusion, not proof that no implementation exists in customer configurations. `[single]` `[inference]`

**Source.** ServiceNow IRM product documentation, accessed 27 October 2026, URL: `https://www.servicenow.com/docs/r/governance-risk-compliance/policy-and-compliance-management/sn-otto-irm-pc.html`.

**Tags:** `[single]` `[inference]`

**Product implication.** **Metric-tension analysis is a plausible differentiator**, particularly if it uses causal/semantic links rather than simple threshold alerts.

## H — Enforcement case studies

### H-GP-01 through H-GP-09 — Relevant UK cases in the last five years

| ID | Case | What failed / failed layer | Policy adherence tracked? | Earlier leading indicator | Source and date |
|---|---|---|---|---|---|
| **H-GP-01** | **Starling Bank — £28.96m FCA fine** | Rapid growth outpaced financial-crime framework; sanctions screening covered only a fraction of the relevant list; 2021 high-risk-customer VREQ breached. Layers: **appetite/restriction, control, ownership, data, growth governance** | Evidently inadequate: >54,000 accounts were opened for c.49,000 high-risk customers despite restriction | High-risk onboarding count versus VREQ; sanctions-list coverage/completeness; growth-to-FC-staff/control-capacity ratio | FCA, *FCA fines Starling Bank for failings in financial crime systems and controls*, 02 October 2024, `https://www.fca.org.uk/news/press-releases/fca-fines-starling-bank-failings-financial-crime-systems-and-controls`. citeturn9search0 |
| **H-GP-02** | **Monzo Bank — £21.09m FCA fine** | Onboarding, customer-risk assessment and transaction monitoring failed during extreme scaling; regulatory high-risk onboarding restriction breached. Layers: **control, ownership, data, growth governance** | Inadequate: >34,000 high-risk customers were onboarded contrary to restriction | High-risk acceptance/reclassification rate; KYC exceptions; TM coverage; control-capacity per 100k customers | FCA, 08 July 2025, `https://www.fca.org.uk/news/press-releases/fca-fines-monzo-21m-failings-financial-crime-controls`. citeturn9search1turn10search20 |
| **H-GP-03** | **Metro Bank — £16.68m FCA financial-crime fine** | Transaction-monitoring data feed omitted same-day activity around account opening and other transactions until records updated; more than 60m transactions worth £51bn were inadequately monitored over the relevant period. Junior staff raised concerns before full remediation. Layers: **data, control, escalation, ownership** | Completeness was not adequately controlled | Daily source-to-monitoring reconciliation; % transactions screened; unresolved staff concern ageing | FCA, *FCA fines Metro Bank £16m for financial crime failings*, 12 November 2024, `https://www.fca.org.uk/news/press-releases/fca-fines-metro-bank-16m-financial-crime-failings`. citeturn9search4turn10search5 |
| **H-GP-04** | **Metro Bank — £10.0m FCA disclosure fine** | Incorrect risk-weighted-asset information was published without appropriate qualification after management knew correction was needed. Layers: **data, governance, disclosure, ownership** | Disclosure-control failure rather than operational policy adherence | Unresolved material data adjustments; disclosure items with outstanding legal/accounting challenge | FCA, 12 December 2022, `https://www.fca.org.uk/news/press-releases/fca-fines-metro-bank-plc-decision-notices-two-former-executives`. citeturn9search2 |
| **H-GP-05** | **Santander UK — £107.7m FCA AML fine** | Weak AML systems and controls, including inadequate customer information and monitoring of higher-risk relationships over the relevant period. Layers: **policy/control/data/ownership** | Regulatory conclusion indicates inadequate monitoring | Stale CDD; high-risk review backlog; transaction-monitoring coverage/yield | FCA, 09 December 2022. citeturn9search3 |
| **H-GP-06** | **HSBC Bank plc — £63.9m FCA fine** | Deficient automated transaction-monitoring framework, including weaknesses around scenario coverage/parameters, risk assessment and testing. Layers: **model/control/data/governance** | Monitoring controls themselves were deficient | Scenario coverage; untested parameter changes; data-feed completeness; alert-to-SAR conversion drift | FCA, 17 December 2021. citeturn10search1 |
| **H-GP-07** | **NatWest — £264.8m criminal AML fine following FCA prosecution** | Failure to comply adequately with AML requirements in monitoring/dealing with unusually large cash activity. Layers: **control, escalation, culture/ownership** | Evidently insufficient | Cash activity versus expected profile; repeated unusual cash deposits; unresolved CDD anomalies | FCA/court outcome, 13 December 2021. citeturn10search0 |
| **H-GP-08** | **Barclays — c.£42m FCA fines across financial-crime cases** | Failures in handling financial-crime risk around high-risk relationships including WealthTek and Stunt & Co. Layers: **CDD, escalation, risk acceptance, ownership** | Case-specific, but decision challenge was inadequate | High-risk relationship exceptions; unresolved adverse intelligence; transaction pattern escalation | FCA, 16 July 2025. citeturn9search5turn10search14 |
| **H-GP-09** | **Nationwide — £44.08m FCA financial-crime fine** | Inadequate ongoing due diligence, risk assessment and transaction monitoring on current accounts; remediation was not timely. FCA cited examples including personal accounts behaving like businesses. Layers: **control, data, ownership, remediation** | Inadequate monitoring and follow-up | Personal-to-business behavioural mismatch; overdue CDD; unusual turnover; remediation backlog | FCA, *FCA fines Nationwide £44m for failings in financial crime controls*, 12 December 2025. citeturn9search7 |

**Panel synthesis.** The most consistent pattern is not “firms lacked a policy”. It is that **growth, data, technology configuration, operational execution and ownership broke the chain between stated policy/appetite and what actually happened**. Starling, Monzo and Metro are particularly strong product-design evidence because machine-testable leading indicators could have exposed the disconnect substantially earlier. citeturn9search0turn9search1turn9search4

**Tags:** `[confirmed]` for enforcement facts; leading-indicator columns `[inference]`.

**Product implication.** The platform should continuously ask: **“Can we prove that the population actually obeyed the appetite/policy?”**, not merely “does an approved policy exist?”

## I — Agentic-AI financial crime risk

### I-GP-01 — Agentic AI is now explicitly on the UK regulatory agenda

**Finding.** By mid-to-late 2026, agentic finance moved from speculative technology to an explicit FCA/Bank/HM Treasury policy topic. HM Treasury describes agentic payments as a near-term practical proxy for autonomous financial systems and says firms report uncertainty about liability, consent and fraud. It states that existing frameworks do not yet provide sufficient clarity across multi-agent and third-party value chains. citeturn19view2

The July 2026 payments consultation says agents could autonomously analyse, initiate, approve and execute payments, and explicitly asks whether rules on **authentication, consent and liability for unauthorised transactions need updating**. citeturn17view0turn18view1

**Source.** *Financial Services AI Adoption Plan*, HM Treasury, 14 July 2026, URL: `https://www.gov.uk/government/publications/ai-adoption-plan-financial-services/financial-services-ai-adoption-plan`; *Modernising Payment Services Regulation*, HM Treasury, 14 July 2026. citeturn19view2turn18view1

**Tags:** `[confirmed]`

**Product implication.** Agent identity, mandate, permissions and transaction provenance should become native financial-crime data attributes.

### I-GP-02 — Actual autonomous payment deployment remains low

**Finding.** The Bank of England/FCA 2026 survey received **196 responses**. **86%** of respondents used AI; every responding UK bank and international bank did so. Among full-survey respondents, **80% reported AI agents already deployed**, but autonomy was mostly limited: 80% reported decision-support agents, 46% constrained-execution, 22% conditional-autonomy and only **2% broad-autonomy** agents. citeturn19view0

Even including planned deployment over the following 12 months, no more than **9%** expected agents to approve/decline customer outcomes, trade, initiate/execute/block payments, or change limits/thresholds/controls. citeturn19view0

**Source.** *Artificial intelligence in UK financial services — 2026*, Bank of England and FCA, 26 October 2026, URL: `https://www.bankofengland.co.uk/report/2026/artificial-intelligence-in-uk-financial-services-2026`.

**Tags:** `[confirmed]`

**Product implication.** The product window is **pre-scale governance**: banks are deciding permissions before broad autonomy becomes normal.

### I-GP-03 — FCA expects conventional accountability to remain visible through agentic workflows

**Finding.** FCA good practice calls for clear accountability, risk-based controls, human oversight and escalation; its 19 October 2026 material specifically says firms are designing governance layers for agentic AI that maintain accountability across complex workflows. citeturn19view1turn19view3

The FCA’s speech also says agentic systems can manage payments/investments and transact directly with other agents, while warning that poor governance can create consumer, cyber and operational harm at greater speed and scale. The FCA intends to work on agent identity, delegated authority, accountability and execution. citeturn19view1

**Source.** *Building the future of finance in the age of AI*, FCA, 19 October 2026, URL: `https://www.fca.org.uk/news/speeches/building-future-finance-age-ai`; FCA AI good-practice review, same date. citeturn19view1turn19view3

**Tags:** `[confirmed]`

**Product implication.** Treat agent actions as delegated human/firm actions with **identity, mandate and accountability lineage**, not as unowned machine events.

### I-GP-04 — Decision latency is becoming a control problem

**Finding.** Bank of England AI Consortium participants noted that agentic AI can compress decision-making latency enough to challenge traditional escalation, human-in-the-loop arrangements, kill switches and circuit breakers. Participants also discussed system-specific controls and real-time monitoring as autonomy increases. citeturn19view4

This strongly supports the practitioner’s broader intuition that old governance cycles will be too slow for autonomous financial activity, though it does **not** validate the specific “30 minutes to under 20 seconds” AML claim.

**Source.** *Artificial Intelligence Consortium minutes — February 2026*, Bank of England, 09 February 2026, URL: `https://www.bankofengland.co.uk/minutes/2026/february/ai-consortium-minutes-9-february-2026`.

**Tags:** `[confirmed]`

**Product implication.** Agentic-financial-crime controls need **machine-speed detection plus predefined human escalation/kill authority**.

### I-GP-05 — APP reimbursement makes prevention economically material to both sides of a payment

**Finding.** The UK APP reimbursement requirement has applied since **07 October 2024**. It generally covers in-scope Faster Payments/CHAPS APP scams; sending and receiving PSPs share reimbursement costs 50:50. Consumers can generally expect reimbursement within five business days, subject to permitted “stop the clock” cases, with a maximum standard reimbursement of **£85,000** and optional excess up to £100 that cannot be applied to vulnerable customers. citeturn16search0turn16search16

By 31 March 2026, the PSR reported that **88% (£316 million)** of claimed APP losses in the first 18 months of the regime had been reimbursed. citeturn16search5

**Source.** *APP fraud reimbursement protections*, Payment Systems Regulator, current 2026; *APP scams reimbursement dashboard for Q1 2026*, PSR, 30 July 2026, URL: `https://www.psr.org.uk/information-for-consumers/app-scams-reimbursement-dashboard/`.

**Tags:** `[confirmed]`

**Product implication.** Agentic-payment fraud is not only compliance exposure: it is a direct unit-economic risk to sending and receiving PSPs.

### I-GP-06 — Existing APP rules do not yet settle every autonomous-agent consent question

**Finding.** The crucial distinction is between an **authorised customer instruction delegated to an agent** and an **agent action outside the customer’s actual mandate**. HM Treasury’s July 2026 consultation exists precisely because current payment rules were designed before agentic AI and may need adjustment around authentication, consent and unauthorised-payment liability. citeturn18view1

Therefore it would be premature to claim that UK law has a settled universal answer assigning liability whenever an AI agent exceeds its instructions. `[confirmed]`

**Product implication.** Store the customer’s agent mandate as machine-readable constraints — amount, merchant, purpose, frequency, duration — and preserve proof of what the customer actually authorised.

### I-GP-07 — JPMorgan is restricting uncontrolled third-party agents, not rejecting agentic commerce categorically

**Finding.** Reuters reported on **22 October 2026** that major US banks were blocking third-party AI agents from operating inside customer accounts and making transactions where they were not appropriately authorised. JPMorgan CEO Jamie Dimon said the bank would not allow “just any outside agent” inside because of risk to clients and JPMorgan. citeturn25view0

However, JPMorgan Chase’s own current Terms of Use contain explicit conditions governing use of AI agents interacting with JPMorgan Chase systems, rather than an absolute statement that no agent may ever act. citeturn25view1

**Source.** Reuters, *US banks are blocking third-party AI agents access to customer accounts, sources say*, 22 October 2026, URL: `https://www.reuters.com/legal/government/us-banks-detect-unauthorized-ai-agents-customer-accounts-axios-reports-2026-10-22/`; JPMorgan Chase, *Terms of Use — AI Agent or Agentic AI Notices*, accessed 27 October 2026, URL: `https://www.chase.com/digital/resources/terms-of-use`. citeturn25view0turn25view1

**Tags:** `[confirmed]`

**Product implication.** The emerging standard is likely **trusted/permissioned agents**, not “agents versus no agents”.

### I-GP-08 — The broad Citi prohibition claim is contradicted by Citi’s own agentic-commerce material

**Finding.** Citi publicly describes agentic commerce as a future in which AI agents execute e-commerce transactions on behalf of consumers and argues that instant-payment rails can support machine-native transactions. That is incompatible with the broad claim “Citi said it will not permit agents to execute transactions” unless the claim is narrowed to **unapproved third-party agents directly logging into bank platforms**. citeturn25view2

**Source.** *Agentic Commerce: A New Chapter for Instant Payments*, Citi, 28 July 2026, URL: `https://www.citigroup.com/global/insights/agentic-commerce-a-new-chapter-for-instant-payments`.

**Tags:** `[conflict]`

**Product implication.** Messaging should distinguish **unauthorised screen/credential access** from bank-approved agentic payment rails.

### I-GP-09 — Model-risk governance applies to adaptive financial-crime models even when AI is novel

**Finding.** PRA SS1/23 establishes model-risk-management principles for banks around model identification, governance, development/validation and risk controls. Bank/FCA AI discussions in 2026 explicitly considered how SS1/23 applies to AI systems and components such as generative models, prompts and retrieval layers. citeturn0search4turn19view4

For adaptive fraud/AML detection, parameter/model changes therefore need inventory, materiality classification, controlled change, validation, monitoring and clear authority. An adaptive model should not become an invisible mechanism that silently changes the firm’s effective financial-crime appetite. `[inference]`

**Source.** *PS6/23 — Model risk management principles for banks*, PRA, 17 May 2023, URL: `https://www.bankofengland.co.uk/prudential-regulation/publication/2023/may/model-risk-management-principles-for-banks`; Bank AI Consortium, 09 February 2026. citeturn0search4turn19view4

**Tags:** `[inference]`

**Product implication.** Record every material tuning/change against the appetite metric it changes and require pre-defined approval.

### I-GP-10 — Google AML AI provides real bank evidence, but performance claims remain vendor-grade

**Finding.** Google Cloud’s AML AI has been publicly associated with HSBC. Published vendor/industry material says it uses machine learning to generate consolidated customer risk scores from transaction, network and KYC data and reports substantial reduction in alert volumes/improved detection precision at HSBC. Because these are supplier/customer promotional claims rather than independent benchmark studies, they should be treated as `[marketing-grade]`. citeturn24search5turn24search11

No robust primary evidence was found for the specific claim that a self-learning model reduced “financial crime trigger latency from about 30 minutes to under 20 seconds”.

**Source.** Google Cloud AML AI coverage/HSBC case material, June–July 2023; industry summary 27 June 2023. citeturn24search5

**Tags:** `[marketing-grade]`

**Product implication.** Sell measurable improvements such as detection precision, coverage, false positives and decision latency only where the bank’s own baseline proves them.

### I-GP-11 — EU and US direction is converging on governance and permissioning rather than a ban on agents

**Finding.** US Federal Reserve discussion in September 2026 addressed payment standards capable of registering agents and preserving evidence of cardholder approvals, while European banking authorities have been monitoring general-purpose and agentic AI from a banking and consumer-risk perspective. The UK is presently more explicit than either in consulting specifically on agentic-payment consent and liability. citeturn12search3turn12search11

**Tags:** `[single]`

**Product implication.** Build agent identity/permission evidence in a jurisdiction-neutral way and layer country-specific liability rules above it.

## J — Market, buyers and competitors

### J-GP-01 — There are 43 UK building societies, and “25% of the market” is only directionally true

**Finding.** The BSA currently represents **43 UK building societies**. As at March 2026, building societies and mutual-owned banks held **29% of outstanding UK mortgage balances**, about **£499 billion**, and **23% of outstanding UK savings balances**, about **£502 billion**; they held approximately **46% of Cash ISA balances**. citeturn20search1turn20search19turn20search3

So “building societies are about 25% of the market” is **partly supported only as a rough shorthand**. It is too low for outstanding mortgages, close to savings, and materially wrong for Cash ISAs. The denominator must be stated.

**Source.** BSA, *Building societies back one-in-three first-time buyers...*, 18 June 2026, and *Building Societies Trading Update — June 2026*, 18 June 2026, URL: `https://www.bsa.org.uk/statistics/sector-info-performance/building-society-trading-updates/building-societies-trading-update-june-2026`. citeturn20search19turn20search3

**Tags:** `[confirmed]`

**Product implication.** Building societies are a large enough segment to support a specialised go-to-market, particularly in mortgage/savings risk.

### J-GP-02 — The market is highly heterogeneous in scale and likely risk-technology maturity

**Finding.** The sector ranges from very large mutuals such as Nationwide through mid-tier regional societies to small institutions. The BSA maintains an asset-size ranking, and the reviewed annual reports show substantial differences in public sophistication and granularity. citeturn20search6turn21view0turn23view0

It is reasonable to infer that smaller firms have fewer specialist risk-data/technology resources, but asset size should not be treated as a direct maturity score. `[inference]`

**Product implication.** Create separate propositions for **enterprise integration** and **managed/lightweight RAF orchestration**.

### J-GP-03 — The natural economic buyer is the CRO; the board risk chair is an influential user, not usually the software budget holder

**Finding.** Board evidence places risk appetite oversight with the Board/BRC and day-to-day framework ownership with the risk function/CRO. Leeds says its Risk Division is led by the CRO, who reports to the CEO with independent engagement with the BRC chair; Nationwide similarly places risk-function leadership with the Group CRO. citeturn23view1turn21view0

The likely buyer pattern is therefore `[inference]`:

**Economic owner:** CRO/Group Risk.  
**Co-sponsors:** COO for operational/control integration; CFO where planning/capital is central; CIO/CDO for data architecture.  
**Senior users/influencers:** CEO, Board Risk Committee Chair, Audit Committee, SMF16/17.  
**Budget holder:** typically executive management, not the NED committee itself.

**Product implication.** Sell the strategic board outcome to the chair/CEO while landing the business case with the CRO and operating functions.

### J-GP-04 — The strongest buying triggers are moments when accountability is newly uncomfortable

**Finding.** Enforcement shows that rapid growth and supervisory restrictions create immediate demand for stronger line-of-sight. Other plausible triggers include a new CEO/CRO/BRC chair, regulatory review, skilled-person work, VREQ, remediation programme, Consumer Duty board-report weaknesses, merger/integration, major operational incident or rapid new-product expansion. Starling and Monzo are direct evidence for rapid-growth/VREQ triggers. citeturn9search0turn9search1

The broader trigger set is `[inference]`, not a regulatory rule.

**Product implication.** Go-to-market should target **change events**, not generic annual GRC-budget cycles alone.

### J-GP-05 — Incumbent GRC platforms make basic appetite, KRI, control and dashboard functionality table stakes

| Competitor | Verified/observed scope | Board appetite view | Strategy linkage | Metric-tension analysis | Ownership mapping | Target segment / evidence quality |
|---|---|---|---|---|---|---|
| **ServiceNow IRM** | Integrated risk, compliance, third party, workflows; documentation explicitly supports risk appetite/tolerance configuration | **Yes, configurable** | Possible via platform/workflows; no distinctive board strategy chain found | **No explicit capability found** | Strong workflow/entity ownership | Large enterprise. Official sources. citeturn24search6turn24search21 |
| **MetricStream** | Enterprise GRC/risk, controls and reporting is widely marketed | Likely/configurable | Not independently verified at required depth here | No verified evidence | Likely conventional owner mapping | Enterprise. Feature-level assessment `[single]`; comparison evidence only. citeturn24search9 |
| **SAI360** | Integrated risk, compliance, ethics and related workflows | Likely/configurable | Not independently verified | No verified evidence | Conventional workflow ownership | Enterprise/mid-enterprise. Third-party comparison only. citeturn24search3 |
| **Archer** | Named incumbent in enterprise GRC/IRM landscape | `[unverified]` in this run | `[unverified]` | `[unverified]` | `[unverified]` | Enterprise; detailed current feature set not independently re-checked |
| **Workiva** | Named incumbent for governance/reporting/control workflows | `[unverified]` in this run | `[unverified]` | `[unverified]` | `[unverified]` | Enterprise; detailed current feature set not independently re-checked |
| **IBM OpenPages** | Named incumbent enterprise GRC platform | `[unverified]` in this run | `[unverified]` | `[unverified]` | `[unverified]` | Large enterprise; detailed current feature set not independently re-checked |

**Finding.** The safe competitive conclusion is narrower than “nobody does appetite”: **appetite/tolerance configuration, KRIs, controls, issues and dashboards are established capabilities**. The less well-evidenced areas are strategy-to-appetite causal linkage, automatic metric-tension detection and horizontal ownership/journey line-of-sight. citeturn24search6turn24search21

**Tags:** `[single]` and `[unverified]` as marked.

**Product implication.** “Board dashboard” alone is not differentiation.

### J-GP-06 — The best differentiation is the graph between existing GRC objects

**Finding.** The apparent white space is not another repository. It is a continuously navigable graph:

**strategic objective → risk appetite statement → primary metric → subordinate indicator/limit → policy obligation → control → owner → customer journey/product → incident/complaint → regulatory obligation → reportability decision → assurance finding**.

This is an inference from what regulators and annual reports demand versus what public incumbent descriptions emphasise. citeturn0search2turn23view1turn24search21

**Tags:** `[inference]`

**Product implication.** Position the product as a **decision and evidence layer across existing GRC/control systems**, reducing replacement friction.

### J-GP-07 — NatWest demonstrates a practical bank-startup route

**Finding.** NatWest says it launched its Fintech Growth Programme in 2025 to bring fintechs together with senior bank leaders, explore joint impact and provide a potential route to scale across a 20-million-customer group. Its 2026 programme includes AI-driven firms focused on future customer experience. citeturn25search0turn25search3

Historic accelerator evidence shows bank programmes can lead to proof-of-concept trials and contracts rather than being purely educational, though programme terms change over time. citeturn24search10

**Source.** NatWest Group, *Inspiring innovation and partnership to succeed with customers*, 30 October 2025, URL: `https://www.natwestgroup.com/news-and-insights/latest-stories/ai-and-data/2025/oct/inspiring-innovation-and-partnership-to-succeed-with-customers.html`; NatWest technology/AI page, current 2026. citeturn25search0turn25search3

**Tags:** `[confirmed]`

**Product implication.** A bank-backed POC with real appetite/financial-crime data is a credible distribution and validation route; do not assume it automatically includes equity funding.

## K — Claims to verify

| ID | Claim | Verdict | Best source | Date | Note |
|---|---|---|---|---|---|
| **K-GP-01** | A RAS should have no more than 10–12 metrics | **not supported** | FSB *Principles for an Effective RAF*; UK annual reports | 18 Nov 2013; current reports 2026 | No authoritative cap found. A small primary board set is sensible practice, but principal risks themselves can number 8–11 before supporting metrics are counted. citeturn0search2turn21view0turn22view3 |
| **K-GP-02** | Every SMF gives a six-monthly certification to the regulator | **not supported** | HM Treasury SMCR reform response | 22 Apr 2026 | Certification Regime concerns non-SMF significant-harm staff and historically uses annual recertification by the firm. No universal six-month SMF regulator certification found. citeturn14view2 |
| **K-GP-03** | Building societies are about 25% of the UK market | **partly supported** | BSA June 2026 trading update | 18 Jun 2026 | 29% outstanding mortgages, 23% outstanding savings, 46% Cash ISAs for building societies/mutual-owned banks. “25%” requires a denominator. citeturn20search19turn20search3 |
| **K-GP-04** | JPMorgan and Citi said they will not permit AI agents to execute transactions | **partly supported** | Reuters; JPMorgan terms; Citi agentic-commerce paper | 22 Oct / 28 Jul 2026 | JPMorgan explicitly restricts uncontrolled outside agents. Citi publicly envisages agents executing transactions; broad claim is false unless narrowed to unauthorised third-party account access. citeturn25view0turn25view1turn25view2 |
| **K-GP-05** | FCA raises conduct expectations by comparing firms to the best in the market rather than setting fixed standards | **partly supported** | FCA Consumer Duty good/poor practice and focus areas | 2024–2026 | FCA increasingly uses outcomes-based rules, supervisory comparisons, good/poor practice and fair-value evidence rather than only prescriptive rules. But “best firm in market becomes the legal standard” is not a general FCA rule. citeturn25search8turn25search18turn25search2 |
| **K-GP-06** | Building a board risk framework from spreadsheets typically takes 12–18 months at a fast-growing bank | **unverifiable** | No robust primary benchmark located | 27 Oct 2026 research cut-off | Plausible implementation anecdote, but no reliable sector-wide benchmark was found. Time depends heavily on taxonomy, data lineage, governance redesign and remediation scope. `[single]` |
| **K-GP-07** | Financial-crime trigger latency can be cut from about 30 minutes to under 20 seconds with self-learning models | **not supported** | Google AML AI / HSBC materials | Jun–Jul 2023 | Marketing material reports improvements in alert volume/precision, not this 30-minute-to-20-second benchmark. No independent primary source validating that figure was found. citeturn24search5turn24search11 |

## SYNTHESIS

### What a UK board-level risk view must show

The evidence supports a short ordered hierarchy rather than a control dashboard:

1. **Strategy and strategic objectives.** What is the firm trying to grow, protect or change, and what assumptions underpin the plan? FSB and UK firm disclosures explicitly link risk appetite to delivery of strategy. **Evidence:** A-GP-01, A-GP-05, A-GP-06. citeturn0search2turn23view1
2. **Board-approved appetite.** For each principal risk, the Board should see the qualitative appetite statement and the few primary measures that matter to strategic decisions. **Evidence:** A-GP-01, B-GP-02, B-GP-06.
3. **Current profile, forecast and headroom.** “Green” is insufficient. The board needs actual, trend, forecast, amber/red thresholds and unused capacity. That turns risk into a growth lever. **Evidence:** A-GP-04, A-GP-06.
4. **Leading indicators beneath each board metric.** Show what is deteriorating early enough to act, and the path by which a lower-tier metric could become an appetite breach. **Evidence:** A-GP-07.
5. **Material top and emerging risks.** These should overlay the static taxonomy because macro, AI, geopolitical and climate risks span multiple principal risks. Nationwide, Coventry, Skipton, Leeds and Metro all use variants of this approach. **Evidence:** B-GP-02 to B-GP-10. citeturn21view1turn23view3
6. **Strategic tensions.** Which growth metric is being constrained by which risk metric; whether the trade-off is deliberate; and whether any hard regulatory floor is involved. **Evidence:** G-GP-03, G-GP-04.
7. **Named accountability.** Risk owner, control owner, first-line decision-maker, second-line challenger and responsible SMF need to be distinguishable. **Evidence:** D-GP-01, D-GP-05, E-GP-02.
8. **Exceptions and actions, not a wall of green controls.** The Board needs material breaches, amber trajectories, overdue actions, exceptions to policy/VREQs and evidence management is responding. Starling and Monzo show why. **Evidence:** H-GP-01, H-GP-02.
9. **Regulatory-reportability status.** A significant issue should show whether FCA/PRA/SAR/other reporting was assessed, decision owner, deadline and rationale. **Evidence:** C-GP-01 to C-GP-07.
10. **Drill-through evidence.** Directors should be able to descend from strategic objective to appetite metric, policy, control, incident and assurance finding when challenge demands it, without making control data the default board view. **Evidence:** A-GP-02, G-GP-01.

The key design principle is therefore:

> **The board page should be sparse; the evidence graph beneath it should be exhaustive.**

That is materially different from making the board consume a condensed GRC inventory.

### Qualifiers versus differentiators

**Qualifiers.** A serious competitor already needs risk registers, control libraries, RCSAs/assessments, issue/action tracking, KRIs, appetite/tolerance configuration, dashboards, regulatory/compliance mapping, workflow, role-based ownership, evidence and audit support. ServiceNow explicitly supports appetite and tolerance, and enterprise GRC competitors broadly compete around integrated risk/control/compliance workflows. citeturn24search6turn24search21

The board will not perceive “traffic lights”, “AI summarisation”, “a risk heat map”, “controls linked to risks”, or “one dashboard for the CRO” as sufficient differentiation.

**Potential differentiators, supported by the gaps identified above, are:**

**Strategy-to-control lineage.** The user begins with a strategic objective and can trace how much risk capacity it consumes, which appetite metrics constrain it and which controls make the position safe.

**Risk capacity as growth intelligence.** Instead of only “you are green”, show “you could grow £X/accept Y more exposure before credit/capital/liquidity/operational capacity becomes binding”, subject to modelling caveats.

**Metric-tension detection.** Flag situations where improving one metric worsens another — for example financial-crime friction reducing customer acquisition — and force the tension to be governed.

**Early-warning graph.** Estimate which Level 2/3 indicators lead a Level 1 deterioration and by how long.

**Ownership graph across functions and journeys.** Show that the customer-journey owner, risk owner, technology/configuration owner and control owner are different people and expose gaps between them.

**Reportability decision intelligence.** Map one incident to every possible notification route and preserve the human regulatory judgement.

**Regulatory restriction adherence testing.** Turn a VREQ, board limit or policy restriction into a testable population rule. Starling and Monzo make this a particularly compelling proposition. citeturn9search0turn9search1

**Dynamic AI/agent control governance.** Track agent identity, delegated authority, model version, parameter changes, financial-crime impact and kill/escalation controls in one lineage.

The panel’s strongest disagreement is on the word **“unserved”**. The NED and business owner see these capabilities as a clear gap in what they normally consume; the CRO cautions that large banks may already approximate them through bespoke data warehouses, risk tooling and committee packs. The commercially safer claim is therefore **“poorly integrated and operationally expensive in many firms”, not “nobody can do this.”** `[inference]`

### The ten most important product requirements

| Priority | Requirement | Evidence |
|---|---|---|
| **Strategic risk graph** | Every strategic objective links to principal risks, appetite statements, primary metrics, limits, policies, controls, owners and assurance | A-GP-01, A-GP-02, G-GP-01 |
| **Board-primary metric layer** | Curated primary metrics with actual/forecast/headroom, not an arbitrary universal 10–12 cap | A-GP-04, A-GP-05 |
| **Risk-capacity/growth simulator** | Model what additional growth consumes in credit, capital, liquidity, operational and financial-crime capacity | A-GP-06, G-GP-03 |
| **Leading-indicator cascade** | Each board metric has Level 2/3 indicators, warning lead time and escalation triggers | A-GP-04, A-GP-07 |
| **Tension/conflict engine** | Identify when metrics/policies are in conflict and force explicit decision governance | G-GP-03, G-GP-04, G-GP-05 |
| **Multi-dimensional ownership** | Separate risk, control, data, product/journey and SMF accountability | D-GP-01, D-GP-05, D-GP-06 |
| **Regulatory-notification decision trail** | One issue maps to FCA/PRA/SMCR/SAR/incident obligations, deadlines and human decisions | C-GP-01–C-GP-07 |
| **Population-level policy adherence** | Independently test whether actual transactions/customers obey limits, policies, VREQs and sanctions rules | G-GP-02, H-GP-01–H-GP-03 |
| **Board-to-control drill-through** | Sparse board narrative with evidence traceable to individual controls, incidents and tests | B-GP-01, E-GP-02 |
| **Agentic-AI governance layer** | Agent identity, delegated authority, model/tuning history, transaction provenance, fraud controls, human escalation/kill authority | I-GP-01–I-GP-10 |

The first four turn the product from “monitoring” into a strategy tool. Requirements five through nine create defensibility through accountability and regulatory evidence. Requirement ten offers a focused emerging-risk wedge.

### Whether agentic-AI financial crime is a credible entry point

**Yes, but the proposition should be narrowed.**

The strongest argument **for** entering now is regulatory timing. On 14 July 2026 HM Treasury identified agentic payments as a near-term proxy for wider autonomous finance and explicitly said accountability, liability, consent and fraud remain unclear. On 19 October the FCA identified agent identity, delegated authority, accountability and execution as areas requiring a trusted framework. On 26 October the Bank/FCA survey showed agent use already widespread inside firms. citeturn19view2turn19view1turn19view0

The second argument is that agentic activity attacks an already expensive control problem. The UK APP reimbursement regime has transferred a substantial part of scam losses directly onto PSPs, while sanctions, AML and fraud enforcement against Starling, Monzo, Metro and Nationwide shows that weak transaction coverage, onboarding restrictions, data completeness and monitoring are already board-level liabilities before agents reach scale. citeturn16search5turn9search0turn9search1turn9search4turn9search7

The third argument is architectural. An AI agent introduces exactly the accountability questions the proposed platform is designed to answer:

**Who authorised this action?**  
**Under what mandate?**  
**Which human/SMF owns the risk?**  
**Which model/version made the decision?**  
**Did the action stay within customer and bank limits?**  
**Which financial-crime controls fired?**  
**Did any dynamic model update change effective appetite?**  
**Should this incident be reported?**

That gives the wedge unusually good adjacency to the broader board-risk product.

The strongest argument **against** making it the whole company proposition is maturity. The 2026 Bank/FCA survey found only **2%** of respondents using broad-autonomy agents, and no more than **9%** planning even the specified highly consequential functions such as payment initiation/execution or limit/control changes within the coming 12 months. citeturn19view0

A second negative is that banks are actively limiting unauthorised external agents. JPMorgan’s stance is not “never agentic commerce”; it is “not just any outside agent”. That means some immediate use cases may remain pilots, internal agents and permissioned ecosystems rather than large-volume autonomous retail transactions. citeturn25view0turn25view1

A third negative is evidence quality around technology claims. The specific 30-minute-to-20-second financial-crime latency claim is not substantiated, and much AML-AI performance evidence is supplier-grade. citeturn24search5

**Panel verdict:** the strongest entry proposition is not “detect rogue AI payments in 20 seconds”. It is:

**“Govern and detect financial crime across human and AI-initiated payments: prove who or what was authorised to act, continuously test that actions remain inside the mandate and risk appetite, and give the accountable human the evidence to intervene and report.”**

That is credible in October 2026 because it solves a governance problem **before transaction autonomy becomes commonplace**. `[inference]`

### Ten sharp questions for a former UK CRO who rebuilt a risk framework under regulatory supervision

1. **When you rebuilt the RAF, what were the first three things the Board genuinely changed a decision because it could finally see — as opposed to information it merely acknowledged?**

2. **How many metrics did the Board itself see, how many sat one level beneath it, and what was the hardest metric to remove from the Board pack because an executive believed it was indispensable?** This tests the 10–12 proposition without leading the witness.

3. **Can you give an example where being well inside appetite meant you were actually leaving profitable growth on the table, and how did you quantify that unused risk capacity?**

4. **What was the earliest operational indicator that reliably predicted a later board appetite breach, and how much warning did it actually give you?**

5. **Where did ownership fail most often: between first and second line, between business and technology, between product and operations, or between a risk owner and the people operating the controls? What evidence exposed it?**

6. **When a technology team changed a parameter or rule that materially changed risk exposure, how did the accountable business risk owner find out, approve it and prove that approval later?**

7. **For a borderline Principle 11/PRA notification decision, who had the final call, what evidence was recorded, and what would have made you comfortable allowing an AI system to prepare — but not make — that judgement?**

8. **Which spreadsheet/manual reconciliations survived longest in the rebuilt framework, why were they difficult to automate, and which one created the greatest risk of the Board seeing the wrong answer?**

9. **Can you describe a genuine tension where one appetite or policy — financial crime, credit, conduct, resilience or liquidity — materially constrained another strategic objective? Was that conflict visible anywhere systematically, or only discovered in committee debate?**

10. **If autonomous agents begin initiating customer payments at scale, what new board-level risk metric would you insist on that does not exist in today’s RAF — agent authorisation failures, mandate breaches, autonomous-loss velocity, control latency, agent identity confidence, or something else?**

The questions deliberately test the assumptions that are **not** settled by published regulation: metric count, rebuild duration, attestation practice, real escalation filtering, cross-functional ownership, risk-capacity monetisation and whether metric-tension/agent-governance capabilities solve a sufficiently painful problem. The published evidence strongly supports the architecture and regulatory need; those practitioner questions determine whether it becomes a differentiated product rather than a more elegant GRC dashboard.