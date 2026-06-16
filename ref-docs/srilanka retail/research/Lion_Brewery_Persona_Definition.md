# Persona Definition Document
## AI-Powered Audit & Compliance Solution — Lion Brewery (Ceylon) PLC

**Builds on:** Stage 0 Foundational Understanding Document (Sections 1–9)
**CTO brief:** *"Audit and compliance is consuming too much of my team's time and my time. I want to run this with AI — faster, smoother, cheaper."*
**Purpose:** Define who touches this system, what they need, how they must experience it, and what "working" looks like for each — at a level a UI designer can lay out screens from.

> **Reading note:** Personas are composites grounded in Stage 0, not real individuals; names/ages are illustrative anchors. Figures such as the ~Rs 64.8 bn annual excise liability and the ~1,130–3,000 active POS range are carried from the brief/Stage 0 and remain **[VERIFY]** items. Five personas are defined: the four required, plus Regulatory/Export Compliance, which Stage 0 Pillar P10 (export & customs) and the "container held at Customs" scenario directly support.

---

### PERSONA 1 — CTO / TECHNOLOGY & TRANSFORMATION LEADERSHIP (the sponsor)

*"Dinesh," ~48, reports toward the CEO and is accountable to the Carson Cumberbatch board.*

**Who they are:**
Senior technology/transformation leader for a single-site, ~LKR 58 bn-revenue, CSE-listed brewery. He runs a small central tech function and is the person who said the brief. **Compliance is not his job — it is his exposure.** He owns the *mandate* to make it cheaper and safer, and he is the one who will stand in front of the board and say "we have this under control."

**A day in their life (compliance-related):**
He doesn't do compliance tasks; he absorbs their failures. On a normal day he's pulled into a steering call because the monthly excise close slipped again, or the CFO wants assurance before the board pack goes out, or Regulatory flags that an FL renewal is stuck behind a tax-clearance certificate. He asks "are we compliant right now?" and the honest answer takes his team three days of emails, SAP extracts, and a walk down to the resident Excise Unit to cross-check their register by hand. He sees a company that has digitised sales and production but still runs compliance on Excel, PDFs, and paper permits — and he can feel the cost scaling with every new SKU and every January duty hike.

**Mental model:**
Compliance as an **un-leveraged manual tax on the business** — pure cost, no compounding. His frame is a **"control tower" / single pane of glass**: he wants to *see* posture, not assemble it. He thinks in dashboards, hours-saved, and risk exposure, and he is allergic to "AI" that can't show a number to the board.

**Primary goals:**
A good day is a quiet one: no compliance escalation reached his desk, the monthly returns went out clean, and he can answer the board's "are we exposed anywhere?" in 60 seconds with evidence behind it. Longer term: turn compliance from a headcount line into a system.

**Key frustrations today:**
No single source of truth — the answer to "what's our duty position / licence status / open audit risk *today*" lives in five people's spreadsheets. SAP holds production and finance data but it isn't joined to the excise officer's register, the lab's results, or the paper permit file. Every audit cycle pulls senior people into firefighting.

**What they fear:**
A **manufacturing-licence suspension or a public penalty on his watch** (a board-level, going-concern event), and — almost as bad professionally — **greenlighting an AI project that fails to show ROI** and becomes the example of "AI that didn't work here."

**What they wish they had:**
A live **compliance-posture dashboard** with two honest numbers — *human-hours spent* and *open risks* — and the ability to drill from a red flag straight to the underlying document. He'd ask for "Bloomberg terminal for our compliance," if he knew to.

**Success criteria for the AI system:**
- Monthly compliance close-time falls measurably (his headline ROI metric).
- Escalations reaching his desk drop quarter-on-quarter.
- He can produce a credible board slide from the system in minutes, unaided.

**Persona goals → System goals mapping:**

| Persona goal | What the system must do to serve it |
|---|---|
| Answer "are we compliant now?" instantly | Maintain a live, role-agnostic **compliance-posture dashboard** aggregating all pillars |
| Prove ROI to the board | Track and surface **hours-saved and risk-reduction metrics** over time |
| No surprises | **Escalation logic** that flags only board-relevant risks (licence/duty/recall) to his view |
| Trust the automation | **Explainability + audit log** so every figure traces to a source document |
| Turn cost into capability | **Modular rollout** that shows value from one pillar before expanding |

---

### PERSONA 2 — EXCISE COMPLIANCE OFFICER / FINANCE LEAD (the custodian)

*"Priyantha," ~42, senior manager in Finance; the human spine of the excise function.*

