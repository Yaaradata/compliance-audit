# ORI — Business concepts & screen guide (Indian banking)

> **Operational Risk Intelligence (ORI)** is a unified operational-risk management workspace built for **Indian private-sector banks**. It pulls **risk posture, controls, evidence, incidents, root cause analyses, regulatory clocks, and supervisory packs** into one cohesive narrative so leadership, second-line teams, and assurance teams stop working from email attachments, spreadsheets, and disjointed tools.

**Audience:**
- Board / Risk Committee members
- Chief Risk Officer (CRO), Chief Compliance Officer (CCO), Head of Operational Risk Management (Head of ORM)
- Money Laundering Reporting Officer (MLRO), Head of Financial Crime (Head of FC)
- VP / Manager Operational Risk Management (assurance / 2LoD challenge)
- Internal Audit (3LoD) and concurrent auditors who need to consume risk artefacts
- Anyone learning the **operational risk** story without reading source code

**How to use this document:**
1. **Read Section 1 (master glossary)** once — it explains every abbreviation that appears anywhere else.
2. Read **Section 2 (foundational concepts)** to understand the way the bank, the regulator, and ORI think about risk.
3. Use **Sections 3 onward** as a screen-by-screen guide. Each screen answers:
   - *What concept does this represent?*
   - *Why does this screen exist as a separate page?*
   - *Why is this screen built primarily for this persona?*
   - *What is on the screen, and why is each element there?*
   - *What business questions does it answer?*
   - *Which abbreviations show up here?*

---

# 1. Master glossary — abbreviations and short forms

| Short form | Full term | Plain meaning, used in ORI context |
|------------|-----------|-------------------------------------|
| **ORI** | Operational Risk Intelligence | This product. The single platform that unifies posture, evidence, incidents, RCA, regulatory readiness for an Indian bank. |
| **ORM** | Operational Risk Management | The bank function/discipline that manages risks of loss from failed people, processes, systems, or external events (different from credit or market risk). |
| **1LoD** | First line of defence | Business and operations teams that **own and run** the processes and controls (e.g. branch operations, payments ops). |
| **2LoD** | Second line of defence | Independent **risk, compliance, ORM, financial crime** functions that *challenge* and oversee 1LoD without running their work. |
| **3LoD** | Third line of defence | **Internal audit / independent assurance** — gives the Board an objective view of whether 1LoD and 2LoD are doing their jobs. |
| **CRO** | Chief Risk Officer | Apex risk owner. Presents enterprise risk posture to Board, regulator, sometimes Managing Director / CEO. |
| **MD & CEO** | Managing Director and Chief Executive Officer | Top executive; consumes ORM posture for strategic decisions and supervisory dialogue. |
| **CCO** | Chief Compliance Officer | Owns regulatory compliance (RBI master directions, PMLA, FEMA, etc.) and conduct compliance. |
| **MLRO** | Money Laundering Reporting Officer | Accountable for PMLA / anti–money laundering programme; files STRs to FIU-IND. |
| **MLRO-PO** | MLRO — Principal Officer | RBI/PMLA recognised principal officer designation in many Indian banks. |
| **Head of FC / FCC** | Head of Financial Crime / Financial Crime Compliance | Runs AML, sanctions, fraud, bribery / corruption programmes under MLRO and CCO. |
| **Head of ORM** | Head of Operational Risk Management | Senior-most ORM owner inside 2LoD; chairs or secretariats ORM committees. |
| **VP-ORM** | Vice President — Operational Risk Management | Operating / managerial ORM role; in ORI also the persona used for **control testers** doing independent reperformance. |
| **BRMC** | Board Risk Management Committee | Board-level committee; receives the periodic risk posture pack and sets appetite. |
| **ORMC** | Operational Risk Management Committee | Management-level ORM committee that decides on RCAs, PAs, escalations between board meetings. |
| **PAC** | Preventive Action Committee | Management governance forum that **approves** material preventive actions and policy or SOP changes. Can be **blocked** if linked preventive actions are still open. |
| **RBI** | Reserve Bank of India | Banking regulator. Issues master directions, conducts inspections, raises MRAs. |
| **AFI** | Annual Financial Inspection | The flagship RBI supervisory event. “Inspection readiness” in ORI mainly refers to AFI plus thematic / on-site reviews. |
| **MRA** | Mandatory Rectification Action | Formal inspection finding from RBI that must be remediated by a deadline. |
| **Section 47A** | Banking Regulation Act, Section 47A | Provision under which RBI can impose monetary penalties; ORI flags issues with potential s.47A exposure. |
| **FIU-IND** | Financial Intelligence Unit — India | Receives STRs, CTRs, NTRs under PMLA. Tracks acknowledgement chain. |
| **PMLA** | Prevention of Money Laundering Act, 2002 | Indian anti-money-laundering law. **Rule 9** (KYC), record-keeping, and reporting rules are frequently cited. |
| **STR** | Suspicious Transaction Report | AML report filed to FIU-IND when a suspicion is concluded. SLA in days drives the clock. |
| **CTR** | Currency Transaction Report | Monthly cash transaction filing to FIU-IND above thresholds. |
| **NTR** | Non-Profit / Cross-border Transaction Report | Other FIU report types in the AML chain. |
| **CKYCR** | Central KYC Records Registry | Centralised KYC repository in India (CERSAI). Banks must upload/refresh KYC. |
| **UCIC** | Unique Customer Identification Code | Bank-wide unique ID for a customer across core banking. |
| **CBS** | Core Banking System | Back-end banking platform (e.g. Finacle, TCS BaNCS) — system of record for many ORM data flows. |
| **LOS** | Loan Origination System | Originates loans; KFS, borrower acceptance, disbursal events are recorded here. |
| **KFS** | Key Fact Statement | RBI Digital Lending Directions mandated borrower disclosure; KFS-after-acceptance is a conduct breach. |
| **DSA** | Direct Selling Agent | Third-party agents who originate loans for banks; subject to outsourcing rules. |
| **BPO / TPSP** | Business Process Outsourcing / Third-Party Service Provider | Outsourced operations vendors; RBI outsourcing guidelines apply (OBL-RBI-OUTSRC-001 etc.). |
| **CIMS** | Centralised Information Management System | RBI’s reporting platform that succeeds older return platforms; ORI tracks CIMS DLA (digital lending) returns. |
| **DLA** | Digital Lending App | Apps under RBI Digital Lending Directions; quarterly disclosures via CIMS. |
| **FMR** | Fraud Monitoring Return | RBI fraud reporting return (14-day rolling). |
| **CRILC** | Central Repository of Information on Large Credits | Monthly large-exposure return to RBI. |
| **CSITE** | Cyber Security and IT Examination | RBI cyber incident reporting expectation (material cyber events). |
| **CERT-In** | Indian Computer Emergency Response Team | National cyber incident response body; 6-hour reporting clock for material incidents. |
| **RCSA** | Risk and Control Self-Assessment | The periodic 1LoD-led, 2LoD-challenged structured review of risks and controls per business unit / cell. |
| **RCA** | Root Cause Analysis | Structured *why* investigation after an incident. Often uses **5-Whys** or **Fishbone (Ishikawa)** methodology. |
| **PA** | Preventive Action | Concrete remediation / change tied to an RCA or issue, with owner and due date. Closing PAs reduces recurrence risk. |
| **LDC** | Loss Data Collection | Discipline of capturing operational loss events (gross, recovery, net) under Basel-aligned taxonomy. |
| **Basel** | Basel Committee on Banking Supervision | Sets the loss event taxonomy (internal fraud, external fraud, EPWS, CPBP, DPA, BDSF, EDPM). |
| **HITL** | Human-in-the-Loop | An AI model can suggest, but a human must accept / reject before action is taken. |
| **KRI** | Key Risk Indicator | Forward-looking metric that warns of risk increase before a loss occurs (e.g. AML alert queue ageing). |
| **KCI** | Key Control Indicator | (Background concept) Operating-rate / catch-rate metrics on a control — these feed CES in ORI. |
| **SLA** | Service Level Agreement | Time / quality threshold a process step is expected to honour. |
| **SOP** | Standard Operating Procedure | Documented procedure; PAC often approves SOP updates. |
| **MOM** | Minutes of Meeting | Audit-trail artefact; missing MOM links are a frequent ORM finding. |
| **SPOC** | Single Point of Contact | Named owner in a department; reviews RCSA cells / RCAs before HoD. |
| **HoD** | Head of Department | Departmental approver of RCSA cycles, RCAs. |
| **SM / SMF** | Senior Manager / Senior Management Function | Named accountable senior person (board-aware accountability concept). |
| **SAES** | Senior Accountability Evidence Score | ORI score (0–100) for the strength of *evidence* an SM has been overseeing scope (attestations, decisions, sign-offs). |
| **RES** | Risk Effectiveness Score | ORI score for *how well the bank is managing residual risk* on a risk in the register. |
| **CES** | Control Effectiveness Score | Composite control score: Operating Rate × 0.40 + Catch Rate × 0.40 + Evidence Completeness × 0.20. |
| **OCS** | Obligation Coverage Score | How completely a regulatory obligation is covered by linked controls. |
| **EIFS** | Evidence Integrity & Freshness Score | Quality, hash integrity, and recency of evidence behind controls. |
| **RTS** | Regulatory Timeliness Score | On-time submission and acknowledgement rate across reporting clocks (STR, CTR, CSITE, FMR, CIMS, etc.). |
| **DCQS** | Data & Correlation Quality Score | Quality of source-to-evidence lineage and matching (orphan records, correlation strength). |
| **PVDS** | Process Variant Drift Score | How much the actually-executed process variant drifts from the documented variant (process-mining concept). |
| **ARS** | Audit / Supervisory Readiness Score | Readiness score for a supervisory pack (RBI AFI, PMLA/FIU, statutory, concurrent, board) — different from CES. |
| **AITES** | AI Trust & Explainability Score | Confidence score for AI-assisted decisions and signals (model risk lens). |
| **AITES Threshold Bands** | — | ORI uses three thresholds: action / review / alert — higher means a model is more autonomous. |
| **MIS** | Management Information System | Internal management reporting pack tabled at ORMC / BRMC. |
| **Appetite** | Risk Appetite | Board-approved thresholds for accepting risk on a metric; breaches are board-relevant. |
| **Lens** | Inspection Lens | A regulatory or audience-specific cut of obligations + evidence (e.g. RBI AFI lens, PMLA/FIU lens). |

