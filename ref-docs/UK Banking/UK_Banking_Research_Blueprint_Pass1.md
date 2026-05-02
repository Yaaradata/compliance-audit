# UK Banking Research Blueprint 
---

## 1. The Core Research Question (M1)

The surface question — "describe banking risk and compliance for jurisdiction X" — is not what this body of work answers. The deep, organising research question is:

> **What is the architecture of an observable reality that lets a bank, its regulator, and its auditors agree on whether a specific obligation was met by a specific control on a specific transaction at a specific time — and how must that architecture be rendered through the working language of each stakeholder so they each see their own job?**

Every section of the foundational document is one component of the answer to this single question.

**§1 (Foundational Definitions)** re-defines Process, Control, and Compliance away from textbook abstractions and toward run-time observable phenomena. This is necessary because if "process" remains a flowchart on a wall, "control" remains a row in a spreadsheet, and "compliance" remains a binary status field, the platform's data model has nothing to grip. The redefinitions — process as system-of-systems execution chain; control as designed condition + operating signal + effectiveness signal; compliance as demonstrable, evidenced state of conformance — establish the metaphysics on which everything else stands.

**§2 (Relationship Model)** is the bridge from "what these things are" to "how they connect." It does this in three views deliberately. The top-down view (Regulation → Obligation → Risk → Control → Process → Activity) is the regulator's view: it answers "show me how you comply." The bottom-up view (Activity drift → Process gap → Control failure → Risk event → Compliance breach → Regulatory consequence) is the failure-investigation view: it answers "how did this go wrong." The 3LoD orthogonal view recognises that the same control fact has three different metadata signatures depending on who is looking. Without all three, the data model would serve only one persona.

**§3 (Stakeholder Mental Models)** is the most operationally important section. Without it, the platform would be designed for the platform builder. The five personas are not five users — they are five distinct ontologies of work. The CRO thinks in risk taxonomies; the Head of Compliance in coverage matrices; the Compliance Officer in samples and exceptions; the Process Owner in throughput and SLAs; the Frontline Operator in cases and queues. The platform's job is to render the same underlying fact base through five orthogonal lenses, and §3 specifies what each lens must look like.

**§4 (Key Frictions)** is the platform's hazard map. The six frictions (language, ownership, doc-reality drift, speed-assurance, reactive cycles, geographic) are not problems to be solved by the platform — they are structural features of the bank's terrain. The platform must surface them, route around them, and not pretend they're absent.

**§5 (Current State Problems)** provides demand validation and jurisdictional variance. The universal problems (latency, fragmentation, manual evidence, linkage gap, issue decay, talent fragility) establish that the market need is real and not jurisdiction-specific. The US/UK/India aggravators establish that the *content* must be re-researched per jurisdiction.

**§6 (Design Implications)** translates the diagnostic into a buildable specification: design principles, ontology with run-time/design-time separation, AI capabilities tiered by leverage, persona-tuned UX. Without §6, the prior sections are interesting but unactionable.

The internal logic: ontology (§1) → relationships (§2) → users (§3) → fault lines (§4) → demand profile (§5) → design specification (§6). Each section is a necessary input to the next. Skip §3 and you build for a generic user; skip §4 and you build a brittle platform; skip §5 and you fail in two of three jurisdictions; skip §6 and you stop at insight.

The XLSX RCM operationalises this: it is the §6 ontology made concrete for one jurisdiction's worth of obligations, controls, risks, KRIs, issues, and appetite metrics, in a shape downstream chats can ingest to generate JSON Schemas, DDL, API contracts, and persona-by-view UI.

---

## 2. Research Methods & Their Limits (M2)

The foundational document is explicit that documented processes are not actual processes. To surface actual operation, in roughly descending reliability:

**1. Process mining from system event logs.** Pull event logs from core banking, payment hubs (Fedwire/SWIFT/CHAPS/Faster Payments/NEFT-RTGS), case management, GRC tools, AML monitoring engines, sanctions screening tools, document management systems. Reconstruct the actual variant graph. *Reveals:* path frequencies, deviation rates, rework loops, off-hours activity, who actually approves what at what cadence, automation gaps. *Misses:* the "why" behind a deviation; judgement calls; unstructured side-channel handling.

**2. Click-stream and shadow-IT forensics.** Browser/keystroke/clipboard logs (where governance permits), Excel macro libraries on shared drives, intermediate file watermarks. *Reveals:* swivel-chair patterns, copy-paste-from-PDF-into-screening-tool behaviour (the worked example in §2.2), undocumented Excel intermediaries between systems, the actual technology surface area. *Misses:* phone calls, WhatsApp/Teams chat, in-person nudges between supervisor and analyst.

**3. Day-in-the-life shadow shifts.** Spend full shifts physically (or via virtual ride-along) with KYC analysts, sanctions investigators, payment ops staff, fraud investigators, mortgage processors. Especially valuable in offshore/captive ops where the principal-agent gap is widest. *Reveals:* the actual sequence of decisions, the unwritten escalation rules, peer support patterns, supervisor interventions, the hot spots of real-time judgement. *Misses:* observer effect; behaviour reverts when the researcher leaves.

**4. Semi-structured interviews with frontline + supervisors.** Open-ended, scenario-driven ("walk me through the last hard case you handled this week"). *Reveals:* implicit decision rules, exception-handling logic, when policy is bent, what counts as a "win" for the operator. *Misses:* tacit knowledge they cannot articulate; politically suppressed observations.

**5. Exception-queue forensics.** Pull the last 90 days of every material exception/alert/case queue and trace dispositions back to their drivers. *Reveals:* actual judgement boundaries, supervisor override frequency, ageing pathology, where false-positive load is hidden. *Misses:* the cases that never reached the queue (suppressed at intake or routed through a parallel channel).