**Who they are:**
He owns the company's single largest obligation flow — the **~Rs 64.8 bn annual excise liability** — plus the **Fool Proof Sticker** reconciliation and the monthly duty declarations to the Excise Department. He works hand-in-glove (and sometimes at arm's length) with the **resident Excise Unit physically stationed at Biyagama**. For him, **compliance isn't a burden on top of the job — it *is* the job.**

**A day in their life (compliance-related):**
His month is a reconciliation marathon. He pulls removal records and packaging counts from **SAP**, then walks them against the **resident Excise Unit's own register** — two sets of figures that *must* agree before a return goes out. He reconciles **Fool Proof Stickers**: procured vs applied on the line vs voided/scrapped vs duty-paid units, mostly by manual count, knowing a gap reads as either revenue leakage or fraud. He chases the plant for the **ABV and fill-volume figures** that turn litres of beer into litres of pure alcohol — the number the whole duty calculation hangs on. He watches the timing gap between **duty paid on removal from bond** and **cash collected from trade**, because the company pre-funds the State. At month-end he assembles the return in Excel, cross-checks it three ways, and braces for the question he dreads most: *"these don't tie out — why?"* from an Excise officer who can suspend the licence.

**Mental model:**
**Every bottle is a tax receipt.** He is the **treasurer/custodian of the company's licence to operate** — his frame is guardianship, not paperwork. A reconciliation break isn't an error; it's a threat to the whole company.

**Primary goals:**
The numbers tie out, the return is filed on time, the sticker float reconciles to within tolerance, and there are **zero surprises** when the Excise officer reviews. A good day is a boring close.

**Key frustrations today:**
The **three-way reconciliation (SAP ↔ Excise register ↔ duty paid) is manual and after-the-fact**, so breaks are discovered late. **Sticker void/wastage accounting** has no clean serial-level trail. **FL-licence renewal is hostage to an IRD tax-clearance certificate**, so a tax hiccup can threaten production. And the **removal-vs-collection timing mismatch** is a permanent working-capital headache he reconciles by hand.

**What they fear:**
An **underpayment finding and penalty**, **licence suspension for arrears** (the Excise Department does suspend for unsettled duty), and the **personal accountability** that lands on the person whose name is on the declaration.

**What they wish they had:**
A **live duty position** that updates as beer is removed, **serial-level sticker reconciliation** (issued ↔ applied ↔ scrapped ↔ paid), and a **monthly return that drafts itself with a defensible workpaper attached** — so the conversation with the Excise officer starts from agreement, not archaeology.

**Success criteria for the AI system:**
- Monthly excise-return preparation time drops sharply (e.g. days → hours).
- **Zero unexplained reconciliation breaks** at Excise review.
- Sticker variance stays under a defined tolerance, every batch, with a serial trail.
- He can open the system and see *"today's duty owed"* without building it.

**Persona goals → System goals mapping:**

| Persona goal | What the system must do to serve it |
|---|---|
| Numbers tie out, always | Continuous **three-way reconciliation**: SAP removals ↔ Excise register ↔ duty paid, with break-flagging |
| Sticker float reconciles | **Serial-level Fool Proof Sticker tracking** (procured/applied/voided/paid) |
| File the return on time | **Auto-drafted monthly excise return + workpaper**, human-signed |
| Trust the LPA figure | Pull **batch ABV × fill × units** from plant/SAP; flag declared-vs-actual ABV drift |
| Protect the licence | **Tax-clearance + renewal dependency alerts** before they bite |
| Defend it to the officer | **Explainable, exportable evidence** for every line |

---

### PERSONA 3 — QA MANAGER / HEAD OF QUALITY (the gatekeeper)

*"Nilanthi," ~39, runs QA/QC for the Biyagama site and its lab.*

**Who they are:**
She owns **batch release, lab results across all QC gates, SLSI/SLS conformance, and the HACCP evidence chain**. Crucially she owns the **ABV datum that is load-bearing three times over** — for quality spec, for Priyantha's excise calculation, and for what gets printed on the label. **Compliance is the core of her professional identity**, not an add-on.