---

# 2. Foundational concepts (read before screens)

Before you look at any screen, understand these five concepts. They keep repeating across the product.

### 2.1 The "Three Lines of Defence" model
Indian banks (like all RBI-supervised banks) operate the three-lines model:
- **1LoD** — Business and operations *own* the risk and *run* the controls. They commit losses, they remediate.
- **2LoD** — Risk, compliance, ORM, financial crime functions *set policy, challenge, monitor, and report*. They do not run the trade or the payment.
- **3LoD** — Internal audit *independently assesses* whether 1LoD and 2LoD are doing their jobs.

ORI screens are **persona-scoped** because what a CRO needs to *see* is different from what an ORM analyst needs to *do*, which is different from what an independent tester needs to *verify*. The same data underlies all three; the **lens** differs.

### 2.2 The end-to-end risk chain (the spine of ORI)
A regulation translates downward, and operational reality translates upward:

```
Regulation  →  Obligation  →  Control  →  Process step  →  Evidence
                                                  ↓
                                             Control instance (each time the control runs)
                                                  ↓
                                       Pass / Fail / DataGap / EvidenceGap
                                                  ↓
                              Exception  →  Issue  →  Remediation Action / Incident
                                                  ↓
                                      RCA (root cause)  →  Preventive Action (PA)
                                                  ↓
                               PAC note (governance approval of material PA / SOP change)
```

Plus a parallel chain for **losses** (Basel LDC), **risks** (RES, KRIs), and **regulatory clocks** (STR, CTR, CIMS, FMR).

ORI screens **enter this chain at different points**. The Risk Register starts from risks. The Incident Register starts from events. The Control Universe starts from controls. The Inspection Pack Builder starts from packs. They are all looking at the *same spine* from different angles.

### 2.3 Scores, bands, and what they actually mean
ORI uses several 0–100 style **scores** with **green / amber / red bands**. Two important truths:
- **Each score is independent**. A control with high CES does not automatically mean its obligation has high OCS. Issues can exist on a green-CES control if the issue is about *evidence*, not the control firing.
- **Bands have fixed thresholds** in the UI (typically green ≥ 80 or 85, amber ≥ 60 or 70, else red). **Colour does not move with issue counts** — it moves with the score number. So you can see "green ring" + "non-zero open issues" without a bug.

### 2.4 Lagging vs leading indicators
- **Lagging** indicators are things that already happened: losses, incidents, issues, failed control tests, MRAs.
- **Leading** indicators try to predict: KRIs (queue ageing, breach rates), process drift (PVDS), AI signals, near-miss events.

ORI deliberately surfaces leading indicators on the CRO posture screen so leadership can act *before* a loss is booked.

### 2.5 "Why two statuses on one row?" — incident vs RCA
A frequent confusion: in the Incident Register you may see:
- **Status:** `rca in progress`
- **RCA status:** `Approved`

These are different objects:
- **Incident status** is the *case file* lifecycle (reported → under investigation → rca in progress → remediation in progress → closed).
- **RCA status** is the governance state of the *RCA document* itself (draft → under review → HoD approval → SPOC review → approved).
- The case can stay open after the RCA is signed off because customer remediation, regulatory returns, or PAs are still in flight. RCA approval is necessary but not sufficient for incident closure.

---

# 3. Enterprise ORM Posture (Executive Risk Posture Cockpit)

### 3.1 What this concept means
**Enterprise ORM Posture** is the single executive view of how the bank stands *right now* on operational risk. It combines four kinds of information into one page:

1. **State** — what residual risk looks like across nine risk domains (RES, CES).
2. **Movement** — what changed in the last seven days (KRI breaches, new incidents, overdue PAs).
3. **Governance** — are we filing on time (RTS), are senior managers evidenced (SAES), do we trust our AI (AITES).
4. **Readiness** — could we open a supervisory pack tomorrow (ARS by lens).

Think of this as **the page a CRO would defend at BRMC** or use when an RBI Senior Supervisory Manager calls asking "what's your operational risk posture this week?" — it is **not** a workplace for editing issues or signing off RCAs; it is a decision-support cockpit.

### 3.2 Why this screen exists
- **Board and regulator questions are aggregate.** They want to know: *Are we inside appetite? Where are we hot? What moved? What is stuck?* A flat data extract cannot answer that.
- **Risk is multi-dimensional.** Just looking at "open incidents" misses control health; just looking at "control scores" misses regulatory clocks; just looking at clocks misses senior manager accountability. The cockpit forces a balanced view.
- **It is the single source of truth for the weekly CRO pack.** Without one curated cockpit, CROs build PowerPoints from email attachments, which means risk reporting is **stale, inconsistent, and not regulator-grade**.
- **Deep-link tiles eliminate "tab fatigue".** A regulator question like "show me the three critical incidents this week" is one click from this page into a pre-filtered Incident Register.
- **It enforces narrative.** Six KPIs plus a heatmap force the CRO to think in *categories*, not in lists.

### 3.3 Why this is for the CRO persona
- The **CRO and MD & CEO** are accountable for *enterprise* posture, not workpaper line items. They need **summaries and exceptions**.
- The **Head of ORM / CCO** uses this screen as an **elevator out** when briefing the CRO or board — same numbers, no spreadsheets.
- The **VP-ORM / control tester** does not live here; they live in testing, evidence, and pack builder screens. They may glance at the cockpit for context, but their day is in the assurance area.
- The cockpit is **read-mostly** by design. Drill-into rather than edit-in-place. This matches the CRO's role of *deciding* not *doing*.

### 3.4 What is on the screen, block by block

#### A. KPI strip (six tiles across the top)
| Tile | What it measures | Why it is on the cockpit |
|------|------------------|---------------------------|
| **RES (residual)** | Average Risk Effectiveness Score across all nine risk domains. | Single-number answer to *"how well are we managing residual risk?"* |
| **CES (controls)** | Average Control Effectiveness Score across active controls. | Single-number answer to *"are our controls actually working?"* RES can be okay if compensating controls hold. |
| **KRI breach rate** | Percent of KRIs whose latest observation is amber or red. | Leading indicator — fires *before* losses are booked. |
| **Open incidents (30d)** | Count of incidents discovered in 30 days and not yet closed. | Lagging indicator — operational reality, not opinion. |
| **Overdue preventive actions** | Count of PAs whose status is open and target date has passed. | Tells CRO whether *learning loop is converting to closure* or just paper. |
| **Inspection readiness (ARS)** | Aggregate Audit/Supervisory Readiness Score across packs. | Tells leadership whether they could survive a walk-in inspection. |

Each tile turns **green / amber / red** based on numeric thresholds — never on subjective "feeling".

#### B. Risk Domain Heatmap (9 cards)
- One card per **risk domain** (e.g. Conduct Risk, Credit Risk, Financial Crime, Fraud, Model Risk / AI Governance, Operational Risk, Technology / Cyber, Third Party / Outsourcing, Compliance Risk).
- Each card shows: **domain ID and name**, **average RES**, **trend arrow** (deteriorating / stable / improving), **count of risks** in that domain, **count of open issues** linked, and the **regulatory anchor** (which RBI master direction or law primarily governs that domain).
- **Click a domain card** to drill into one of its risks via the Detail Drawer.

**Why it is built this way:** Risk is *not uniform* across the bank. The heatmap lets a CRO instantly see *concentration*. If Financial Crime is amber and Credit Risk is green, the conversation at BRMC is about financial crime — even though the headline RES might be okay.

#### C. Governance Health (three tiles)
- **RTS (reporting)** — percent on-time across STR, CTR, CSITE, FMR, CIMS, CRILC, UAPA, CERT-In.
- **SAES (senior management)** — average Senior Accountability Evidence Score.
- **AITES (AI trust)** — confidence level in AI-driven decisions.

**Why governance is separated:** A bank can have green RES and CES and still embarrass itself by missing a CTR filing date or by approving AI-flagged transactions without evidence. Governance health is *board-relevant* and *qualitatively different* from control health.

#### D. ORM Heartbeat (three tiles — deep-link shortcuts)
These tiles are **action shortcuts**, not just statistics. Each tile sets a preset on a destination screen.

| Tile | Number shown | Where it goes (deep link) |
|------|--------------|----------------------------|
| **Critical incidents (7d)** | High/critical severity incidents discovered in 7 days. | Opens **Incident Register** filtered to that window. |
| **RCAs awaiting approval** | RCAs in `under_review`, `hod_approval`, `spoc_review`. | Opens **RCA Workspace** with the ORM "awaiting approval" lens applied. |
| **PAC notes blocked** | PAC notes blocked by an open linked PA. | Opens **PAC Note Approvals** with the blocked-only view. |

**Why this exists:** the CRO's question "what needs my attention this week?" gets a literal three-tile answer. No further filtering needed.

#### E. Reporting Clocks · at-risk (conditional banner)
- Appears only when reporting clocks are flagged at-risk.
- Lists the clock label (e.g. "CTR by 15th of next month"), clock ID, and deadline spec.

**Why a separate panel:** clocks are *time-bombs* that can detonate while the rest of the bank is calm. Surfacing them next to scores prevents a "we missed CTR because the dashboard looked green" embarrassment.