**6. Audit and regulator findings as a research corpus.** Internal audit reports, MRA/MRIA logs, s.166 final reports, RBI inspection findings, public consent orders/final notices, peer enforcement actions. *Reveals:* failure modes that have actually materialised, root causes admitted under regulatory pressure, the supervisor's actual evidentiary expectations. *Misses:* failures not yet detected; new typologies not yet in the enforcement record.

**7. Reconciliation break analysis.** Deep dive on suspense accounts, GL breaks, payment recon breaks, sanctions hit/miss reconciliations. *Reveals:* where the actual process is silently failing, what the upstream data quality drivers are. *Misses:* failures that net out in the same recon period.

**8. Walkthrough re-performance.** A researcher re-performs a documented walkthrough end-to-end with actual transactions, deviations recorded. *Reveals:* documentation drift between SOP and reality. *Misses:* SME-led cherry-picking ("let me show you a clean one"); hidden sub-processes not in the SOP at all.

**9. Vendor/BPO contract and SLA performance analysis.** What is contracted vs. what is delivered, especially in offshore/nearshore captive ops where the regulator is in one jurisdiction and the operator in another. *Reveals:* control-perimeter problems, evidence-availability constraints, accountability handover risks. *Misses:* practices below the SLA radar; informal escalations that bypass the contract.

**10. Email/chat archive analysis (governance approved).** Search e-comms for keywords like "workaround," "manual fix," "let me know if," "as discussed," "per our chat." *Reveals:* cultural norms; where formal process was overridden by informal coordination. *Misses:* verbal communication, in-person decisions, ephemeral chat channels.

**11. Attrition and exit interviews.** Interview leavers, especially at 6–12 months post-exit when they are most candid. *Reveals:* what was suppressed under organisational pressure, what the "real" hot spots were, why people left. *Misses:* cultural pressure to be diplomatic even after exit; selection bias toward malcontents.

**12. Reverse RCSA via population testing.** Instead of testing controls on samples, run them as queries against the entire population. *Reveals:* which controls are computable at all from the data; which controls fire reliably; which controls fail silently. *Misses:* judgement-dependent controls that cannot be evaluated by code.

**13. Concrete artifact requests.** "Show me the actual case from yesterday." "Open the spreadsheet you used this morning." "Pull up the email that triggered this escalation." *Reveals:* the gap between described and observed practice. *Misses:* practices the interviewee cannot or will not surface in real time.