**A day in their life (compliance-related):**
Her morning is a release queue. She reviews results from the **incoming, in-process, and bright-beer-release gates** — gravity, pH, carbonation, micro sterility, clarity, and **final ABV** — and her signature authorises a batch to be packaged and sold. The trouble is the evidence is scattered: some in a partial **LIMS**, some in instrument exports, some on **paper sensory sheets** and emailed supplier **COAs**. Assembling a single batch's full story is manual archaeology. Then the scenario she rehearses in her head: a **Tuesday morning, an SLSI inspector walks in unannounced** and asks for the release records and HACCP evidence for a specific batch — and the clock starts while she pulls threads from four systems. She also knows that if her released ABV is wrong, it doesn't just risk a spec failure — it flows straight into a **wrong duty calculation and a wrong label**, three violations from one number.

**Mental model:**
Compliance as **professional pride and safety guardianship** — *"my signature is on the release."* Her frame is the **gate**: nothing unsafe or out-of-spec passes, and she can prove it. Quality is not paperwork; paperwork is the *proof* of quality.

**Primary goals:**
Every batch released on solid, complete evidence; **batch genealogy retrievable in seconds**; and being **audit-ready by default**, so an unannounced inspector is a non-event rather than a fire drill.

**Key frustrations today:**
**Lab data fragmentation** (LIMS + instruments + paper + email COAs) makes batch-evidence assembly slow. **Sensory and some gate records are still on paper.** **COA reconciliation** against incoming materials is manual. And the **ABV triple-dependency** means her release errors have outsized, cross-functional consequences.

**What they fear:**
A **recall**, a **safety incident**, an **SLSI audit finding**, or **releasing a wrong ABV** that cascades into excise and labelling violations. Each of these has her name on it.

**What they wish they had:**
**One-click batch genealogy** ("show me everything about batch X"), **automatic spec-breach flagging before release**, **COA auto-matching**, and an **inspector-ready HACCP/release pack** generated on demand — so the Tuesday inspector gets a complete file in minutes.

**Success criteria for the AI system:**
- Time to assemble a batch's full QC evidence drops from hours to minutes.
- **Zero out-of-spec releases**; spec breaches flagged *before* sign-off, never after.
- An inspector request is satisfied with a generated pack the same day.
- The AI **never overrides her release decision** — it prepares, she approves.

**Persona goals → System goals mapping:**

| Persona goal | What the system must do to serve it |
|---|---|
| Release on complete evidence | **Auto-ingest LIMS/instrument/sensory data** per batch; show completeness before release |
| Retrieve batch story instantly | **One-click batch genealogy** keyed on batch ID |
| Catch breaches pre-release | **Spec-limit checking + trend/anomaly flags** on every batch |
| Protect the ABV datum | Single **authoritative ABV per batch**, shared to excise + label, with drift alerts |
| Survive the surprise inspection | **On-demand HACCP/release evidence pack** generation |
| Keep human judgement | **QA sign-off required** for release; AI assists, never auto-releases |

---

### PERSONA 4 — DISTRIBUTION / SALES OPERATIONS MANAGER (the throughput owner)

*"Roshan," ~36, runs dispatch and trade operations out of the Biyagama warehouse.*

**Who they are:**
He gets product out the gate and into the trade across the **active POS base (~1,130–3,000 licensed outlets, [VERIFY])**. He owns the **dispatch gate, FL-licence validation of the outlets he ships to, and the Excise transport permits** that must ride with every load — plus the returnable-empties float coming back the other way. **For him, compliance is a handbrake on his real job: velocity.**

**A day in their life (compliance-related):**
His pressure is throughput — trucks loaded, routes out, trade replenished, no stockouts. But every load is a compliance gate: is the **destination outlet's FL licence valid today** (not suspended for arrears, not expired)? Does a **transport permit** accompany the load, or will it be seized in transit? Is this volume into this outlet a normal pattern, or **diversion** waiting to happen? Today he validates outlet status more or less from memory and stale lists, because there's **no live link to Excise licence status** — so he's either slowing dispatch to check, or shipping on faith. The empties/deposit reconciliation is a separate running headache. His nightmare is simple: a **truck held at a checkpoint for a missing permit**, or a load delivered to a **suspended outlet**, turning a throughput win into a compliance liability.

**Mental model:**
Compliance as **friction that slows the line to trade** — the **handbrake**. He respects that it matters, but his instinct is "don't stop my trucks." The system wins him over only if it makes the gate *faster*, not slower.

**Primary goals:**
Get trucks out **fast *and* clean** — full throughput with **zero invalid-outlet dispatches and zero permit gaps**. A good day is every load shipped, none held, none mis-delivered.

**Key frustrations today:**
**Manual outlet-licence validation** with no live status feed; **paper transport permits**; and the **returnable-bottle deposit float** reconciliation that never quite closes.