#### F. Issue Watchlist (top 5)
- Top 5 open issues ranked by **severity × ageing + RBI MRA flag** weighting.
- Columns: issue title and ID, **linked control**, **owner senior manager**, severity, age in days.
- **RBI MRA chip** and **s.47A exposure chip** highlight regulator-facing risk.
- Click any row to open the issue drawer.

**Why exactly 5:** leadership cannot read 500 issues. Top-5-by-importance gives the CRO the *exception list that could become supervisory or reputational*.

#### G. Supervisory Readiness panel (right column)
- One row per **inspection lens** (RBI AFI Readiness, RBS/SPARC Readiness, PMLA / FIU Evidence Readiness, ITGRCA / CSITE / CERT-In Readiness, Concurrent Audit Readiness, Statutory Audit Readiness, Board / Audit Committee Pack Readiness).
- Each row shows the lens label, count of packs in that lens, and an **ARS ring** (green / amber / red on the 85 / 70 threshold).
- Click a row to open the underlying audit pack.

**Why it is here on the cockpit:** the CRO must know *which supervisory storyline is weakest* before a walk-in. Inspection readiness is not just "ARS = 80, all good" — it is *which lens? which pack? which gap?*

#### H. Senior Accountability snapshot
- Compact cards for the top six senior managers: name, role, **SAES ring**, count of open issues where they are the *accountable* owner.
- Click a card to open the senior manager drawer.

**Why next to issues:** ties **issues** to **people**. RBI's accountability expectations are explicit; "this risk exists, who owns it?" must always have an answer.

#### I. AI / Predictive Signals (this week)
- 4 most recent **pending** AI signals (i.e. awaiting HITL adjudication).
- Each card shows: signal ID, signal class (drift, anomaly, coverage gap, effectiveness decay), confidence %, title.
- Click to open the AI insight drawer; "Review queue" link goes to the full HITL queue.

**Why on the cockpit:** AI signals can detect deterioration in real time that traditional KRIs miss (especially process drift and model decay). Putting them on the cockpit *forces* the CRO to acknowledge model-driven risk — not bury it inside an "AI dashboard".

### 3.5 Business questions this screen answers
- "Are we inside operational risk appetite right now?"
- "Which risk domain is hottest, and is it getting worse?"
- "What broke this week that the Board needs to know about?"
- "Could we survive an RBI walk-in this week?"
- "Who is the accountable senior manager when this risk materialises?"
- "Are we filing regulatory returns on time?"
- "What is the AI telling us that the dashboards aren't?"

### 3.6 Abbreviations on this screen
RES, CES, KRI, ARS, RTS, SAES, AITES, ORM, RCA, PA, PAC, RBI, MRA, s.47A, STR, CTR, CSITE, FMR, CIMS, CRILC, UAPA, CERT-In, BRMC, MD & CEO, HITL.

---

# 4. What Changed This Week

### 4.1 What this concept means
While the **Posture** screen answers *"where are we?"*, this screen answers *"what moved in the last seven days?"*. It is the **weekly delta** view across the entire ORM universe: new issues, control failures, AI signals, KRI band changes, appetite breaches, reporting clocks under stress, new incidents, preventive actions closed, PAC decisions taken.

This is the screen the CRO opens **Monday morning** to know what to say in the Tuesday risk committee, and the screen the Head of ORM uses to draft the weekly narrative email to MD & CEO.

### 4.2 Why this screen exists
- **Boards do not want a static snapshot every week — they want a story of movement.** "What changed?" is a more useful question than "what is the level?" for steering decisions.
- **Movement is where new exposures live.** A KRI that moved green → amber is *more interesting* than a KRI that has been amber for three months.
- **It enforces a closed loop.** Putting PA closures and PAC outcomes alongside new issues lets leadership see whether the bank is *converting* problems into closures, or just piling them up.
- **The "auto-drafted narrative" supports BRMC packs.** A human-editable AI summary at the bottom of the page accelerates pack preparation without compromising governance — the CRO still owns and edits the narrative.

### 4.3 Why this is for the CRO and Head of ORM
- **CRO (primary):** Needs the weekly story for committee and for the MD & CEO huddle. Cannot waste time assembling it from five tools.
- **Head of ORM (primary):** Drafts the bank's official ORM weekly. Uses this screen as the assembly line, edits the narrative, sends.
- **Audit committee secretary (secondary):** Reuses parts of this view for the audit committee one week later.
- **Tester / VP-ORM:** Not the audience. Their cadence is by control, not by week.

### 4.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Summary strip** (top) | Clickable summary tiles: "New incidents this week", "PAs closed this week", "PAC notes processed this week" with counts. | One-line summary of the bank's *operational tempo*. |
| **Inline summary detail** | When a summary tile is selected, an inline list expands beneath showing the actual rows (incidents / PAs / PAC notes). | Avoids redirecting the user away from the weekly view. |
| **New Issues lane** | Recent issues with severity badge, opened-date, title, ID, and links to drawer. | Frames the week's *new ORM workload*. |
| **Failing Control Instances lane** | Control instances with outcome = Fail. | Shows *operational reality* — controls that did not fire / catch correctly. |
| **AI / Predictive Signals lane** | 4 most recent fired AI insights. | Surfaces *model-detected* deterioration in addition to human-reported issues. |
| **KRI band changes lane** | KRIs whose latest observation changed band vs the previous. | The leading-indicator equivalent of "new issues". |
| **Appetite breaches lane** | Appetite metrics in amber or red bands. | Board-relevant: appetite breach is a Board-defined threshold, not an ORM threshold. |
| **Reporting Clocks under stress** | Clocks in `at_risk` or `breached`. | Regulatory time-bombs separated for visibility. |
| **Auto-drafted weekly narrative** | An AI-generated short paragraph summarising the week's posture (ARS, themes, recommended focus) — human-editable before BRMC. | Reduces drafting time without removing the CRO's editorial control. |

### 4.5 Business questions this screen answers
- "What is new this week that wasn't there last week?"
- "Are we closing more PAs than we are opening?"
- "Are any KRIs deteriorating now (not last quarter)?"
- "Which clocks are about to breach?"
- "Did PAC approve, conditionally approve, or reject anything material this week?"
- "What story should we tell at BRMC this week?"

### 4.6 Abbreviations on this screen
KRI, ORM, PA, PAC, BRMC, RCA (referenced), ARS, AI, HITL.

---

# 5. Supervisory Readiness Pack (Inspection Readiness)

### 5.1 What this concept means
**Inspection readiness** is the bank's ability to walk into a supervisory engagement (RBI AFI, RBS/SPARC, concurrent audit, statutory audit, ITGRCA / CSITE / CERT-In cyber review, PMLA/FIU thematic, Board pack) and **defend the operational risk story with evidence**, on demand, with everything traceable.

An **inspection lens** is one of those supervisory viewpoints. A **readiness pack** (or audit pack) is the bundle of workpapers, evidence records, attestations, decisions, and issues that would be presented under that lens.

### 5.2 Why this screen exists
- **Indian banks are inspected.** RBI AFI is the flagship event; cyber and AML thematic reviews are increasingly common; concurrent and statutory audits run all the time. Banks that "prepare for inspection a month before" get caught with stale or missing evidence.
- **Different audiences want different stories.** The same control might appear in three packs. ARS calculated per lens lets the CRO see *which lens is weakest* rather than averaging into a meaningless single score.
- **Gaps need to be closeable, not just visible.** Each gap tile is a click into the workflow that resolves it (Evidence Workbench, Issue Board, Population Testing).
- **It moves the bank from "manual pack assembly" to "always-on readiness".** Workpapers and evidence already exist; this screen presents them through the right supervisory lens.

### 5.3 Who this is for
- **CRO (primary):** Walk-in readiness. Could we open the AFI pack tomorrow without panic?
- **Head of ORM / CCO (primary):** Owns supervisory packs operationally.
- **MLRO (primary for the PMLA/FIU lens):** Owns the AML lens specifically.
- **VP-ORM / tester (secondary):** Builds the workpapers that feed the packs.

### 5.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Lens selector (top row of buttons)** | One button per inspection lens with its **ARS ring** and pack count: RBI AFI Readiness, RBS / SPARC Readiness, PMLA / FIU Evidence Readiness, ITGRCA / CSITE / CERT-In Readiness, Concurrent Audit Readiness, Statutory Audit Readiness, Board / Audit Committee Pack Readiness. | Lets the user choose *which supervisory story* to view. |
| **Selected lens overview card** | Shows the active lens's title, scope definition (e.g. "Bank-wide; in-scope obligations under current RBI MDs"), a large ARS ring, the input dimensions (OCS, CES, EIFS, RTS, SAES, DCQS) with "weighted" chips, and an explanation of the ARS thresholds. | ARS is a *composite*; showing the inputs makes it interpretable. |
| **Gap List (right side)** | Eight gap categories with counts for the active lens: Missing evidence, Stale / late evidence, Unlinked source records, Open high-risk issues, Unclosed remediation, Missing SM attestation, Missing reporting ack, Failed / not-run population tests. Tile colour: green = 0, amber = 1–5, red = 6+. | A regulator-grade gap taxonomy. Each click jumps to the screen that fixes it. |
| **Readiness Packs in this lens** | List of actual audit pack records: pack ID, target audience, **pack ARS ring**, status badge, workpaper / evidence / issue counts. | The concrete artefact that would be presented. |

### 5.5 Important nuance — ARS bands vs gap counts
ARS uses fixed thresholds (≥85 green, ≥70 amber, else red). **The gap list is independent.** You can have a green ARS lens that still has non-zero gaps in some categories — that just means *most* of the readiness story is solid even if one or two items remain. The colour is about the score number; the gap counts are about category-by-category open work.