**What remains invisible even after all thirteen methods:**
- The judgement reasoning that didn't make it into a case note (the "felt wrong, escalated anyway")
- Pre-cognitive risk avoidance — staff who decline cases, products, or counterparties before any record is created
- Verbal escalations that never become tickets
- Cross-team WhatsApp/Teams coordination not retained
- Cultural pressure suppressing junior escalation
- Future-state risks (controls designed for today's product mix; product mix is shifting)
- The institutional memory in 3–5 senior heads (per §5.1 universal problem of "talent fragility") that has never been needed and so has never been articulated
- Interaction effects between controls (control A masks the failure of control B until both fail simultaneously)

---

## 3. Stakeholder Interview Guides by Persona (M3)

§3 of the foundational document captures not just what each persona does but how they think, what they fear, and what they will not tolerate in a product. This level of detail is only producible by deep, scenario-grounded interviews triangulated against artifacts. The general structure each guide follows:

1. Open with role and rhythm (warm-up, builds context)
2. Probe their mental map (drawing exercise: "if you sketched your world, what would it look like?")
3. Surface fears and asymmetries (where are you exposed; what's the worst day; whose call gets returned first)
4. Ground in artifacts (last 30-day examples; show me what's open on your screen)
5. Probe friction with adjacent functions (who pushes back, who do you disappoint)
6. Future probe (in two years, what would "great" mean)
7. Closing referrals and gaps

### 3.1 CRO / CAO

1. Walk me through your last week. What did you make a decision about, and on what data?
2. If you sketched the firm's risk universe on a whiteboard, what would the top level look like? How does it compare to your peers'?
3. Where are you exposed beyond appetite right now, and how did you find out? Was it a number on a dashboard, a call from a 2LoD head, or something else?
4. Of the things that could blow up next quarter, which five worry you most, and what visibility do you have on each?
5. Tell me about the last time you took a number into a board or regulator meeting and felt unsure about the lineage. What did you do?
6. Under [SMCR / Heightened Standards / RBI accountability framework], what does "I took reasonable steps" actually mean in practice? What evidence would you produce if a regulator asked tomorrow?
7. What does your morning routine look like before ExCo? What screens or packs do you start with?
8. Which of your 2LoD heads do you trust to bring you bad news early, and how did that trust get built?
9. When something went wrong recently — at what stage did you become aware? Who told you, in what channel, and what did you wish you'd had two weeks earlier?
10. Tell me about a peer-bank event in the last year that made you ask "could that happen here?" What did you do with that question?
11. If I gave you one new screen tomorrow that no other CRO had, what would it show?
12. What is the most useless report that lands on your desk every month, and why is it still being produced?
13. Where do you find your own emerging-risk signals — analyst notes, peers, regulator speeches, internal data?
14. If you had to leave the firm tomorrow and your successor walked in, what is the one document or model you would hand them?
15. Who else in your function should I be talking to who would tell me something you wouldn't?

### 3.2 Risk / Compliance Leadership (Head of ORM / Head of Compliance / Head of Financial Crime)

1. Describe your control universe. How big, how is it organised, when was it last refreshed, and how do you know it's complete?
2. Walk me through your last RCSA cycle from start to finish. What worked, what was theatre, where did the real risk discussions happen?
3. How do you currently map regulatory change to controls? Take me through a recent example end-to-end — say, the most recent change that hit your desk.
4. Of your open issues, what proportion are genuinely in remediation versus parked? How do you tell the difference?
5. When you read a 2LoD monitoring report, what is the first thing you look at? What signals tell you something is shifting?
6. How do you defend coverage to your CRO, your auditor, and your regulator? Are those three conversations the same?
7. Tell me about the last thematic finding you raised. How did you decide it was thematic rather than isolated?
8. Where does your obligation register live, who maintains it, and how often is it actually right?
9. What is the most fragile part of your control universe — the place you would not want a regulator to look on a Monday morning?
10. How does your team interact with 1LoD process owners? Where are the standing tensions, and how do you navigate them?
11. What does your monitoring plan look like next quarter, and how was it prioritised? Risk-based or capacity-based?
12. If I gave you AI tooling that could parse a regulator's new paper and suggest control-mapping deltas, what would you need to see to trust the suggestion?
13. Of the GRC tools you currently use, which one would you remove tomorrow if you could, and why?
14. How do you assess whether your team's capacity matches the workload? When did you last lose a senior person, and what fell off?
15. What are you working on now that you wish you'd started 12 months ago?

### 3.3 Compliance Officer / Audit Manager (Doer)

1. Take me through a control test you executed last month — start to finish. Where did you spend the time?
2. Of your testing time, how much is gathering evidence versus analysing it? Where in the gather step does it get hardest?
3. Show me your sampling logic for the last test. How did you decide n=25 versus n=40 versus full population?
4. Tell me about the last exception you found. What did you do with it? How did you decide whether it was a one-off or a pattern?
5. When you re-perform a control, what does that actually look like operationally — what tools, what data, what decisions?
6. What are your evidence sources, and which one is the most painful to retrieve from? Why?
7. How do you keep your walkthroughs current? When did you last fully refresh one, and how did you do it?
8. What do you do when documentation says one thing and the system shows another?
9. Tell me about an audit / regulator request that landed on your desk recently. How did you respond, and how long did it take?
10. What would population testing change for you if it were possible across most of your control universe?
11. How do you handle exception aging — across email, GRC, Excel, attestations? Where do they currently live, and how do you not lose them?
12. When was the last time you raised a finding and felt it wasn't taken seriously? What happened?
13. Show me your workpaper template. Walk me through what each section contains and what regulators or external auditors look at.
14. If you had a "reperformance engine" that could replay control logic against a population and surface exceptions, what would you need to trust the output?
15. What does "audit-ready" mean in your practice, and how is it different from "machine-readable"?

### 3.4 Process Owner / Operations Lead

1. Tell me about your process. What does success look like — throughput, SLA, NPS, first-time-right? Show me the dashboard you actually look at.
2. Where in your process do things get stuck most often, and why?
3. How are controls embedded in your process today? Do you experience them as helpful, neutral, or as friction?
4. Tell me about a time a control caused you operational pain. What did you do?
5. When 2LoD or audit comes asking, what does that conversation feel like? Are you defending or collaborating?
6. What does your queue look like first thing in the morning, and who is making sure it's healthy?
7. Where do your team's incentives differ from compliance's incentives, and how do you reconcile that in practice?
8. Tell me about your highest-performing pod. What do they do differently? Tell me about your lowest-performing — what's their pattern?
9. How does work flow across your team's geographies — onshore, offshore, captive, BPO? Where are the hand-offs, and where do they break?
10. What signal would tell you a control was about to fail before it did? Do you have that signal today?
11. When was the last time you skipped or shortcut a step because the system was slow or the rule was unclear? What was the context?
12. If your team's data — variants, exceptions, dispositions — were exposed to 2LoD in real time, what would you want to see in return?
13. What metric is your team graded on monthly, and does it create any tension with control performance?
14. What is the gap between the SOP and what your best operator actually does? Where does the institutional knowledge live?
15. If I could give you one tool for your ops floor tomorrow, what would have the biggest impact on your KPIs?

### 3.5 Frontline Process Executive

1. Walk me through your morning. What do you open first, and what does your screen look like at 9:30?
2. Tell me about a difficult case you handled this week. What made it hard, and how did you decide what to do?
3. When you don't know the answer, who do you ask, and how long does it take to get one?
4. What's the most repetitive part of your day, and is there any reason it has to be that way?
5. Tell me about a workaround you use that isn't in the SOP. Why does it exist?
6. When a system is slow or down, what do you do? Walk me through a recent example.
7. What controls do you operate in your role, and which of them feel meaningful versus which feel like box-ticking?
8. Tell me about a time you escalated something. What channel did you use, who picked it up, and what came back?
9. How long have you been in this role, and what did you have to learn from peers that wasn't in your training?
10. If a new joiner asked you "what's the one thing you really need to know that nobody tells you," what would you say?
11. What evidence do you currently capture, and how? Where does it land?
12. When did you last get a piece of feedback or training that changed how you handled a case?
13. Are there moments when you suspect something isn't right but you don't escalate? What stops you?
14. What would make your next case easier?
15. If you left tomorrow, what would your replacement struggle with most in the first month?

---

## 4. Structural Friction Diagnostic Method (M4)

§4 of the foundational document surfaces six structural fault lines: language, ownership, documentation–reality drift, speed–assurance, reactive cycles, and geographic. The analytical framework that produced these is a combination of (a) incentive analysis (who is rewarded for what); (b) time-scale audit (cadences of governance vs. cadences of work); (c) authority-graph mapping (where ownership splits across organisational lines); (d) regulatory inscription analysis (what fault lines are baked into the supervisory architecture); and (e) cross-bank pattern recognition (which frictions recur in every comparable bank).

A genuine structural friction is distinguishable from a solvable process problem by seven tests:

**Test 1 — Incentive triangulation.** If two functions have KPIs that are zero-sum at the margin, the friction is structural. Process owners are rewarded for throughput; compliance officers for the absence of findings. No tool fixes this; the tool can only give them a shared language so they fight better. (This is the speed–assurance friction, §4.4.)

**Test 2 — Time-scale audit.** If the cadences of input and output differ by an order of magnitude or more, the friction is structural. RCSAs are annual; processes change weekly. Annual review of weekly-changing reality is doc-reality drift made permanent. (§4.3, §4.5.)

**Test 3 — Authority-graph test.** If a failure mode requires coordination across more than two organisational boundaries to fix, the friction is structural. The process owner ≠ control owner ≠ control operator ≠ risk owner means a single control failure has four reporting lines that must agree on the diagnosis. (§4.2.)

**Test 4 — Counterfactual budget test.** If you 10x'd the budget for the obvious fix, would the friction disappear? If yes, solvable. If no, structural. More 2LoD headcount does not reconcile principles-based supervision with rules-based controls.

**Test 5 — Regulatory inscription test.** If the friction is encoded in regulation or supervisory expectation, it is structural. 3LoD independence is mandated; you cannot collapse it with better tooling. SMCR personal accountability is statutory.

**Test 6 — Persistent-across-banks test.** If peer banks of similar size and regulator suffer the same friction, it is structural. If only your bank suffers, it is local — usually a process or culture issue.

**Test 7 — Reversibility test.** If removing the friction would remove something the system needs, it is structural. Removing the speed–assurance tension means removing speed or removing assurance; both are unacceptable to one of the legitimate stakeholders.

**To identify structural frictions in a different jurisdiction:**

- Map the formal accountability regime first (SMCR / Heightened Standards / RBI-mandated CRO/CCO). The way responsibility is assigned creates the dominant fault line. SMCR makes evidence personal — "I took reasonable steps" — and creates a friction the US version does not produce to the same degree.
- Read the regulator's last 36 months of enforcement actions, Dear CEO letters, supervisory statements, and skilled-persons reports. Recurring categories are structural fault lines visible from the supervisor's seat.
- Inventory the standing inter-functional disputes inside banks. Where the same argument has been live for >2 years across multiple banks, it is structural.
- Map the supervisory style (rules-based / principles-based / inspection-driven). Each style produces a different time-scale and evidence-style friction.
- Identify the "compliance moment of truth" — the event the institution dreads. The structure of that event reverse-engineers the structural fault lines (US: examination cycle; UK: Skilled Persons Review (s.166); India: on-site inspection).

---

## 5. RCM Column Architecture Analysis (M5)

The Controls master sheet has 25 columns. Each is a deliberate design decision; each answers a specific question, has a specific data source, and would lose something specific if dropped.

**1. Control ID.** *Decision:* Is this the same control I referred to in the last cycle? Across systems, can I stitch evidence to a control unambiguously? *Data source:* GRC inventory, control register, platform's own canonical store. *Lost if absent:* Every join breaks; lineage collapses; cross-cycle comparisons impossible; no stable hook for evidence, KRIs, issues, obligations.

**2. Process.** *Decision:* Where in the bank does this live, and which process owner is accountable? *Data source:* Process taxonomy maintained by 1LoD with 2LoD challenge. *Lost if absent:* Process Owner persona has no aggregation; the platform cannot answer "show me all controls in Wire Payments."

**3. Sub-Process.** *Decision:* Where exactly within the process does this fire — which step, which sub-activity? *Data source:* Process map / procedure documentation. *Lost if absent:* Cannot localise friction; cannot connect a control instance to a specific step execution; root-cause analysis loses precision.

**4. Risk Domain.** *Decision:* Which entry in the firm's risk universe does this belong to? *Data source:* Enterprise Risk Management Framework, risk taxonomy. *Lost if absent:* CRO loses domain aggregation; risk appetite breaches cannot be tied back to underlying controls; cross-process patterns within a domain become invisible. (The US RCM is heavily weighted to Financial Crime — 22 of 60 controls — which is itself a finding about where the perceived risk concentration sits.)

**5. Control Title.** *Decision:* What is this control in plain language a non-specialist can recognise? *Data source:* Control inventory; product of human design. *Lost if absent:* Human readability collapses; controls become anonymous IDs.

**6. Control Description.** *Decision:* What does this control actually do, when, how, and on what triggering event? *Data source:* Control design document, SOP, vendor configuration. *Lost if absent:* The control is unboundable — auditors cannot test it, operators cannot run it, automation cannot recognise its firing condition.

**7. Control Type (Preventive / Detective / Corrective).** *Decision:* Is this blocking the risk before it occurs, finding it after, or correcting it after the fact? *Data source:* Control taxonomy applied during design. *Lost if absent:* Coverage profile invisible — a process with all detectives and no preventives is fragile; a process with all preventives and no detectives cannot validate that the preventives worked. (In the US RCM, the 37/18/5 P/D/C split is itself diagnostic of a defensive-prevention posture.)

**8. Control Nature (Manual / Automated / ITDM).** *Decision:* Is this enforced by code, by people, or by IT-dependent manual? *Data source:* Control documentation, walkthrough. *Lost if absent:* Automation prioritisation impossible; cannot diagnose ITDM dependency risk (the manual step that depends on a system feature that may change); cannot scope evidence-collection automation. (32 Manual / 17 ITDM / 11 Automated in the US RCM is itself a maturity signal.)

**9. Control Frequency.** *Decision:* How often does this control operate — per event, daily, monthly, annually? *Data source:* Control design, process telemetry. *Lost if absent:* Cannot reason about evidence volume, sample sizes, or stale-test risk; population testing cannot be sized.

**10. Risk ID.** *Decision:* Which risk in the register does this mitigate? *Data source:* Risk register. *Lost if absent:* The Obligation → Risk → Control chain breaks; cannot demonstrate that the control set covers the risk universe.

**11. Risk Description.** *Decision:* What is the cached human-readable description so I don't have to look up the Risk ID? *Data source:* Risk register (cached). *Lost if absent:* Readability without lookup; a minor functional cost but real UX cost on dense tables.

**12. Inherent Risk.** *Decision:* How bad is this risk if no controls existed? *Data source:* Risk assessment process. *Lost if absent:* Cannot demonstrate the value the control adds; cannot prioritise control investment; cannot stratify the population by risk weight. (41 High / 19 Medium in the US RCM signals a deliberate selection of meaningful controls only.)

**13. Residual Risk.** *Decision:* How bad is this risk after controls operate? *Data source:* Risk assessment process, informed by control effectiveness. *Lost if absent:* Cannot demonstrate effectiveness; cannot show appetite alignment; CRO loses the quantitative backbone of the cockpit view. (30 Low / 30 Medium / 0 High residual is the defensible posture — no residual high-risk control means no obvious appetite breach.)

**14. Obligation IDs.** *Decision:* Which laws, rules, or supervisory expectations does this control satisfy? *Data source:* Obligation register, regulatory mapping exercise. *Lost if absent:* Cannot demonstrate compliance to the regulator; regulatory change impact analysis impossible (when a rule changes, you cannot find affected controls); the entire top-down regulator-view collapses.

**15. Control Owner (1LoD).** *Decision:* Who is the accountable executive in the first line? *Data source:* Org chart, control inventory. *Lost if absent:* SMCR / Heightened Standards / RBI accountability traceability fails; finger-pointing during incidents; no defensible answer to "who is responsible."

**16. Control Operator.** *Decision:* Who or what (team or system) actually runs this control day-to-day? *Data source:* Operations register, HRMS, system inventory. *Lost if absent:* Cannot route alerts; when a control fires wrongly, cannot diagnose which operator/system to investigate; SoD analysis fails.

**17. 2LoD Oversight.** *Decision:* Which 2LoD function provides independent challenge? *Data source:* 2LoD coverage plan. *Lost if absent:* Cannot demonstrate independence; findings have nowhere to route; the orthogonal 3LoD view collapses.

**18. 3LoD Audit Cycle.** *Decision:* When will Internal Audit cover this control? *Data source:* Internal Audit plan. *Lost if absent:* Cannot demonstrate assurance coverage to the regulator; cannot identify controls that have been un-audited beyond risk-based tolerance.

**19. Evidence Source.** *Decision:* Where does proof of operation live — which system, which log, which artifact? *Data source:* Control design, audit working papers. *Lost if absent:* The 60–70% audit time consumed by evidence chase (per §3.3) cannot be reduced; ambient evidence becomes impossible because there is no canonical pointer.

**20. Testing Approach.** *Decision:* How is effectiveness tested — sample size, methodology, frequency? *Data source:* Testing plan, audit methodology. *Lost if absent:* Cannot reproduce the test; cannot automate it; the regulator cannot evaluate test rigor.

**21. Last Tested.** *Decision:* Is the last test current enough to rely on? *Data source:* Testing log. *Lost if absent:* Stale-test risk becomes invisible; cannot prioritise testing schedule.

**22. Last Test Result.** *Decision:* Did this control pass its most recent test? *Data source:* Testing log. *Lost if absent:* Cannot prioritise focus; cannot calibrate residual risk against actual testing outcomes. (41 Effective / 14 Effective with Observations / 5 Needs Improvement / 0 Ineffective in the US RCM is the realistic-but-defensible distribution; an "all green" sheet would be non-credible to a senior reviewer.)

**23. Linked KRI IDs.** *Decision:* Is there a leading indicator that would warn me before this control fails? *Data source:* KRI register. *Lost if absent:* The continuous-signal layer disconnects from the control universe; CROs and Heads of Compliance lose the early-warning grammar.

**24. Open Issue IDs.** *Decision:* Are there known gaps under remediation against this control? *Data source:* Issues / actions register. *Lost if absent:* Cannot show the control is actively in remediation; cannot prevent a regulator finding that "you knew about this and did nothing."

**25. Status (Active / Retired / Pending).** *Decision:* Is this control even live right now? *Data source:* Control inventory governance. *Lost if absent:* Zombies — retired controls remain in the RCM forever; cannot distinguish current state from historical record.

The integrity of the column architecture rests on the principle that every column is either an *identifier* (1, 10, 14, 23, 24), a *description* (5, 6, 11), a *taxonomic classification* (2, 3, 4, 7, 8, 9, 25), an *ownership/accountability* attribute (15, 16, 17, 18), an *empirical signal* (19, 20, 21, 22), or a *risk-weighting* attribute (12, 13). No column is decorative; each carries a specific information role. The companion Schema sheet declares all 25 as the canonical contract for downstream JSON Schema and DDL generation, with required-flags and enum vocabularies normative.

---

## 6. Operational Reality vs. Textbook — Research Guard (M6)

The textbook view of regulation describes obligations as written. The operational view describes how those obligations live in the bank — what they look like in workflows, in screens, in queues, in arguments between functions, in the 60–70% of audit time spent chasing evidence. A textbook-level researcher would describe BSA/AML CIP as "verify identity at account opening." An operational-level researcher would describe the actual stack of LexisNexis or Refinitiv, the eKYC/CKYCR for India retail, the electronic ID&V vendor for UK, the manual override workflow for non-resident customers, the Excel that bridges the screening tool and the case management system, the offshore captive's documentation standards, and the recurring audit observation that document expiry monitoring is the most fragile sub-control.

To capture operational reality rather than textbook reality, a researcher must enforce five discipline rules:

**The "show, don't tell" rule.** Every claim must trace back to an artifact — a system log, an email, a case, a screenshot, a sample of records. Generic descriptions ("we screen all wires") are textbook signals. Concrete descriptions ("on Tuesday, screening hits 3 and 47 routed to investigator A whose disposition rate is 82%") are operational signals. Insist on artifact-grounded claims.

**The "last 30 days" rule.** Questions are posed in the past 30 days, not "in general." "What did you do last Tuesday afternoon?" produces operational answers. "How do you handle exceptions?" produces SOP answers.

**The "where's the Excel?" rule.** Always ask what intermediate spreadsheet, manual register, or copy-paste step exists between any two systems. The presence of an Excel in any control flow is one of the most reliable signals of documentation drift; the textbook description will not contain it.

**The "who pushes back?" rule.** Identify the friction with adjacent functions to expose where reality diverges from policy. If nobody pushes back on the control, either the control is genuinely well-designed or the dissent has been suppressed; both are diagnostically interesting.

**The "first day on the job" rule.** Ask a recent joiner what they had to learn from a peer that wasn't in their training. The gap between formal training and peer-transmitted knowledge is the operational reality.

A second-order discipline is **cross-source triangulation**: any operational claim must survive at least two of the following sources: SME interview, frontline interview, system telemetry, audit finding, recent population sample. A claim from a single source is provisional.

The platform itself encodes this guard: §6.1 states process is the spine, and documented process is a *reconciliation target, not a source of truth.* The operational discipline is made architectural in the data model — the design-time `Process` is separate from the run-time `ProcessExecution`, and the latter is sourced from system telemetry, not SOPs.

---

## 7. Universal vs. Jurisdiction-Specific Framework Elements (M7)

| Universal Framework Elements (hold across US/UK/India) | Must Be Re-Researched Per Jurisdiction |
|---|---|
| The Process / Control / Compliance ontology (§1) | The full obligation register: regulators, citations, atomic requirements |
| The conceptual stack: Regulation → Obligation → Risk → Control → Process → Activity (§2.1) | The supervisory style (rules-based vs. principles-based vs. inspection-driven) |
| The bottom-up failure propagation chain (§2.2) | The accountability regime (SMCR vs. Heightened Standards vs. RBI-mandated CRO/CCO) |
| The 3LoD orthogonal view (§2.3) | The "compliance moment of truth" event (exam vs. s.166 vs. on-site inspection) |
| The five personas and their cognitive frames (§3) | Persona-specific fears (UK SMCR personal liability creates fears the US version does not) |
| The six structural friction categories (§4) | Specific manifestation of each friction (geographic friction differs by global footprint) |
| The universal current-state problems — latency, fragmentation, manual evidence, linkage gap, issue decay, talent fragility (§5.1) | Jurisdiction-specific aggravators (CCAR/DFAST in US, Operational Resilience PS21/3 in UK, RBS in India) |
| The eight design principles — process is spine; control as observable state; evidence by default; one ontology many lenses; continuous; explainability; action over information; jurisdictional overlay (§6.1) | Local FMIs, payment infrastructures, product-specific regulation (Fedwire vs. CHAPS/Faster Payments vs. NEFT/RTGS; HMDA vs. UK mortgage market study vs. RBI digital lending guidelines) |
| The data-model entities — Control, Risk, Obligation, KRI, Issue, Process, Person/System, Action — with design-time / run-time separation (§6.2) | Jurisdiction-specific obligation atomicity (a US BSA CIP rule decomposes differently from UK MLR 2017 reg 28) |
| The AI capability tiering — Tier 1 (process mining, control reconciliation, regulatory mapping); Tier 2 (effectiveness analytics, anomaly detection, predictive indicators, change impact); Tier 3 (audit automation, conversational analyst, issue triage, in-flow agent) (§6.3) | KRIs that actually matter to the local supervisor (Late SAR % in US ≠ MI/breach reporting in UK ≠ FIU-IND filing cadence in India) |
| The required AI guardrails — lineage, human-in-the-loop, model governance, calibration, drift monitoring (§6.4) | Risk appetite metrics (regulator-shaped — Consumer Duty outcome metrics in UK have no US equivalent) |
| The 25-column RCM master schema | Some control titles, descriptions, frequencies, thresholds (callback thresholds, sanctions list cadences, EDD criteria differ) |
| The persona-by-view requirement: same data, different lenses; two-click rule to root cause; consistency of facts across personas | The specific control population (which controls exist depends on what regulators require and which products the bank offers) |
| The ID-convention pattern (`<PROC>-CNNN`, `R-<DOMAIN>-NNN`, `OBL-<SOURCE>-NNN`, etc.) | The local issue-source taxonomy (UK adds Skilled Persons, MI breach; India adds RBI inspection, FIU-IND query) |
| The schema-as-contract principle for downstream artifacts (JSON Schema, DDL, API, UI bindings) | The list of obligation source acronyms (US: BSA, OFAC, FFIEC, Reg B/C/X/Z, SR 11-7, OCC 2023-17, SOX, UCC4A, GLBA, FCRA, FHA, ECOA, UDAAP, FATCA. UK and India: entirely different sets) |

---

## 8. UK Research Execution Plan (M8)

The UK version of this research must produce: a UK-equivalent foundational document and a UK-equivalent RCM (markdown + XLSX). The plan below assumes no existing UK content, only the universal framework and the discipline established above.

### Activity 1 — UK regulatory landscape mapping (Weeks 1–2)
*Goal:* Build the canonical obligation register for a mid-sized UK bank.
*Sources:* FCA Handbook (PRIN, SYSC, COND, BCOBS, COBS, MAR, FCG, DISP); PRA Rulebook (Operational Resilience, Outsourcing, Senior Managers, Conduct Rules, Risk Control); Bank of England OpRes — PS21/3 + SS1/21 + SS2/21; FCA Consumer Duty PS22/9 and Dear CEO letters since 2022; SM&CR sourcebook (FCA SYSC 25–28, PRA SS28/15); Financial Services and Markets Act 2000 + 2023 amendments; Money Laundering Regulations 2017 (and 2022 amendments); JMLSG Guidance; OFSI sanctions guidance; UK GDPR + DPA 2018; Payment Services Regulations 2017; ICO guidance for data; HMRC guidance for FATCA / CRS; FOS rulings as conduct interpretation evidence; published skilled-persons reports; FCA / PRA final notices since 2022.
*Successful output:* 80–120 atomic UK obligations, each with stable ID, source, citation, plain-English atomic requirement, jurisdiction = UK, intended control linkage candidates. Format identical to the US Obligations sheet.
*Risks:* Consumer Duty interpretation is contested and moving. *Mitigation:* time-stamp every Consumer Duty obligation; cross-check against ≥3 published bank or law-firm interpretations.

### Activity 2 — Supervisory expectation forensics (Weeks 2–3, parallel to Activity 1)
*Goal:* Capture how the FCA and PRA actually behave in supervision, not just what the rulebook says.
*Sources:* Final notices and enforcement decisions 2022–present; published Skilled Persons (s.166) thematic reports; Dear CEO letters; PRA / FCA Annual Reports and Business Plans; regulatory speeches by named SMFs (very informative for principles-based interpretation); supervisory priorities papers; FCA Portfolio Letters; published thematic reviews; FCA Business Plan and PRA Annual Report priorities.
*Successful output:* A "supervisory style brief" summarising current FCA/PRA hot zones (likely areas: Consumer Duty outcomes, OpRes severe-but-plausible scenarios, financial promotions, AI/ML in credit, vulnerable customers, market integrity); the "compliance moment of truth" mechanics for the UK.
*Risks:* US-thinking contamination. *Mitigation:* explicit anti-translation discipline — produce this brief before re-reading the US foundational document.

### Activity 3 — UK accountability regime mapping (Week 3)
*Goal:* Map SM&CR mechanics in operational detail. SMFs, Certified Persons, Conduct Rules; Statements of Responsibility; Reasonable Steps doctrine; the burden-of-proof shift since 2016 implementation; the 2023 senior manager regime review.
*Sources:* PRA SS28/15 + FCA SYSC 25–28; Linklaters / Slaughter and May / Clifford Chance / Norton Rose Fulbright commentary; recent SMF enforcement actions; Dear CEO letters explicitly invoking SMCR; bank disclosures of Statements of Responsibility.
*Successful output:* A mapping of SMF roles to RCM control owner candidates; an explicit articulation of how "I took reasonable steps" shapes evidence requirements; a list of specific evidence categories an SMF would produce in defence.
*Risks:* SMCR documentation is dense and easy to misread. *Mitigation:* validate with at least one practising SMF or Compliance head in interview.

### Activity 4 — UK process anchoring (Week 4)
*Goal:* Confirm or revise the six anchor processes for a UK mid-sized bank. The US choice was Wire Payments, Customer Onboarding, AML Alert Disposition, Vendor Onboarding, Model Validation, Loan Origination. UK candidates likely include: CHAPS / Faster Payments, Customer Onboarding (electronic ID&V centric), Financial Crime Alert Disposition, Outsourcing / TPRM (under PRA SS2/21), Model Risk Management (under PRA SS1/23), Mortgage Origination — *plus* a strong case for replacing or supplementing with Consumer Duty Fair Value Assessment and OpRes Important Business Service mapping as candidate processes.
*Sources:* Peer UK mid-sized bank disclosure (Annual Reports, Pillar 3); FCA thematic findings; conversations with UK practitioners; PRA mid-sized bank supervisory frameworks.
*Successful output:* Final list of six UK anchor processes with rationale for inclusion of each (cross-domain coverage, regulatory visibility, MVP suitability).
*Risks:* Lazy translation from US. *Mitigation:* explicit test for each US process — does it carry the same regulatory weight in UK? If not, replace.

### Activity 5 — UK persona deep-dives (Weeks 4–6)
*Goal:* Re-interview the five personas in UK context using the §3 guides above, adapted for UK accountability and supervisory style.
*Sources:* Practising UK CRO, Head of Compliance / FinCrime, internal auditor, payment ops lead, frontline KYC analyst from a UK mid-sized bank or building society. Minimum 2 of each persona to triangulate.
*Successful output:* Persona narratives revised for UK fears, instruments, and intolerable product behaviours; specifically the SMCR-driven "personal evidence" pressure on CROs and Heads of Compliance, the Consumer Duty outcomes pressure on Process Owners.
*Risks:* Senior practitioner access. *Mitigation:* multi-channel sourcing (alumni networks, professional bodies — IRM, CISI, ICA, CIB, ACAMS — headhunters, board-search firms, retired SMF advisors).

### Activity 6 — UK structural friction mapping (Week 6)
*Goal:* Apply the seven-test diagnostic from §4 to UK context. Likely outputs: SM&CR creates a personal-evidence friction the US version does not have; Consumer Duty creates an outcomes-evidencing friction with no US equivalent; OpRes creates an Important Business Service mapping friction.
*Sources:* Output of Activities 2, 3, 5.
*Successful output:* Six structural frictions for UK, each with manifestation example, peer-bank verification, regulatory inscription evidence.

### Activity 7 — UK RCM build (Weeks 6–8)
*Goal:* Produce the UK RCM markdown + XLSX, identical structure to US, with UK-native content. 60 controls (10 per process) across 6 anchor processes; UK Risk register; UK Obligation register from Activity 1; UK KRIs (with thresholds tuned to UK supervisory expectations); sample UK Issues; UK Risk Appetite metrics.
*Sources:* All prior activities + UK practitioner validation.
*Successful output:* `RCM_Baseline_MidSized_UKBankv1.md` + `.xlsx` with parity to the US baseline; ingestion-ready for downstream chats. Same 25-column schema, same enum vocabularies, same ID-convention pattern.

### Activity 8 — UK foundational document write-up (Week 8)
*Goal:* Produce the UK-equivalent of the foundational document. Same six-section structure, UK-native content. Section 5.3 (UK aggravators) is most extensively re-written; Section 1.3 compliance-table column for UK is materially expanded; all examples substituted with UK examples (CHAPS instead of Fedwire; FCA/PRA in place of OCC/Fed; s.166 in place of MRA/MRIA; Consumer Duty as the conduct moment).
*Sources:* All prior activities.
*Successful output:* `Foundational_Understanding_UK.md`, parity with US version, ingestion-ready.

### Critical path
- Activity 1 blocks Activities 7 and 8.
- Activities 2 and 3 block Activity 5 (persona deep-dives need accountability-regime context).
- Activity 5 blocks Activity 6 (frictions need persona evidence).
- Activity 4 blocks Activity 7 (process anchors must be set before control content).
- Activities 1–6 all block Activity 8.

### Risks and mitigations
1. **US-thinking contamination.** Mitigation: explicit anti-translation discipline. Build UK obligation register from UK regulators *first*; only later cross-check against US RCM for parallel/divergence.
2. **Consumer Duty staleness.** Mitigation: snapshot-date every Consumer Duty obligation; assume content has 6-month half-life; revisit before final lock.
3. **OpRes interpretation variance.** Mitigation: validate Important Business Service mapping logic with ≥2 published UK bank disclosures and 1 practitioner.
4. **SMF access.** Mitigation: recruit through professional bodies; offer anonymity; have second-best interviewees ready (recently retired SMFs, ex-SMF consultants, bank General Counsel).
5. **RCM control population gaps.** Mitigation: cross-check final 60 controls against published FCA thematic findings — if a recurring finding has no corresponding control, the RCM is incomplete.
6. **Time-scale slippage.** Mitigation: Activities 1, 2, 3 run in parallel; persona deep-dives begin Week 4 with Activities 1–3 outputs as input, even if those are still in draft.
7. **Lazy translation of US persona guides without UK adaptation.** Mitigation: for each persona, add 3–5 UK-specific questions before the interview (SMCR reasonable-steps probe for CRO; Consumer Duty outcomes probe for Compliance Head; OpRes scenario-test probe for Process Owner; vulnerable-customer probe for Frontline).
8. **Confusing UK ring-fenced vs non-ring-fenced banking.** Mitigation: be explicit at the outset which population we are profiling (the US baseline is a $10–50B commercial bank; the UK equivalent is closer to a Tier-2 UK bank, building society, or mid-tier domestic banking subsidiary; decide and document).

### Definition of done
- 80+ UK obligations with citations, atomic statements, control-linkage candidates
- 60 UK controls with full 25-column attribute set
- 6 UK anchor processes with stated rationale
- 5 UK persona narratives with operational examples and quoted (anonymised) practitioner inputs
- 6 UK structural frictions with diagnostic evidence (which test/s pass; cross-bank verification)
- UK foundational document with parity to US version (six sections, same internal logic)
- All artifacts ingestion-ready for downstream chats — stable IDs, schema-as-contract, multi-value cells `;`-delimited, dates ISO 8601, enums respected

---

## Self-check verification (per the brief)

- [x] Read all three files (foundational text in full, US RCM markdown including TOC and ingestion notes, US RCM XLSX across all 14 sheets including Schema, Controls, Risks, Obligations, KRIs, Issues, RiskAppetite, README, and the six per-process filtered views).
- [x] RCM column analysis covers every column in the master Controls sheet (all 25 columns).
- [x] UK Research Execution Plan specifies sequence, sources, success criteria, critical path, risks, mitigations, and a definition of done — actionable without further clarification.
- [x] Universal vs. jurisdiction-specific table is grounded in observed document content (the US-only obligation taxonomy, the §5 jurisdictional aggravators, the §1.3 supervisory-style table) — not in assumption.
- [x] A senior banking compliance professional should find this credible: language is operationally accurate (RCSA cycles, MRA/MRIA, s.166, SOR, IBS mapping, OpRes severe-but-plausible scenarios, UCC4A, BSA CIP, OFAC SDN, CCAR/DFAST), the diagnostic tests are tight, and the research plan is practitioner-realistic.

_End of Pass 1 output. Pass 2 should treat Activity 1 (UK obligation register) and Activity 3 (SM&CR mechanics) as the entry points; Activity 8 (UK foundational write-up) is the converging deliverable._