**What they fear:**
A **load seizure for a missing/invalid permit**, **diversion liability** from shipping to the wrong outlet, and — the commercial sting — a **stockout at trade because a dispatch got held** for a compliance reason he could have cleared in advance.

**What they wish they had:**
A **pre-dispatch green/amber/red light** per load (outlet valid? permit present? volume normal?), **auto-generated transport permits**, and a **live outlet-status feed** — so compliance becomes a one-glance gate, not a brake.

**Success criteria for the AI system:**
- Dispatch throughput is **maintained or faster**, with the compliance check inline.
- **Zero dispatches to suspended/expired outlets**; permit gaps caught **before the truck leaves**.
- Diversion-pattern flags surface for review without slowing normal loads.

**Persona goals → System goals mapping:**

| Persona goal | What the system must do to serve it |
|---|---|
| Ship fast and clean | **Pre-dispatch validation** that returns a clear go/hold per load in seconds |
| Never ship to a bad outlet | **Canonical outlet master keyed on FL licence no.** with live validity status |
| Never lose a load to permits | **Transport-permit generation/checking** tied to each dispatch |
| Catch diversion early | **Volume/pattern anomaly flags** at outlet level, for review not auto-block |
| Close the empties loop | **Returnable-deposit float tracking** (shipped/returned/broken) |

---

### PERSONA 5 — REGULATORY AFFAIRS / EXPORT COMPLIANCE OFFICER (the diplomat)

*"Amaya," ~34, owns regulatory affairs and the export-compliance (FCAU export chain) function.*

**Who they are:**
She manages **FL-licence renewals, label conformance per market, NATA advertising exposure, and the FCAU export documentation chain** for the ~15% of output that ships abroad (Maldives, GCC/West Asia, EU/UK, Australia, South Asia). She is the company's **translator to a dozen moving regulatory regimes at once.** Compliance is her entire remit.

**A day in their life (compliance-related):**
She lives on deadlines and documents. She tracks **licence and permit renewal dates** — knowing the FL renewal is gated by tax clearance — in spreadsheets that don't warn her until it's nearly late. For every export consignment she hand-assembles a **per-destination dossier**: certificate of origin, free-sale/health certificate, allergen/ingredient declarations, **halal evidence for GCC markets**, and the **correct label artwork for that specific country** (a single beer can need 3–5 artwork versions). She rides the **FX-repatriation clock** on export proceeds. The scenario that wakes her: a **container held at destination Customs because one document is missing or a label element is wrong** — demurrage charges climbing, a buyer relationship souring, and an export order at risk. Domestically, she watches **NATA**, where what counts as "advertising or promotion" is interpreted broadly enough to be a live exposure.

**Mental model:**
Compliance as **navigating a maze whose walls keep moving** — she's the firm's **air-traffic controller for documents and deadlines**, clearing each shipment and licence through a different rulebook. Her frame is *"nothing leaves or lapses without the paperwork being right."*

**Primary goals:**
**Every shipment clears first time, every licence stays current, and no label surprises ship.** A good day is a container that sails through Customs and a renewal filed with weeks to spare.

**Key frustrations today:**
**Per-SKU × per-market artwork drift** with no single registry of "current legal label for market Y"; **dossier completeness checked by hand** per consignment; **renewal deadlines** tracked in spreadsheets and tangled with tax clearance; and **FX-repatriation timelines** monitored manually.

**What they fear:**
A **container held / shipment refused** for documentation, **demurrage and a lost export order**, a **NATA penalty**, or a **lapsed licence that halts the whole site** — the worst-case that reaches all the way back to Priyantha and Dinesh.

**What they wish they had:**
**Dossier auto-assembly with a per-destination completeness check** ("this consignment to GCC is missing its halal certificate"), a **deadline radar** for licences/permits/FX, and a **per-market label registry** that flags when an artwork is wrong or out of date *before* it ships.

**Success criteria for the AI system:**
- **Zero shipments held** for documentation or label errors.
- **Zero missed renewals**; every deadline surfaced with comfortable lead time.
- Label/artwork "correct for market" verified before packaging, not at the port.

**Persona goals → System goals mapping:**

| Persona goal | What the system must do to serve it |
|---|---|
| Every shipment clears first time | **Per-destination dossier checklist + completeness flagging** per consignment |
| No label surprises | **Per-SKU × per-market label registry** with pre-ship artwork verification |
| Never miss a renewal | **Licence/permit/FX deadline radar** with lead-time alerts + tax-clearance dependency |
| Stay inside NATA | **Ad/promotion review flagging** (with legal in the loop) |
| Protect export proceeds | **FX-repatriation deadline tracking** per consignment |