### 5.6 Business questions this screen answers
- "If RBI walked in tomorrow, what would they see?"
- "Which lens is our weakest right now?"
- "What evidence is missing or stale for our AFI pack?"
- "Which controls have failed tests that the regulator would care about?"
- "Whose senior manager attestation is overdue under each lens?"
- "Where do I click to fix this gap?"

### 5.7 Abbreviations on this screen
ARS, OCS, CES, EIFS, RTS, SAES, DCQS, RBI, AFI, RBS / SPARC, PMLA, FIU, ITGRCA, CSITE, CERT-In, SM, MRA, ORM.

---

# 6. Senior Accountability Ledger

### 6.1 What this concept means
The **Senior Accountability Ledger** is the bank's **named accountability register** for senior managers — usually CEO, CRO, CCO, MLRO, Head of FCC, Head of IT Risk, CISO, CIO, Business Heads. For each named SM, ORI tracks:

1. **Scope** — which processes, controls, risks, and obligations they are accountable for.
2. **Evidence of oversight** — attestations they have signed, decisions they have approved or escalated, audit-trail entries that show they were in the loop.
3. **Outstanding accountability gaps** — open issues where they are the accountable owner, overdue attestations, missing decisions.
4. **SAES score** — a 0–100 composite of (a) is scope evidenced, (b) are attestations current, (c) is the decision and oversight trail intact.

### 6.2 Why this screen exists
- **Regulators and boards always ask: "who was responsible?"** Until SAES-style ledgers exist, the answer is buried in emails and signatures across HR, ORM, and committee minutes.
- **Senior management accountability is a global supervisory theme.** UK SMCR is the most formal; RBI is increasingly explicit through governance circulars and inspection findings.
- **It separates *issue count* from *evidence of oversight*.** A senior manager with zero open issues might still have low SAES because they have not signed quarterly attestations. The two concepts are *not* the same — and the ledger keeps them separate.
- **It supports succession and role clarity.** When a senior manager exits, the ledger shows *exactly* what scope and open commitments transfer.

### 6.3 Who this is for
- **CRO (primary):** Reviews accountability posture before BRMC.
- **Head of ORM (primary):** Drives the attestation cycle.
- **HR / Governance secretary (secondary):** Maintains role mapping.
- **The senior managers themselves:** Self-service view of their own scope.

### 6.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Left column — SM list** | Sortable list of senior managers, each showing **SAES ring**, name, role, function, and a chip for "X open" issues where they are accountable. | One-glance view of accountability concentration and gaps. |
| **Top of detail (header)** | Selected SM's name, role, function, last attestation date, button to open the accountability drawer. | Anchors the right-side panels to a person. |
| **Scope summary (4 small stats)** | Processes / Controls / Risks counts the SM is accountable for, with the SAES ring. | Quantifies the breadth of accountability. |
| **Open Issues card** | List of issues where this SM is the accountable owner, with severity badge, ageing, RBI MRA / s.47A chips. Empty-state message: "No open issues — strong accountability posture." | Direct accountability gaps. |
| **Decisions card** | Recent decisions (approvals, escalations, vetoes, overrides) the SM has made, with timestamp, type chip, and approval basis. | Evidence of *active* oversight — not just attendance. |
| **Attestations card** | Period, control, CIMS-style, or ICR sign-offs the SM has made, with scope and date. | Evidence of *periodic* sign-off discipline. |

### 6.5 Frequent confusion (kept here for trainers)
- **"SM has SAES = 62 and 0 open issues — why red?"**
  Because SAES does *not* mean "are issues open?". It means "is the evidence of overseeing scope strong?". A red SAES with zero open issues typically means **missing or late attestations**, **light decision audit trail**, or **scope not evidenced**.

### 6.6 Business questions this screen answers
- "Who is accountable for this risk / control / process?"
- "When did this senior manager last attest?"
- "What decisions has the Head of FCC approved in the last 90 days?"
- "Which senior managers have weak oversight evidence?"
- "If this senior manager exits, what transfers?"

### 6.7 Abbreviations on this screen
SAES, SM / SMF, ORM, RBI, MRA, s.47A, CIMS, ICR (Internal Control Review).

---

# 7. Loss Data Register (Basel LDC View)

### 7.1 What this concept means
The **Loss Data Register** is the disciplined capture of **operational loss events** in the bank's books, structured by Basel taxonomy:

- **Gross loss** — what the bank lost before recoveries.
- **Recovery** — direct (e.g. from a counterparty) + insurance.
- **Net loss** — gross minus recovery.
- **Business line** — Corporate Finance, Trading & Sales, Retail Banking, Commercial Banking, Payment & Settlement, Agency Services, Asset Management, Retail Brokerage.
- **Basel event type** — Internal Fraud, External Fraud, Employment Practices & Workplace Safety (EPWS), Clients/Products/Business Practices (CPBP), Damage to Physical Assets (DPA), Business Disruption & System Failures (BDSF), Execution / Delivery / Process Management (EDPM).

Loss events can **link** to incidents (an incident may translate into one or more booked losses), to risks (each loss attaches to a risk for learning), and to controls (which control should have prevented it).

### 7.2 Why this screen exists
- **RBI ORM expectations.** Indian banks under RBI master directions are expected to maintain operational loss data collection. ORI represents this as a first-class screen.
- **Basel capital and Pillar 2.** Loss data is an input to operational risk capital and Pillar 2 assessment under Basel.
- **Concentration analysis.** A business-line × Basel-event heatmap reveals *where* losses cluster. Concentration is more actionable than aggregate loss.
- **Pillar of learning.** Each loss event invites the question "did we fix the underlying control?". Linking losses to risks and controls closes the learning loop.
- **Indian context — INR display in lakh/crore.** Numbers are formatted Indian-style for readability at BRMC (₹1.15 Cr, ₹34 L).

### 7.3 Who this is for
- **CRO (primary):** Reviews loss trends.
- **CFO / capital management (primary):** Loss data feeds capital.
- **Head of ORM (primary):** Owns the register.
- **Business heads (secondary):** Explain why losses cluster on their line.

### 7.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **KPI row** | Gross Loss YTD, Net Loss YTD, Recovery YTD, Loss Event Count YTD — all in INR lakh/crore. | One-glance YTD posture for the financial year. |
| **Basel Event Type · gross loss share** | A horizontal stacked bar showing how gross loss is distributed across the seven Basel event types, with the percent label inside larger segments and a colour-coded card grid below showing INR amounts per category. | Tells you *which* loss family dominates without reading numbers. |
| **Business Line × Basel Event Type heatmap** | A matrix of business lines (rows) × Basel event types (columns) with a coloured cell for each combination showing gross loss in lakhs. Empty cells show "—". | Concentration: which BU + event type combination is hot. Click a cell to filter the loss table. |
| **Loss events table** | Sortable table of FY loss events with: ID, date, type, subtype, business unit, gross, recovery, net, status, linked incident. Newest first; clicking a row opens the linked incident drawer. | The detailed register. |

### 7.5 Business questions this screen answers
- "What is our YTD operational loss?"
- "Which business line is hottest?"
- "Which Basel event type drives our losses (EDPM? Internal fraud?)?"
- "Are recoveries keeping pace with gross loss?"
- "Did we link the loss to a control that should have prevented it?"

### 7.6 Abbreviations on this screen
LDC, Basel, EDPM, BDSF, CPBP, DPA, EPWS, FY, INR, ORM, RBI.

---

# 8. KRI Monitoring (Key Risk Indicators)

### 8.1 What this concept means
**Key Risk Indicators (KRIs)** are forward-looking metrics whose movement *predicts* operational risk increase before the loss is booked.

Examples in ORI:
- **AML L1 alert backlog (count > SLA)** — predicts STR clock breach.
- **KFS-after-acceptance per 1000 disbursals** — predicts Digital Lending Directions breach.
- **Re-KYC overdue UCICs** — predicts CKYCR / KYC obligation breach.
- **BPO L1 SLA breach rate** — predicts customer detriment and operational loss.
- **Cyber detection-to-CERT-In notification latency p95** — predicts CSITE / CERT-In reportable miss.
- **Bureau pull > 90 days at sanction count** — predicts credit conduct breach.
- **Material vendors with overdue DDQ count** — predicts outsourcing risk.

Each KRI has **amber and red thresholds**, a **unit** (count, ratio, hours), a **formula reference** (e.g. "count(case_mgmt.case WHERE status='open' AND opened_at < now()-5BD)"), a **linked risk**, and a **time-series of observations**.

### 8.2 Why this screen exists
- **Issues and incidents are lagging.** By the time an issue is opened, the harm is mostly done. KRIs let ORM act *upstream*.
- **Boards expect early-warning discipline.** Saying "we predicted this two weeks ago" is reputationally and regulatorily better than "we just discovered this".
- **It connects metric to risk.** Each KRI is mapped to a risk in the register, so a deteriorating KRI immediately suggests *which risk is moving*.
- **It supports thresholds-as-policy.** Boards set appetite at the metric level; KRI monitoring is how that appetite gets *operationalised*.

### 8.3 Who this is for
- **CRO (primary):** Watches concentration of red KRIs.
- **Head of ORM (primary):** Owns threshold definitions and breach response.
- **1LoD business heads (secondary):** Watch their own KRIs.

### 8.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **KPI strip** | Total KRIs, KRIs in red band, KRIs in amber, KRIs deteriorating (latest worse than 4 weeks ago). | One-glance breadth and direction. |
| **KRI cards** | One card per KRI showing: name, linked risk, unit, **current value with band**, amber/red thresholds, **sparkline of last 12 observations** (with amber/red threshold lines), **breach narrative** if breached, last-observation date. | Compact monitoring view. Sparklines convey trend without a separate chart. |
| **Click a KRI** | Opens the KRI drawer with full observation history, linked risk drill, accountable SM, and threshold rationale. | Deep-dive without leaving the page. |

### 8.5 Business questions this screen answers
- "Which KRIs are above amber or red right now?"
- "Are any KRIs deteriorating for several weeks in a row?"
- "Which risk does this KRI predict?"
- "When did this metric first breach amber?"

### 8.6 Abbreviations on this screen
KRI, RES, RBI, ORM, SLA, KFS, UCIC, CKYCR, BPO, p95.

---

# 9. Incidents & Near-Miss Register (ORI Incident Register)

### 9.1 What this concept means
The **Incident Register** is the **case file** for operational risk events: **operational losses, near misses, frauds, cyber incidents, conduct breaches, regulatory breaches**. Each row records:

- **Severity** — high, medium, low (sometimes critical).
- **Discovered date / occurred date / reported date** — timing.
- **Business unit** — where it happened.
- **Basel event type** — taxonomy.
- **Net loss** — INR.
- **Incident status** — `reported`, `under_investigation`, `rca_in_progress`, `remediation_in_progress`, `closed`, `closed_no_loss`.
- **RCA link** — pointer to the RCA document (if started).
- **RCA status** — the RCA document's own status (`draft`, `under_review`, `approved`, etc.).
- **Accountable senior manager** — who owns this incident.
- **Regulatory filing flags** — RBI reportable, FMR filed, CERT-In filed, CSITE filed.

### 9.2 Why this screen exists
- **Operational risk events need a single front door.** Without it, fraud goes into one system, AML into another, cyber into a third — and posture is unknowable.
- **It is the entry point to the RCA chain.** Every material incident triggers an RCA, then PAs, then PAC governance.
- **Regulatory filing chains hang off it.** FMR (Fraud Monitoring Return), CSITE, CERT-In, STR are all tied to incident type and severity.
- **ORM cross-navigation lands here.** The cockpit's "Critical incidents (7d)" tile presets this screen to that filter.

### 9.3 Who this is for
- **Head of ORM / 2LoD ORM analyst (primary):** Day-to-day register manager.
- **Head of FCC / MLRO (primary for AML and conduct incidents).**
- **CRO (secondary):** Drills here from the cockpit for the severe tail.
- **VP-ORM / tester (secondary):** Reads incident detail for control testing context.

### 9.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **KPI strip** | Open incidents, Near-Miss (30d), High / critical open, Avg RCA cycle time. | Real-time inflow vs work-in-progress. |
| **Filters bar** | Six single-select dropdowns: Type, Severity, Unit, Status, Basel, RCA. One dropdown per dimension; all empty = no filter. | Dense filter UI — fits on one row, never wraps awkwardly. |
| **Incident table** | Columns: ID, Type chip, Title, Severity chip, Unit, Discovered date, Status, Basel, Net Loss (INR), RCA Status, Accountable SM. | The actual incident inventory. Each row clickable into the incident drawer. |

### 9.5 Frequent confusion — "STATUS" vs "RCA STATUS"
- **STATUS** = where the case file is in its lifecycle.
- **RCA STATUS** = where the linked RCA document is in its governance lifecycle.
- They can disagree (e.g. RCA = Approved while incident = `rca_in_progress`). This is expected because incident closure depends on customer remediation, regulatory filings, and PA completion — not just RCA sign-off.

### 9.6 Business questions this screen answers
- "How many incidents do we have open?"
- "Which incidents are high/critical and unresolved?"
- "Which incidents are reportable to RBI but not yet filed?"
- "Has the RCA been approved for this incident?"
- "Who is the accountable senior manager?"
- "What is our average RCA cycle time?"

### 9.7 Abbreviations on this screen
RCA, PA, PAC, ORM, RBI, FMR, CSITE, CERT-In, Basel, BPO, CPC, STR, FCC, EDPM, BDSF, CPBP, SM.

---

# 10. RCA & Preventive Actions Workspace

### 10.1 What this concept means
**Root Cause Analysis (RCA)** is the structured investigation after an incident to discover *why* it happened, not just *what* happened. ORI represents an RCA record with:
- **Methodology** — `five_whys` (sequential "why?" laddering, typically 4–5 levels) or `fishbone` (Ishikawa diagram across people / process / technology / external / vendor).
- **5-Whys steps** — list of "why?" statements, each one drilling deeper than the previous.
- **Root cause categories** — process, people, technology, external, vendor.
- **Root cause summary** — narrative paragraph that the bank would defend to a regulator.
- **Lessons learnt** — what the bank changes going forward.
- **Status** — `draft`, `under_review`, `hod_approval`, `spoc_review`, `approved`, `reopened`.
- **Owner SM** — accountable for the RCA quality.
- **Preventive actions (PAs)** — concrete remediations tied to this RCA, each with status, owner, target date, and a flag for whether closing this PA is a precondition for PAC approval of a related note.

### 10.2 Why this screen exists
- **Learning is a regulator expectation.** Repeat incidents without documented root cause are unacceptable.
- **It is the bridge between an incident and a system change.** Without RCAs, the bank chases symptoms; with RCAs, it changes processes.
- **PAC governance hooks here.** Material PAs become PAC notes; PAC notes can be **blocked** while linked PAs are open. The workspace shows the block state.
- **It supports both 5-Whys and Fishbone.** Different teams use different methodologies; ORM allows both with the same audit trail.

### 10.3 Who this is for
- **Head of ORM and ORM analysts (primary):** Run RCAs.
- **MLRO / Head of FCC (primary for AML and conduct incidents).**
- **SM owner of the RCA (primary):** Sign-off.
- **CRO (secondary):** Reviews when RCA is stuck in approval per cockpit deep-link.

### 10.4 What is on the screen (split-view)
| Pane | What you see |
|------|---------------|
| **Left list** | KPI strip (RCAs in flight, PAs overdue, PAC blocked), filter dropdowns (status, method), scrolling list of RCAs with status, method, owner role, PA count chip (green / amber / rose depending on PA health), "Blocks PAC" badge if any linked PA blocks a PAC note. |
| **Right panel (on select)** | Selected RCA's: ID, status, method, button to open linked incident; linked incident card; **5-Whys ladder** with each "why?" step shown as a question / answer pair; **root cause categories** chips; **root cause summary** narrative; **lessons learnt**; **preventive actions table** with owner, target date, status, overdue flag, and the PAC-block flag. |

### 10.5 ORM cross-navigation
When the user clicks the cockpit's "RCAs awaiting approval" tile, this screen receives a preset that filters to RCAs in `under_review`, `hod_approval`, or `spoc_review`. A banner explains the filter is the ORM "awaiting approval" lens and offers a one-click clear.

### 10.6 Business questions this screen answers
- "Which RCA is in flight, in approval, or stuck?"
- "What was the root cause of incident X?"
- "Which preventive actions are open against this RCA, and who owns them?"
- "Is any preventive action *blocking* a PAC note approval?"
- "How long is our RCA cycle time?"

### 10.7 Abbreviations on this screen
RCA, PA, PAC, ORM, MLRO, FCC, SM, HoD, SPOC, 5-Whys, Fishbone.

---

# 11. PAC Note Approvals

### 11.1 What this concept means
A **PAC note** is a governance document submitted to the **Preventive Action Committee** (PAC) for approval of:
- A material **SOP / policy change**.
- A material **risk acceptance**.
- A **structural remediation** with cross-functional impact.

PAC governance enforces a key control: **a PAC note cannot be approved while the preventive actions it depends on are still open**. This prevents the bank from approving the *idea* of a fix while the *fix itself* is missing.

### 11.2 Why this screen exists
- **It enforces the "no paper-only fixes" rule.** A note that says "we will fix this" but is not backed by an open PA closing in time is governance theatre.
- **It makes the blocker visible.** When approval is disabled, the screen explains *why* (which PA is open, who owns it, what the target date is).
- **It separates drafting from approving.** ORM drafts; PAC approves. This is essential because the same person should not draft and approve.
- **It supports conditional approval.** PAC can approve a note *subject to* PA closure — recorded as `conditional_approval` rather than blanket approval.

### 11.3 Who this is for
- **PAC secretariat / Head of ORM (primary):** Manages the queue, prepares notes for committee.
- **PAC members — CRO, CCO, Head of ORM, MLRO, CIO, CISO (primary):** Approve / reject / conditionally approve.
- **VP-ORM / Internal Audit (excluded from primary):** Independent assurance cannot approve management governance items — that would compromise independence.

### 11.4 What is on the screen (split-view)
| Pane | What you see |
|------|---------------|
| **Left queue** | List of PAC notes with title, document type, business unit, status (pending / under_review / conditional_approval / approved / rejected), submitted date, and a **"Blocked by N PAs"** banner where applicable. |
| **Right panel (on select)** | Full PAC note: title, document version, **referenced RCAs** (link to RCA workspace), **blocking preventive actions** table with owner and target date, comments thread (timestamped, with author role), and the **Approve / Conditionally Approve / Reject** action buttons. The Approve button is **disabled** while blocking PAs remain open. |

### 11.5 ORM cross-navigation
The cockpit's "PAC notes blocked" tile presets this screen to the blocked view.

### 11.6 Business questions this screen answers
- "Which PAC notes are pending and waiting on me?"
- "Why can I not approve this note? Which PA is blocking?"
- "Has this PAC note's RCA been approved upstream?"
- "What is our PAC cycle time?"
- "Has the bank approved any material risk acceptance recently?"

### 11.7 Abbreviations on this screen
PAC, PA, RCA, SOP, ORM, MOM (in comment threads), HoD.

---

# 12. RCSA Workspace (Risk and Control Self-Assessment)

### 12.1 What this concept means
**RCSA** is a periodic (typically half-yearly or annual) cycle where each business unit / cell formally **self-assesses** its inherent and residual risks and the controls that mitigate them. The cycle includes:
1. **Cell preparation** — BU team drafts ratings and evidence.
2. **SPOC review** — single point of contact reviews.
3. **HoD approval** — head of department approves.
4. **Sign-off** — final ORM acceptance, locks the cycle.