---

## CROSS-PERSONA SYSTEM REQUIREMENTS

### Shared needs across all personas
Regardless of role, every persona needs the system to:
1. **Run on one canonical data model** keyed to the Stage 0 "units of truth" (batch, LPA-removal, transport permit, FL outlet-licence, sticker serial, deposit position, export dossier) — so Finance, QA, Distribution and Regulatory are all reading the *same* reality, not four spreadsheets.
2. **Show its working.** Every figure, flag, and generated document must trace to a source (SAP record, lab result, scanned permit, sticker serial). Trust is the adoption currency — Priyantha must defend it to an Excise officer, Nilanthi to an SLSI inspector.
3. **Generate an on-demand, audit-ready evidence pack** in its domain (excise return + workpaper; HACCP/batch pack; dispatch manifest; export dossier; board posture summary).
4. **Alert by exception, with severity tiers** — surface only what needs action, route board-level risks up to the CTO, operational ones to the owner.
5. **Capture data passively / at source** (SAP feeds, line counts, sticker scans, OCR of paper permits/COAs/licences) — never push more keystrokes onto the plant floor.
6. **Respect role + language + device:** role-based views, **Sinhala/Tamil** where floor-facing, desktop for office personas, scan-friendly for the warehouse.
7. **Keep humans in the loop on consequential acts** — no autonomous filing, release, or dispatch-block; AI prepares and flags, a named human decides.

### Conflicts between personas
- **Dispatch velocity (Roshan) vs compliance completeness (Amaya/Priyantha).** Roshan wants the gate to wave trucks through; the compliance owners want every outlet-licence, permit, and (for export) dossier checked first. *Resolution: the check must be inline and sub-second, so completeness doesn't cost velocity — a "green light" not a "stop sign."*
- **QA release caution (Nilanthi) vs speed (Roshan/Dinesh).** A held batch ties up working capital and delays trade; Nilanthi will not release on incomplete evidence. *Resolution: make evidence assembly instant so the cautious decision is also the fast one.*
- **CTO's automation/ROI drive (Dinesh) vs QA & Excise insistence on human sign-off.** The highest-risk, highest-value tasks (duty declaration, batch release) are exactly the ones that *cannot* be fully automated. *Resolution: measure ROI as preparation-time saved and breaks-prevented, not decisions removed.*
- **Finance duty-timing prudence (Priyantha) vs sales push (Roshan).** Duty is pre-funded on removal; aggressive dispatch worsens the cash-timing gap. *Resolution: surface the duty-on-removal impact in the dispatch view so volume decisions are made with the liability visible.*
- **One dashboard (Dinesh) vs deep role tools (everyone else).** The CTO wants a single pane; the operators need dense, domain-specific workspaces. *Resolution: a layered IA — posture summary on top, drill-down into role consoles beneath.*

### Priority persona for MVP
**Build first for Persona 2 — the Excise Compliance Officer / Finance Lead (Priyantha).**

Why this persona unlocks the rest:
- **Highest value and highest pain converge here.** The ~Rs 64.8 bn excise liability plus the Fool Proof Sticker reconciliation is the company's largest, most penalty-prone, most manual workload — the literal centre of gravity from Stage 0.
- **Highest AI confidence.** Three-way reconciliation and serial-level sticker tracking are structured, rule-bound problems where AI/automation is rated HIGH — low risk of an embarrassing failure in the first build.
- **It produces the artefact the sponsor needs.** A live duty position and an auto-drafted return-with-workpaper is exactly the board-demoable proof Dinesh needs to justify the programme — so designing for Priyantha *is* serving the CTO.
- **Fastest, cleanest ROI signal.** "Monthly excise close went from days to hours with zero reconciliation breaks" is a single, measurable, finance-grade sentence the CTO can take to the Carson Cumberbatch board.

**Sequence implication:** MVP = Priyantha's excise + sticker reconciliation console, with Dinesh's posture dashboard as the thin executive layer on top of it. Nilanthi (batch/ABV evidence — feeds the duty figure), Roshan (outlet/permit gate), and Amaya (export/renewal radar) follow as the next increments, reusing the same canonical data model.

---

*End of Persona Definition document. Five personas + cross-persona requirements, grounded in Stage 0. **[VERIFY]** markers (POS count, Rs 64.8 bn liability, current SAP/LIMS maturity) carry forward into discovery before build.*