The output is a **risk-and-control matrix per cell** with inherent rating, residual rating, residual trend, top issues, attestation date, and signed-off audit trail. RCSA is a *self-assessment*, contrasted with *independent testing* (covered in screen 19).

### 12.2 Why this screen exists
- **RBI ORM guidance and Basel expectations require periodic identification and challenge.** RCSA is the standardised vehicle.
- **It scales to hundreds of cells.** A bank has many BUs and risk types; ORI provides a calendar, cells, and status discipline.
- **It is the supplier of *current* residual ratings.** The Risk Register draws from completed RCSAs.
- **It surfaces overdue and high-residual cells.** Slipping cycles or high-residual results need ORM challenge, not silent acceptance.

### 12.3 Who this is for
- **Head of ORM (primary):** Owns the cycle.
- **Business ORM coordinators / SPOCs / HoDs (primary):** Fill in cells.
- **CRO (secondary):** Reviews heatmap of weak cells before BRMC.
- **VP-ORM / tester (secondary):** May reuse RCSA outputs to plan independent testing.

### 12.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Filter dropdowns** | Three single-select dropdowns: BU, Cycle, Cell Status. | Single-row dense filter set. |
| **KPI strip** | Active cycles, Cells in flight, High-residual cells, Overdue attestations. | Cycle-progress KPIs. |
| **RCSA refresh calendar** | Horizontal time-line of cycles across the financial half-year, each shown as a coloured bar with status (not_started / in_progress / spoc_review / hod_approval / signed_off / locked) and a "today" marker. | Visual cadence. Shows slipping cycles at a glance. |
| **Cells grid** | A grid (or list) of cells per BU showing residual rating, residual trend arrow, accountable risk, open preventive actions for the linked risk, attestation date. | The granular self-assessment view. |
| **Export to ORMC pack** action | Button (demo: surfaces "queued" toast). | Production product would attach the latest RCSA refresh to the ORMC pack. |

### 12.5 Business questions this screen answers
- "Which cells are overdue?"
- "Which cells are high-residual?"
- "When does this cycle close?"
- "Has my BU HoD signed off?"
- "Are the residual ratings deteriorating cell-over-cell?"

### 12.6 Abbreviations on this screen
RCSA, ORM, ORMC, BRMC, BU, SPOC, HoD, RES, PA.

---

# 13. Risk Register

### 13.1 What this concept means
The **Risk Register** is the bank's **enterprise risk universe** — every named operational (and operational-adjacent) risk: Digital Lending Conduct, AML L1 SLA Risk, Cyber Material Incident Risk, Vendor Outsourcing Risk, Re-KYC Risk, Bureau Stale-Pull Risk, etc.

For each risk:
- **Inherent rating** — pre-control risk.
- **Residual rating** — post-control risk.
- **Residual trend** — improving / stable / deteriorating / rapidly deteriorating.
- **RES score** — 0–100 composite.
- **Accountable senior manager**.
- **Linked obligations, controls, KRIs, preventive actions, issues**.
- **Domain** (which of the nine risk domains it belongs to).

### 13.2 Why this screen exists
- **Risk appetite is set at the risk level.** Board approves thresholds per risk.
- **Risk is the connective tissue.** Incidents, losses, KRIs, controls — all attach to a risk for narrative.
- **Trend matters more than level alone.** A medium-residual risk *deteriorating* is more urgent than a high-residual risk *stable*.

### 13.3 Who this is for
- **Head of ORM (primary):** Owns the register.
- **CRO (primary for deep dives):** Goes here when a risk domain on the cockpit warrants drilling.
- **Audit (secondary):** Uses to plan sampling.

### 13.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Filter dropdowns** | Three single-select dropdowns: Domain, Residual, Trend. | Compact single-row filter set. |
| **KPI strip** | Total risks, High residual, Deteriorating, Avg RES. | Universe-wide posture. |
| **Risk table** | ID, domain, title, inherent rating, residual rating, trend arrow, RES, control count, KRI count, open issues, open PAs, accountable SM. Sortable; click a row to open the risk drawer. | The full register, dense. |

### 13.5 Business questions this screen answers
- "How many high-residual risks do we have?"
- "Which risks are deteriorating?"
- "What is our average RES?"
- "How many KRIs and controls support this risk?"
- "Who owns this risk?"

### 13.6 Abbreviations on this screen
RES, KRI, PA, ORM, SM.

---

# 14. Obligation Coverage Map

### 14.1 What this concept means
An **obligation** is an **atomic regulatory requirement** — one sentence from an RBI master direction, a PMLA rule, a FIU instruction, or a cyber circular, written in a way that can be tested.

Example obligations:
- OBL-RBI-KYC-001 — UAPA s.51A daily screening.
- OBL-PMLA-003 — STR within 7 working days from suspicion conclusion.
- OBL-RBI-DL-001 — KFS issued before borrower acceptance.
- OBL-RBI-OUTSRC-001 — fourth-party disclosure for material outsourcing.

Each obligation is **mapped to one or more controls**. **Obligation Coverage Score (OCS)** measures how completely a regulatory obligation is covered by working controls and evidence.

### 14.2 Why this screen exists
- **Coverage gaps are the most common RBI finding.** "You have a policy but no control" is a recurring inspection theme.
- **2LoD's core question is "which obligations are weakly covered?".** This screen is purpose-built for that question.
- **It links policy to operational reality.** Without it, regulatory change inbox sits separate from controls.

### 14.3 Who this is for
- **CCO / Head of ORM (primary):** Owns coverage discipline.
- **Regulatory change owner (primary):** Maps new circulars to obligations and controls.
- **CRO (secondary):** Drills here when an inspection lens is amber/red.

### 14.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **KPI strip** | OCS aggregate, count of obligations, count of obligations with no controls, count of obligations needing fresh evidence. | Coverage at a glance. |
| **Obligation list** | Filterable list with regulation, citation, applicability archetype, reporting clock link, accountable SM, linked control count. | The detailed coverage register. |
| **Selected obligation drill** | Linked controls, control statuses, evidence freshness, reporting clock if any, accountable SM, recent issues, regulatory anchor citation. | Click an obligation to see its coverage chain. |

### 14.5 Business questions this screen answers
- "Which obligations have no controls?"
- "Which obligations have failing controls?"
- "Which obligation will hurt us in the next RBI AFI?"
- "Has the accountable SM attested?"
- "What is the reporting clock attached to this obligation?"

### 14.6 Abbreviations on this screen
OCS, RBI, PMLA, FIU, MD (Master Direction), CKYCR, KFS, STR, CTR, CSITE, ORM, SM.

---

# 15. Control Universe & Control Drill-Down

### 15.1 What these concepts mean
- **Control Universe** is the **Risk and Control Matrix (RCM) browser** — every active control with CES, type (preventive / detective / corrective), nature (automated / manual / hybrid), frequency (per_event / daily / monthly / quarterly), and population testability flag.
- **Control Drill-Down** is the single-control deep view: CES breakdown into the three components (Operating Rate / Catch Rate / Evidence Completeness), control instances (every time the control ran), evidence quality, linked issues, AI signals on this control.

### 15.2 Why these screens exist
- **Obligations are abstract; controls are operational.** Day-to-day risk management lives at control level.
- **CES is a *composite* — interpreting it requires the breakdown.** A control with CES 85 but Operating Rate 95 / Catch Rate 95 / Evidence Completeness 40 has a *very different* problem than one with Operating Rate 60 / Catch Rate 60 / Evidence Completeness 100.
- **Population testability matters.** Some controls can be tested across the full population; others can only be sampled. The drill-down shows this.
- **Inspection conversations are about *named* controls.** Drill-down is the screen you would project during an RBI conversation.

### 15.3 Who these are for
- **Head of ORM (primary).**
- **Control owners (1LoD, primary).**
- **VP-ORM / control tester (primary):** Plans population testing here.
- **CRO (secondary):** Drills here when a control appears in a posture watchlist.

### 15.4 What is on the Control Drill-Down screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Header** | Control title, ID, type / nature / frequency, accountable SM role, dropdown to switch control. | Identification. |
| **Metadata grid** | Process, Position in step, Owner role, Population testable, Linked obligations, Linked risks. | The control's *context*. |
| **Outcome strip** | Pass / Fail / Evidence Gap / Data Gap counts in the current window. | Operational reality. |
| **Tabs** | Overview, Population, Evidence, Issues, AI / predictive signals. | Different lenses for the same control. |
| **Overview tab** | **CES Breakdown Card**: composite CES with band, Operating Rate (with bar), Catch Rate (with bar), Evidence Completeness (with bar). Plus Linked Obligations and Linked Risks side-cards, and a "Run population test for this control" button to deep-link to Population Testing. | Decomposes CES; offers next action. |
| **Population tab** | All control instances with outcome, fire timestamp, latency, reason for fail/gap. Each row is clickable into D-01 source lineage. | Population reperformance evidence. |
| **Evidence tab** | Evidence records linked through control instances with status badges. | Evidence quality view. |
| **Issues tab** | Linked open issues with severity, ageing, RBI MRA flag. | Open work tied to this control. |
| **AI / predictive signals tab** | Model-fired signals on this control with confidence and HITL status. | Model-based intelligence. |

### 15.5 Business questions these screens answer
- "What is the effectiveness score of CTRL-KYC-003?"
- "Where does the score come from — operation, catch, or evidence?"
- "How many times did this control fire? How many failed?"
- "Which evidence is missing for this control?"
- "Is the model telling us anything about this control?"
- "Which obligation does this control cover?"

### 15.6 Abbreviations on these screens
CES, RCM, ORM, SM, HITL, MRA, RBI, KCI (background).

---

# 16. Process Health

### 16.1 What this concept means
**Process Health** is a process-mining-style view of bank processes (KYC onboarding, AML L1 disposition, digital lending disbursal, etc.). For each process:
- **Documented variant** — the as-designed sequence of steps.
- **Actual variant signatures** — the variants that actually occur in production.
- **Process Variant Drift Score (PVDS)** — how much actual execution diverges from documented.
- **SLA breaches** — counts of step executions exceeding their latency SLA.
- **Linked controls** — controls embedded in process steps.

### 16.2 Why this screen exists
- **Many operational losses are process drift, not control design.** A control may be perfectly designed but if the actual handoff between BPO and CPC takes 7 days when the SOP says 2, controls fire too late.
- **It surfaces the "shadow process".** Process mining reveals variants not on the SOP, often introduced informally.
- **It connects process to control.** A control failure is often a process drift failure upstream.
- **It supports change governance.** Variant change without ORMC awareness is a governance gap.

### 16.3 Who this is for
- **Head of ORM (primary).**
- **Operations excellence / transformation teams (primary).**
- **Business heads (primary for their own processes).**
- **CRO (secondary):** Drills here when an incident references a process by name.

### 16.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Process list** | Each process with PVDS, documented variant signature, count of variants observed, SLA breach count. | Process-level posture. |
| **Selected process detail** | PVDS ring, variant tree (documented + observed variants), SLA breach distribution by step, linked controls list. | Drift visualisation. |
| **Step executions** | Recent step executions with skip flags, manual override flags, BPO/vendor flags, deviation notes. | Operational reality of the process. |

### 16.5 Business questions this screen answers
- "Which processes are drifting?"
- "Where in the process are SLAs breaking?"
- "Did any step get skipped or manually overridden?"
- "Which controls are inside this process?"

### 16.6 Abbreviations on this screen
PVDS, ORM, SLA, SOP, BPO, CPC.

---

# 17. Source Lineage

### 17.1 What this concept means
**Source Lineage** is the chain from a **source system of record** (Core Banking, LOS, Case Management, FIU outbound, CBS) through **source records** to the **evidence** that supports a control instance. The **Data and Correlation Quality Score (DCQS)** measures how robust this chain is — ingestion health, latency, schema version, correlation match, **orphan records** (records that should match to a downstream entity but do not).

### 17.2 Why this screen exists
- **"Trust me" is not regulator-grade.** Auditors and supervisors will ask: "Where did this evidence come from? Show me the system of record. Show me the correlation chain."
- **Orphans are the silent killer.** Records that fail to correlate to incidents, controls, or evidence often represent unbooked operational risk.
- **It supports data quality discipline.** Without lineage discipline, posture is computed on incomplete data and the bank gets caught.

### 17.3 Who this is for
- **ORM data owners (primary).**
- **IT Risk and CISO function (primary for ingestion health).**
- **Financial Crime analytics teams (primary for AML data).**
- **Audit (secondary):** Reconciliation reliability.

### 17.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Source system list** | Each system with ingestion lag, last successful ingest, error rate, schema version, status, orphan count. | System-level health. |
| **DCQS card** | Aggregate DCQS with band. | Single number for executives. |
| **Correlation records table** | Recent correlation outcomes (matched, orphaned, mis-routed) with confidence and explanation. | Quality detail. |
| **Orphan drill** | Records flagged as orphaned, with reason and proposed routing. | Actionable data gaps. |

### 17.5 Business questions this screen answers
- "Is our AML case data ingesting on time?"
- "How many orphan records do we have?"
- "Which source system is degraded?"
- "Can we prove this evidence came from CBS?"

### 17.6 Abbreviations on this screen
DCQS, ORM, FIU, CBS, LOS.

---

# 18. Issues & Remediation Board

### 18.1 What this concept means
An **issue** in ORI is any control-failure / finding / inspection observation / RBI MRA that is open and needs work. Each issue has:
- **Severity**.
- **Status** — open, in_remediation, awaiting_retest, closed.
- **Ageing days** — how long it has been open.
- **Accountable senior manager**.
- **Root cause** narrative.
- **RBI MRA flag** (yes if this is an RBI inspection finding).
- **Section 47A exposure flag** (potential monetary penalty exposure).
- **PMLA exposure flag** (AML risk).
- **Linked controls, obligations, risks, AI insights, remediation actions**.

### 18.2 Why this screen exists
- **Issues are the work-management spine of ORM.** Everything else flows through here.
- **RBI MRA tracking is a regulatory necessity.** MRAs have deadlines; misses are reportable.
- **Issues link the operational reality (control fail) to learning (remediation action) to accountability (senior manager).** A single board is the only sane way to manage this.

### 18.3 Who this is for
- **Head of ORM (primary).**
- **Issue owners and remediation leads (primary).**
- **Business heads (primary for their own issues).**
- **CRO (secondary):** Drills here for aged high-severity items.

### 18.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **KPI strip** | Open count, RBI MRA count, average mean-time-to-remediation. | Workload signals. |
| **Filter dropdowns** | Status, Severity, MRA flag, SM owner. | Single-row filter set. |
| **Issues table** | ID, title, severity, status, ageing days, accountable SM, root cause cluster, RBI MRA chip, s.47A chip, PMLA chip, linked controls. | Dense list view. |
| **Selected issue** | Detail drawer: full root cause, linked entities, remediation actions with target dates, retest status, validation status, AI insights, decisions. | Single-issue deep dive. |

### 18.5 Business questions this screen answers
- "How many issues are open and ageing?"
- "Which issues have RBI MRA flags?"
- "What is the mean time to remediate?"
- "Are any issues blocking inspection readiness?"
- "Has the retest happened after remediation?"

### 18.6 Abbreviations on this screen
RBI, MRA, s.47A, PMLA, ORM, PA, SM.

---

# 19. AI / Predictive Signals (Human-in-the-Loop Review Queue)

### 19.1 What this concept means
**AI insights** in ORI are signals produced by models that detect:
- **Control effectiveness decay** — a control's CES is sliding.
- **Process drift** — variants emerging that were not designed.
- **Coverage gaps** — populations of customers / transactions falling outside scope.
- **Evidence quality issues** — staleness, hash mismatches, late acks.
- **Anomalies** — outliers (e.g. KFS timing reversal cluster on a DSA channel).
- **Root-cause clusters** — multiple exceptions sharing an underlying cause.
- **Accountability gaps** — senior manager scope vs evidence.

Every AI insight has a **confidence percent**, a **model ID and version**, an **alert / review / action threshold**, a **risk-if-wrong** caveat, and a **human approval status** (`pending`, `accepted`, `escalated`, `rejected`). **Nothing acts without a human accepting it (HITL).**

### 19.2 Why this screen exists
- **Models can detect what humans miss.** Process drift, decay patterns, cluster causes — these are uneconomic to detect by hand.
- **But models are not policy.** RBI and internal model risk policy require human adjudication before model output drives action.
- **It is the model risk operating front.** AITES is a *trust* metric for models; this queue is where that trust gets validated case by case.

### 19.3 Who this is for
- **Head of ORM model risk liaison (primary).**
- **Subject matter experts in AML, credit, cyber, conduct (primary):** Adjudicate signals in their domain.
- **CISO (primary for cyber and IT signals).**
- **CRO (secondary):** Sees pending count on cockpit.

### 19.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Filters** | Signal class, confidence band, model, human approval status. | Slice the queue. |
| **KPI strip** | Pending count, AITES, models in amber/red drift. | Health of the AI programme. |
| **Insight cards** | Title, signal ID, signal class chip, confidence percent, model version, cited evidence, cited source records, linked controls / obligations / issues, **risk-if-wrong** caveat, **recommendation**, HITL badge. | Full context for adjudication. |
| **Adjudication actions** | Accept / Reject / Escalate / Defer. Action logs to audit trail. | The HITL action itself. |
| **Model Risk Records (MRR)** | Linked model validation status, drift status (`green` / `amber` / `red`), AITES, governance committee reference. | Tie the signal to model governance. |

### 19.5 Business questions this screen answers
- "How many model signals are pending adjudication?"
- "Which models are in drift?"
- "What is our AI trust score (AITES)?"
- "Has this AI signal been validated by the human SME?"
- "What was the recommendation, and what was the rationale to override?"

### 19.6 Abbreviations on this screen
HITL, AITES, MRR (Model Risk Record), ORM, AML, KYC, KFS, DSA, CISO.

---

# 20. Control Testing (Population / Reperformance Console)

### 20.1 What this concept means
**Control testing** is **independent reperformance** of a control over its real-world population. ORI represents:
- **Test execution** — one test run on a control over a defined population and as-of date. Has type (`population_reperformance`, `sample`, `retest`), tested count, exception count, data-gap count, evidence-gap count, result (`Pass`, `Failed`, `pending`), and a linked workpaper.
- **Population query reference** — the SQL-like population definition used.
- **Exceptions clustered** — exceptions grouped by **root cause cluster** (e.g. "BPO L1 SLA breach", "DSA-LOS clock drift").
- **Retests** — re-runs after remediation to validate closure.

Contrast: **RCSA is self-assessment** (1LoD says how their controls are doing). **Population testing is independent reperformance** (2LoD/3LoD verifies, often over the full population, not just a sample).

### 20.2 Why this screen exists
- **Self-assessment alone is insufficient assurance.** Regulators expect independent evidence that controls work.
- **Population testing is more rigorous than sample testing.** When the bank has the data, testing the *whole* population removes sampling risk.
- **Retest discipline closes the loop.** A remediation is not "done" until the retest passes.
- **Workpapers come from here.** Each completed test produces a workpaper that becomes part of supervisory packs.

### 20.3 Who this is for
- **VP-ORM / control tester (primary).**
- **Internal audit (3LoD) functions reusing the engine.**
- **Concurrent auditors (primary).**
- **Head of ORM (secondary):** Reviews failed tests.

### 20.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Test runner panel** | Control selector, test type, result badge, rerunnable flag, as-of date, population query reference, button to run / re-run, signed-off workpaper link if any. | The runner. |
| **Exception clusters card** | Grouped exceptions by root cause cluster with severity and CI count. Click to filter the CI table. | Pattern detection inside the population. |
| **Control instance table** | Filtered CIs with outcome, fire timestamp, latency, reason. | Full population view. |
| **Retest tracker** | Linked retest test (if any) with current status. | Closure validation. |

### 20.5 Business questions this screen answers
- "Did this control pass independent reperformance over the full population?"
- "How many exceptions, and what clusters do they fall into?"
- "Has the retest been run after remediation?"
- "What workpaper documents this test?"
- "Is this control testable by population, or only by sample?"

### 20.6 Abbreviations on this screen
3LoD, ORM, RCSA, CI (control instance), ToD (test of design), ToO (test of operating effectiveness), BPO, DSA, LOS.

---

# 21. Evidence Workbench

### 21.1 What this concept means
The **Evidence Workbench** is the central library of **evidence records** that back controls and obligations. Each evidence record has:
- **Type** — log, document, attestation, signed artefact, report, biometric, workpaper.
- **Source system** (where it came from).
- **Source record link** (the underlying source row).
- **Payload hash** — for integrity.
- **Evidence completeness score**.
- **Status** — Complete / Partial / Missing / Late / InvalidHash / Orphaned / BpoPending.
- **Freshness in days** (since produced).
- **Retention class** — PMLA-10y, RBI-MD, Concurrent.
- **Regulator-ready flags** — `rbi_afi`, `pmla_rule9`, `fiu_finnet`, `statutory`, `concurrent`.

### 21.2 Why this screen exists
- **Inspections are won or lost on evidence.** Policies and procedures count only if backed by evidence that the procedure was actually followed.
- **Retention classes matter.** PMLA Rule 9 requires 10-year retention; missing retention class management is a finding waiting to happen.
- **Hash integrity protects against post-hoc tampering.** Auditors trust hashed evidence chains.
- **Regulator-ready flags drive lens scoping.** When the AFI lens asks "what evidence is RBI-AFI ready?", the flag answers.

### 21.3 Who this is for
- **Head of ORM / evidence owners (primary).**
- **Control testers (primary):** Attach evidence to test executions.
- **MLRO (primary for PMLA / FIU evidence chain).**
- **VP-ORM (primary for workpaper evidence).**

### 21.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **KPI strip** | RBI AFI ready %, PMLA Rule 9 ready %, FIU FINnet ready %, total evidence count, EIFS aggregate. | Readiness percentages per lens. |
| **Filter bar** | Status filter chips / dropdowns: all / Complete / Partial / Missing / Late / InvalidHash / Orphaned / BpoPending. | Slice by evidence state. |
| **Evidence table** | ID, type, source system, source record, completeness, status, freshness days, retention class, regulator-ready flags. | Full library, dense. |
| **Selected evidence drill** | Linked control instances, hash details, retention boundary, related issues, downstream usage in packs. | Single-evidence deep view. |

### 21.5 Business questions this screen answers
- "What percent of our evidence is RBI-AFI ready?"
- "How much PMLA Rule 9 evidence is stale?"
- "Are any evidence records flagged InvalidHash?"
- "What evidence supports CTRL-KYC-003?"
- "Has the FIU ack come in for this STR?"

### 21.6 Abbreviations on this screen
EIFS, RBI, AFI, PMLA, Rule 9, FIU, FINnet, ORM, MLRO.

---

# 22. Inspection Pack Builder (Workpaper / Audit Pack Builder)

### 22.1 What this concept means
A **workpaper** is the test documentation produced by control testing (sections: Cover, Test Rationale, Population Definition, Pass/Fail Logic, Findings, Evidence Appendix, Conclusion, Reviewer Sign-off, Retest Requirement). It is signed by the tester and counter-signed by a reviewer (often MLRO, CCO, CIO depending on subject).

An **audit pack / readiness pack** is the bundle of workpapers + included evidence + included issues + attestations + decisions submitted to a supervisory audience (RBI AFI, PMLA/FIU, Concurrent, Statutory, Board). Each pack has an **ARS** and a **readiness status** (`green`, `amber`, `red`, `inspection_ready`).

### 22.2 Why this screen exists
- **Packs should be assembled, not authored from scratch.** When workpapers exist and evidence is tagged with regulator-ready flags, pack assembly is mechanical.
- **It enforces sign-off discipline.** A pack cannot be regulator-ready without all included workpapers being signed *and* reviewed.
- **It is the deliverable for inspection readiness.** The Inspection Readiness screen scores readiness; this screen *builds* the artefact.

### 22.3 Who this is for
- **VP-ORM / control tester (primary):** Authors workpapers.
- **Head of ORM / pack coordinator (primary):** Assembles packs.
- **MLRO / CCO / CIO (primary as reviewers):** Sign workpapers in their domain.
- **CRO (secondary):** Signs off pack readiness, not line items.

### 22.4 What is on the screen
| Section | What you see | Why it is there |
|---------|---------------|------------------|
| **Workpaper list** | Each workpaper with ID, control link, status (draft / in_review / signed), reviewer role, sign timestamps, retest required flag, regulator-ready flags (`rbi_afi`, `pmla_rule9`, `statutory`, `concurrent`). | Author / review queue. |
| **Workpaper detail** | Sections list, population & tested counts, exception count, evidence appendix, tester role, reviewer role, signed-by SM IDs. | Full single workpaper view. |
| **Readiness packs (right pane)** | One card per pack: ID, audience, ARS ring, readiness status, included workpaper / evidence / issue counts, exported_at timestamp, content_hash. | Pack-level assembly. |
| **Selected pack drill** | Manifest of included items, gap counts, missing sign-offs, button to mark as inspection_ready when all checks pass. | The final assembly stage. |

### 22.5 Business questions this screen answers
- "Which workpapers are unsigned and blocking a pack?"
- "What is the ARS of our RBI AFI pack?"
- "Is the manifest stable (content hash) since last export?"
- "Which evidence is in the pack but stale?"
- "Are retest workpapers required and pending?"

### 22.6 Abbreviations on this screen
ARS, ORM, RBI, AFI, PMLA, FIU, statutory, concurrent, SM.

---

# 23. Persona-to-screen mapping (consolidated)

This summarises *who lives where* (primary use) vs *who reads* (secondary).

| Persona | Lives in (primary work) | Reads (secondary) |
|---------|--------------------------|---------------------|
| **CRO / MD & CEO** | Enterprise ORM Posture, What Changed This Week, Inspection Readiness, Senior Accountability Ledger | KRI Monitoring, Loss Data Register, Incident Register (severe tail), AI Signals (cockpit-driven) |
| **Head of ORM / CCO / MLRO** | Obligation Coverage Map, Control Universe, Control Drill-Down, RCSA Workspace, Risk Register, KRI Monitoring, Incident Register, RCA Workspace, PAC Note Approvals, Issues & Remediation, Source Lineage, AI Review Queue, Loss Data Register | Inspection Readiness, Senior Accountability Ledger |
| **VP-ORM / Control Tester** | Control Testing (Population Reperformance), Evidence Workbench, Workpaper / Pack Builder, Control Drill-Down (for planning) | Inspection Readiness (to see how their workpapers feed packs), Issue Board (for their domain) |

---

# 24. Common business workflows (end-to-end stories)

### 24.1 Story A — AML alert SLA stress → STR clock risk
1. **KRI Monitoring** shows KRI-FC-001 (AML L1 alert backlog) sliding amber → red over 3 weeks.
2. **Incident Register** logs INC-2026-ORI-002: 124 alerts past 5-BD SLA after mid-cycle BPO seat reduction at VEND-2024-00203.
3. **RCA Workspace** opens RCA-2026-ORI-02; methodology = 5-Whys; root cause = capacity starvation during FINnet schema uplift + MIS pack silent on FCC capacity.
4. **PAC Note** for the new SOP is **blocked** while linked PAs are open.
5. After PA closure, PAC approves; **What Changed This Week** shows "one less PAC blocked"; **Cockpit** updates.

### 24.2 Story B — Inspection readiness drive
1. **Inspection Readiness** shows RBI AFI lens ARS = 73 amber; PMLA/FIU lens = 68 red.
2. **Gap List** highlights 15 stale evidence, 3 open high-risk issues, 6 failed pop tests.
3. **Evidence Workbench** filters to stale + RBI-AFI flag; the 15 records get refreshed or re-attested.
4. **Population Testing** re-runs the 6 failed tests after remediation.
5. **Pack Builder** marks AP-RBI-AFI-2026-Q1 as inspection_ready; ARS climbs from 73 → 81.

### 24.3 Story C — Senior accountability under scrutiny
1. **Posture cockpit** Senior Accountability snapshot shows Head of FCC SAES = 62 red.
2. **Accountability Ledger** detail reveals last attestation overdue + thin decision audit trail.
3. Recent attestations and decisions are signed; quarterly attestation cycle restarts; SAES climbs.
4. Next BRMC pack shows Head of FCC SAES green.

---

# 25. Document control

| Version | Date | Notes |
|---------|------|--------|
| 2.0 | 2026-05-13 | Comprehensive rewrite — every screen has full business context, on-screen breakdown, and business questions answered. Glossary expanded with all RBI / PMLA / FIU / cyber / banking abbreviations used in the product. |
| 1.0 | — | Initial business companion (one-liners per screen). |

For technical inventory (file paths, component IDs), see **`KNOWLEDGE_BASE.md`** in the same folder. **`ORI_SPEC.md`** carries the product reframe spec. This document is the **business companion** — read this when learning the product, training new users, or briefing stakeholders.

---

*End of ORI business concepts guide.*
