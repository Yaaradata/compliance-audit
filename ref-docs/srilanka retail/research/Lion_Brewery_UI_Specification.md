# UI Specification
## AI-Powered Audit & Compliance Platform — Lion Brewery (Ceylon) PLC

**Builds on:** Stage 1 (Personas) + Stage 2 (System Capabilities C1–C36 + Data Model)
**Audience:** UI designers wireframing directly from this spec.
**Platform purpose:** one place for process, obligations, controls, evidence and ownership — leaders see posture at a glance, teams drill into what's failing and who must fix it, every claim links to proof. AI highlights what changed and why; people stay accountable for every decision.

**Design principles (referenced inline as `[P1]`…`[P7]`):**
`[P1]` Explainability first · `[P2]` Evidence one click away · `[P3]` Ownership explicit · `[P4]` Drill-down by default · `[P5]` Time-travel default · `[P6]` AI assists, human decides · `[P7]` Inspection-ready always.

**Persona key:** **P1** CTO/Leadership · **P2** Excise/Finance Lead · **P3** QA Manager · **P4** Distribution/Sales Ops · **P5** Regulatory/Export · **EHS** (Stage 0 function).

**Two global UI elements present on *every* screen (set the spec once, applied throughout):**
- **Time selector** in the command bar — defaults to **"Now,"** rewindable to any timestamp `[P5]`. Rewinding re-renders the *entire* screen as posture-at-that-moment (read-only, watermarked "AS AT <ts>").
- **"Generate Evidence Pack"** button in the command bar — context-aware (packs the current domain/batch/shipment), regulator-format selectable `[P7]`.

---

# PART 1 — SCREEN INVENTORY & GOAL MAPPING

| # | Screen name | Primary persona | Capabilities served | Goal it fulfils | Entry point |
|---|---|---|---|---|---|
| 1 | **Risk Posture Dashboard** | P1 | C32, C33, C34, C35, C30 | See overall compliance health across all domains at a glance | Login landing / home nav |
| 2 | **Domain Compliance Centre** (templated per domain) | P2/P3/P4/P5/EHS (by domain) | C29, C30, C31, C34, C35 + domain caps | See obligations, controls, findings, evidence status for one domain | Drill from dashboard domain tile |
| 3 | **Batch Compliance Tracker** | P3 | C1, C2, C3, C4, C5, C11, C13 | Follow one batch through every checkpoint, brewhouse → dispatch | Batch search / drill from QC or excise |
| 4 | **Excise Reconciliation Workbench** | P2 | C6, C7, C8, C9, C11, C17 | Four-way tie-out: volume vs sticker vs duty vs permits | Dashboard excise tile / month-end alert |
| 5 | **POS Licence Monitor** | P4 | C15, C16, C18 | Live FL-licence validity + dispatch eligibility across POS base | Dashboard distribution tile / pre-dispatch |
| 6 | **Export Document Bundle** | P5 | C20, C21, C22, C23 | Per-shipment doc checklist, completeness score, clearance gate | Dashboard export tile / shipment creation |
| 7 | **Finding Detail & Resolution** | Owner (P2–P5/EHS) + P1 oversight | C31, C30, C35 | Resolve one finding: what failed, proof, owner, action, history | Drill from any flag/finding feed |
| 8 | **Evidence Pack Builder** | P2/P3/P5 (all) | C29, C30 | One-tap regulator-ready evidence package | Global command-bar action / inspector trigger |
| 9 | **Audit Timeline** | P1/P2/P5 | C30, C29 | Compliance posture at any past point (time-travel) | Command-bar time selector / post-audit |
| 10 | **Obligation & Control Registry** | Compliance admin (P5/P1) | C36, C31, C30 | Master rules engine — obligations→controls→owners→evidence | Admin nav |

---

# PART 2 — SCREEN SPECIFICATIONS

---

### SCREEN 1 — RISK POSTURE DASHBOARD

**Primary persona:** P1 (CTO). **Secondary:** P2/P5 leads who want the cross-domain picture before their own console.
**Purpose in one sentence:** Let leadership answer "are we compliant right now, and where are we exposed?" in 60 seconds, with one click to the proof.
**Entry point:** Login landing / home.

*8am-Tuesday: Dinesh's eye goes first to the single posture score and the count of critical risks; within 30s he taps the one red domain tile to see what's failing and who owns it.*

**LAYOUT ZONES**
- **Command bar (top):** org/site filter (Biyagama is sole site, so defaults locked but shown), **time selector** `[P5]`, global search (batch ID / FL no. / CusDec ref), **Generate Evidence Pack (Board format)** `[P7]`.
- **Status band:** one **Overall Compliance Posture** indicator (band: Healthy / Watch / At-Risk / Critical) + three headline counters — *Open Criticals*, *Deadlines < 7 days*, *Excise duty position (live)* anchored to the ~Rs 64.8 bn annual liability context. Positioned top because it is the only thing a CTO must read before deciding whether to drill `[P4]`.
- **Primary panel:** a **domain tile grid** — one tile per pillar (Excise & Duty, Quality & Lab, Labeling, Distribution/POS, Export, Environmental/EHS, Governance). Each tile = domain name, status colour, trend arrow, top open finding, named owner `[P3]`. Tiles are the doorways.
- **Context panel (right):** **AI "What changed" feed** `[P1]` — chronological, each item one line of *change* + one line of *reasoning* ("Excise posture moved Watch→At-Risk because 12 removals on 14-Jun have no matching sticker serials — Rs 2.3 M unreconciled").
- **Action rail (right, below context):** Acknowledge, Assign, Escalate, Open domain.

**KEY VISUALIZATIONS**
- **Posture meter (gauge):** shows overall band from C32. *Good:* green "Healthy," no criticals. *Attention:* any Critical finding or a duty variance over threshold forces band to At-Risk/Critical regardless of average. AI contribution shown as "posture computed from 7 domains — tap to see weighting" `[P1]`.
- **Domain tile grid (status table):** entities = aggregated `Compliance_Finding`, `Excise_Declaration`, deadline metrics. *Good:* all green, owners assigned. *Attention:* amber/red tile, unassigned owner shown in red `[P3]`.
- **Deadline radar (timeline strip):** from C34 — licence/permit/return/FX deadlines on a 90-day horizon; tax-clearance-gated FL renewal flagged distinctly (it can halt production).
- **AI change feed (alert feed):** C35 severity-tiered; never a bare score — every entry carries a "because…" clause `[P1]`.

**INTERACTION PATTERNS**
- Tap a **domain tile** → Domain Compliance Centre (Screen 2) for that domain `[P4]`.
- Tap **posture meter** → weighting breakdown (which domains, which findings drove the band).
- Tap a **change-feed item** → jumps to the Finding Detail (Screen 7) or workbench that caused it.
- Tap **duty position** → Excise Reconciliation Workbench (Screen 4).
- **Escalate** on the rail → assigns to owner + notifies; logged to `Audit_Event` `[P6]`.
- Rewinding the **time selector** re-renders the whole dashboard as posture-as-at-then (e.g. "posture the morning before the June audit") `[P5]`.

**DESIGN RULES FOR THIS SCREEN**
- A single Critical anywhere **overrides** the average — the band can never show Healthy with an open Critical (no false comfort).
- Empty state (no data yet for a domain): tile shows "No data feed — <source> not connected," never green-by-default.
- Live regulator visit: a persistent banner "Inspection mode — Excise officer on site" can be toggled; **Generate Evidence Pack** is always one tap `[P7]`.
- Offline: last-synced timestamp shown in status band; tiles greyed with "as at <ts>" rather than implying live.

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C32 | Posture meter + domain tile grid |
| C33 | Hours-saved / risk-trend mini-metrics in status band (tap → ROI detail) |
| C34 | Deadline radar strip |
| C35 | AI change feed (severity-routed) |
| C30 | Every figure tappable to its `Audit_Event` lineage `[P2]` |

---

### SCREEN 2 — DOMAIN COMPLIANCE CENTRE (templated per domain)

**Primary persona:** the domain owner (P2 Excise, P3 Quality, P4 Distribution, P5 Export, EHS). **Secondary:** P1 drilling from a tile.
**Purpose in one sentence:** Give a domain owner the complete state of their domain — obligations, controls, open findings, evidence health — and a path to act.
**Entry point:** Domain tile (Screen 1) / direct nav.

*8am-Tuesday: Priyantha opens the Excise Centre, eye to "controls failing" and the open-findings list; within 30s he opens the top finding or jumps to the Workbench.*

**LAYOUT ZONES**
- **Command bar:** domain switcher, time selector `[P5]`, **Generate Evidence Pack (<domain> / regulator format)** `[P7]`.
- **Status band:** domain posture + counts — *Controls passing / total*, *Open findings by severity*, *Next deadline*. For Excise, the live duty position sits here.
- **Primary panel (tabbed):** **(a) Obligations** — list from the Registry filtered to this domain, each with mapped control + status; **(b) Controls** — each control's pass/fail + last evaluated; **(c) Findings** — open items with owner, severity, age; **(d) Evidence** — coverage map (which obligations have current proof). Tabs because owners move between "what must I do / is it working / what's broken / can I prove it."
- **Context panel (right):** selected item detail + **AI reasoning** for any flag `[P1]`.
- **Action rail:** Open finding · Reassign owner · Acknowledge · Open underlying workbench (Excise→Screen 4, Distribution→Screen 5, Export→Screen 6, Quality→Screen 3).

**KEY VISUALIZATIONS**
- **Obligation→Control status table:** entities = `Regulatory_Actor` obligations + control results. *Good:* all controls passing, evidence current. *Attention:* a control failing or evidence stale/missing (amber).
- **Findings drill-down list:** `Compliance_Finding` with owner `[P3]`, severity `[P1]` reasoning, age clock.
- **Evidence coverage map (status grid):** each obligation → has current evidence? *Attention:* "no current evidence" cells in red — these are the audit-scramble risks `[P2]`.
- **AI flag cards:** each shows conclusion + "because" + link to evidence — never standalone `[P1]`.

**INTERACTION PATTERNS**
- Tap obligation → its control + required evidence + owner.
- Tap finding → Finding Detail (Screen 7).
- Tap a failing control → the workbench that computes it.
- **Reassign owner** → picker + reason, logged `[P6][P3]`.
- Any evidence cell → opens the source artifact (batch sheet, permit, sticker order, COA) `[P2]`.

**DESIGN RULES FOR THIS SCREEN**
- This screen is a **template**; only the bound capabilities/entities change per domain — the IA never changes (supports the "adaptable by changing rules, not workflow" purpose).
- A finding with no owner renders the owner field red, blocking "close" `[P3]`.
- Empty/Quality domain when LIMS OPEN: Evidence tab shows source = "instrument export / OCR / manual" badges so users know provenance.
- Regulator visit: domain pack is one tap, pre-scoped to this domain + current time `[P7]`.

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C31 | Findings tab + CAPA status |
| C34 | "Next deadline" in status band |
| C35 | AI flag cards, severity-tagged |
| C29 | Domain evidence pack button |
| C30 | Evidence cells link to lineage |
| domain caps (C6/C16/C20/C24/C27…) | "Open workbench" rail action |

---

### SCREEN 3 — BATCH COMPLIANCE TRACKER

**Primary persona:** P3 (QA). **Secondary:** P2 (the batch's ABV/LPA feeds duty), P4 (dispatch readiness).
**Purpose in one sentence:** Follow one batch (e.g. `LL625-BIY-20260612-014`) through every compliance checkpoint from brewhouse to dispatch gate, with proof at each step.
**Entry point:** Batch search / drill from a QC flag, an excise removal, or a label check.

*8am-Tuesday: Nilanthi opens a batch pending release, eye to the checkpoint sequence and any red gate; within 30s she opens the failing gate's evidence and decides release or hold.*

**LAYOUT ZONES**
- **Command bar:** batch search, time selector (rewind to "before release") `[P5]`, **Generate Evidence Pack (Batch / SLSI format)** `[P7]`.
- **Status band:** batch identity (SAP process order, SKU, brew/packaged dates), **canonical ABV** (C2) with "signed by" `[P3]`, release status.
- **Primary panel:** a **horizontal checkpoint timeline** — Intake/COA → Mash/Brew → Fermentation (ABV origin) → Filtration → Bright-beer release (QC gate 3) → Packaging (label + Fool Proof Sticker) → Bright→bond → Removal/permit. Each node = pass/fail/pending + timestamp + owner. Sequence is left-to-right because the mental model is the line.
- **Context panel (right):** selected checkpoint detail — the QC results, the COA, the label image, the sticker serial range applied `[P2]`.
- **Action rail:** **Approve release / Hold / Override (with reason)** `[P6]`, Open lab result, View label check, View sticker reconciliation.

**KEY VISUALIZATIONS**
- **Checkpoint timeline (timeline):** entities = `Batch`, `QC_Test_Result`, `Material_Lot`, `Label_Version`, `Fool_Proof_Sticker_Inventory`, `Removal_Event`. *Good:* all nodes green, ABV in spec, sticker range matches units. *Attention:* a red node (e.g. micro fail, or sticker count ≠ units) halts the chain visually before release.
- **ABV triple-check card:** C9 — lab ABV vs label-declared vs excise basis side by side; *Attention:* divergence > 0.3% shown with AI note "label declares 4.8%, lab measured 5.1% — 0.3% over; affects duty + label" `[P1]`.
- **Sticker application card:** C11 — serials applied (`FPS-2026-AA0480001..AA0556800`) vs `units_packaged`; *Attention:* gap shown with count.
- **Label verification card:** C13 — on-pack image with pass/fail per element, AI bounding boxes + reasons `[P1]`.

**INTERACTION PATTERNS**
- Tap any checkpoint → evidence in context panel `[P2]`.
- **Approve release** → requires QA e-sign; if any gate red, approval is blocked and a reason-logged **Override** is the only path `[P6]`.
- Tap ABV card → Excise Workbench impact (Screen 4); tap sticker card → reconciliation detail.
- Rewind time → see the batch's posture "before release was signed" `[P5]`.

**DESIGN RULES FOR THIS SCREEN**
- AI **never** auto-releases; the release control is always a human e-sign `[P6]`.
- If ABV not yet signed, downstream excise/label checks show "pending authoritative ABV" rather than guessing.
- Empty/early batch: future checkpoints greyed "not yet reached," not failed.
- Recall scenario: a "Trace forward" action lists every dispatch/shipment drawing on this batch.
- Inspector visit: batch SLSI pack (genealogy + HACCP) in one tap, < 60s `[P7]`.

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C1 | The checkpoint timeline itself |
| C2 | Canonical ABV in status band, signed |
| C3 | Red checkpoint + pre-release flag |
| C4 | Approve/hold e-sign on action rail |
| C5 | FTR contribution badge |
| C11 | Sticker application card |
| C13 | Label verification card |

---

### SCREEN 4 — EXCISE RECONCILIATION WORKBENCH

**Primary persona:** P2 (Excise/Finance Lead) — **the MVP screen.** **Secondary:** P1 (duty position), resident Excise Unit (joint review).
**Purpose in one sentence:** Perform and prove the four-way tie-out — packaged/removed volume ↔ Fool Proof Sticker consumption ↔ duty declared ↔ transport permits — and draft the return.
**Entry point:** Dashboard duty tile / month-end alert / Domain Centre (Excise).

*8am-Tuesday near month-end: Priyantha opens the workbench, eye straight to the variance number and the exception queue; within 30s he opens the top break to see which removals lack sticker/permit matches.*

**LAYOUT ZONES**
- **Command bar:** period selector, time selector `[P5]`, **Generate Evidence Pack (Excise format)** `[P7]`, **Sync resident-Excise register**.
- **Status band:** **Live duty position** (C6) + **total variance** (expected vs declared) + reconciliation state (Matched / Breaks: N). The single most important number for this persona.
- **Primary panel:** a **four-column reconciliation diff** — Col 1 Removals (SAP volume/units, gate-pass GP refs) · Col 2 Stickers (serials applied/voided) · Col 3 Duty declared (`Excise_Declaration` lines) · Col 4 Permits (`Transport_Permit` per removal). Rows align by removal event; mismatched cells highlight. A diff layout because the job is literally "where do these four disagree."
- **Context panel (right):** selected break detail + **AI reasoning** ("Removal GP-20260614-0312: 24,000 units, no sticker serials linked → Rs 2.3 M at risk; permit present") `[P1]`.
- **Action rail:** Investigate · Link/resolve · Add note · **Draft return** · **Sign & file** (e-sign) `[P6]`.

**KEY VISUALIZATIONS**
- **Four-way reconciliation diff (reconciliation diff):** entities = `Removal_Event`, `Fool_Proof_Sticker_Inventory`, `Excise_Declaration`, `Transport_Permit`; metric = excise duty variance + sticker reconciliation (C2C). *Good:* all rows matched, variance ≈ 0. *Attention:* any row with a mismatched cell, any negative sticker balance (critical).
- **Duty position gauge:** C6 live, with "computed from N removals × current rate (config C36)" note `[P1]`.
- **Variance waterfall:** shows what drives expected-vs-declared gap (volume, ABV drift, sticker shortfall) — AI-attributed `[P1]`.
- **Return draft card:** C8 — preview with each line traceable to its removals `[P2]`.

**INTERACTION PATTERNS**
- Tap a mismatched cell → the underlying gate pass / sticker order / declaration line / permit `[P2]`.
- **Link/resolve** a break → attaches explanation, recomputes variance, logs `Audit_Event` `[P6]`.
- **Draft return** → generates `Excise_Declaration` (status draft) + workpaper; **Sign & file** requires Finance e-sign (AI never files) `[P6]`.
- Rewind time → "the duty position as at the last officer review" `[P5]`.

**DESIGN RULES FOR THIS SCREEN**
- The return cannot be signed while any **Critical** break (e.g. negative sticker balance) is open — hard block with reason shown.
- Every figure on screen is one tap from source — no asserted number without lineage `[P2]`.
- Joint-review mode (with resident Excise officer): a read-optimised, large-type variant with the diff and evidence side by side.
- Empty/early-month: shows accruing position, clearly "period in progress."

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C6 | Duty position gauge + status band |
| C7 | The four-way diff + exception queue |
| C8 | Return draft card + Sign & file |
| C9 | ABV-drift contribution in variance waterfall |
| C11 | Sticker column + negative-balance critical block |
| C17 | Permit column (missing-permit highlight) |

---

### SCREEN 5 — POS LICENCE MONITOR

**Primary persona:** P4 (Distribution/Sales Ops). **Secondary:** P2 (a sale to a suspended outlet is also a revenue/duty risk), P1.
**Purpose in one sentence:** See the live validity of every customer FL licence and whether a given outlet is eligible for dispatch right now.
**Entry point:** Dashboard distribution tile / pre-dispatch check / Domain Centre.

*8am-Tuesday: Roshan opens the monitor before loading trucks, eye to the "ineligible outlets with orders today" list; within 30s he holds or clears those loads.*

**LAYOUT ZONES**
- **Command bar:** FL-category filter (FL3/FL4/FL6/FL7/FL8/FL11/FL13A/FL22), district filter, time selector `[P5]`, **Generate Evidence Pack (Distribution)** `[P7]`, **Sync FL register**.
- **Status band:** **POS licence compliance rate** (valid/total active) + counts — *Suspended*, *Expiring < 30 days*, *Today's dispatches to ineligible outlets* (the action trigger).
- **Primary panel:** **outlet status table/map toggle** — rows = `Customer_Licence` (FL no., holder, category, district, valid-to, status, today's order?). Sortable by "has order + ineligible" to the top. Map view plots outlets by validity colour (useful for route planning). Table-first because the job is exception-clearing.
- **Context panel (right):** selected outlet — licence document image, validity history, dispatch history, AI note on any anomaly `[P1]`.
- **Action rail:** Hold dispatch · Clear dispatch (reason) · Flag for review · Open licence doc.

**KEY VISUALIZATIONS**
- **Outlet status table (status table):** entities = `Customer_Licence`, `Dispatch_Order`; metric = POS licence compliance rate. *Good:* all shipped-to outlets active+valid. *Attention:* red rows = suspended/expired with an order today.
- **Dispatch-eligibility chips (go/amber/hold):** C16 per outlet/load; amber = "expiring in 12 days," with AI reason `[P1]`.
- **Diversion-anomaly flags:** C18 — "Outlet FL4/WP/COL/2026/0473 ordered 4× its 90-day average" → review, not auto-block `[P6]`.
- **Expiry timeline:** licences expiring on a 90-day horizon.

**INTERACTION PATTERNS**
- Tap outlet → licence detail + document `[P2]`.
- **Hold/Clear dispatch** → updates the load's gate decision (feeds Screen 3/Distribution), reason logged `[P6]`.
- Tap a diversion flag → pattern detail with the comparison the AI used `[P1]`.
- Rewind time → "outlet validity as at the dispatch date" (proves you shipped to a then-valid outlet) `[P5]`.

**DESIGN RULES FOR THIS SCREEN**
- The system **recommends** hold for ineligible outlets but a human clears/holds with reason — never auto-cancels an order `[P6]`.
- FL-register sync staleness is shown explicitly; if sync failed, eligibility chips show "unverified — last sync <ts>," not green.
- Empty state: "No active orders to validate."
- Diversion flags are review-only (false positives must not block legitimate trade).

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C15 | Outlet status table keyed on FL no. |
| C16 | Dispatch-eligibility chips |
| C18 | Diversion-anomaly flags (review) |

---

### SCREEN 6 — EXPORT DOCUMENT BUNDLE

**Primary persona:** P5 (Regulatory/Export). **Secondary:** P2 (FX proceeds), P1.
**Purpose in one sentence:** For one shipment, see every required document, its completeness score, and whether it may clear the dispatch gate.
**Entry point:** Dashboard export tile / shipment creation / Domain Centre (Export).

*8am-Tuesday: Amaya opens a shipment due to sail, eye to the completeness score and the red "missing FCAU health certificate" row; within 30s she chases the gap or holds the container.*

**LAYOUT ZONES**
- **Command bar:** shipment selector (by `shipment_id` / ASYCUDA CusDec ref), destination filter, time selector `[P5]`, **Generate Evidence Pack (FCAU/Customs)** `[P7]`.
- **Status band:** shipment identity (destination, units, ASYCUDA CusDec no.), **completeness score** (docs present+valid / required), **clearance gate state** (Clear / Hold).
- **Primary panel:** **document checklist** — rows = required docs for *this destination* (commercial invoice, packing list, Certificate of Origin, **FCAU free-sale/health certificate**, ASYCUDA CusDec, Bill of Lading, destination import permit, label-conformity, **halal cert if GCC**). Each row: required? present? valid? view. Destination drives the required set (from Registry/config) — the screen adapts per market `[P4]`.
- **Context panel (right):** selected document preview + validity reasoning + label-conformity result for the destination `[P1]`.
- **Action rail:** Upload/attach · Mark obtained · **Clear shipment** (blocked if score < 100%) · Hold · FX deadline view.

**KEY VISUALIZATIONS**
- **Document checklist (document checklist):** entities = `Export_Document_Bundle`, `Document`, `Export_Shipment`; metric = export document completeness score. *Good:* 100%, all valid → gate Clear. *Attention:* any required doc missing/invalid → score < 100%, gate Hold with the gap named (e.g. "free-sale/health cert missing → HOLD").
- **Destination label-conformity card:** C21 — artwork vs destination rules, AI pass/fail per element `[P1]`.
- **ASYCUDA reconciliation strip:** C22 — CusDec lines vs shipment/batch; mismatch flagged.
- **FX deadline chip:** C23 — proceeds due date vs CBSL window.

**INTERACTION PATTERNS**
- Tap a doc row → preview + validity reasoning `[P2]`.
- **Mark obtained / Upload** → recomputes completeness score live.
- **Clear shipment** → only enabled at 100%; logs decision `[P6]`.
- Tap label-conformity → the per-market `Label_Version` checked.
- Rewind time → "the bundle state at the moment it cleared / was held" `[P5]`.

**DESIGN RULES FOR THIS SCREEN**
- Hard gate: **no Clear below 100%** of *required* docs (the "container held at Customs" scenario is exactly what this prevents).
- Required-doc set is destination-driven from the Registry — adding a market changes the rules, not the screen.
- Empty/new shipment: shows the full required set as "pending," score 0%.
- Inspector/Customs query: FCAU/Customs pack one tap `[P7]`.

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C20 | Document checklist + completeness score + gate |
| C21 | Label-conformity card |
| C22 | ASYCUDA reconciliation strip |
| C23 | FX deadline chip |

---

### SCREEN 7 — FINDING DETAIL & RESOLUTION

**Primary persona:** the finding's named owner (P2–P5/EHS). **Secondary:** P1 (oversight of criticals).
**Purpose in one sentence:** Show one finding in full — what failed, what the evidence proves, who owns it, what action is required, and the resolution history.
**Entry point:** Drill from any flag, finding feed, or domain Findings tab.

*8am-Tuesday: the owner opens an assigned critical, eye to "what failed + what's required"; within 30s they act (resolve/escalate/override) or open the evidence.*

**LAYOUT ZONES**
- **Command bar:** finding ID, time selector `[P5]`, **Generate Evidence Pack (this finding)** `[P7]`.
- **Status band:** finding title, severity (with AI reasoning) `[P1]`, **named owner** `[P3]`, age clock, CAPA status, due date.
- **Primary panel:** **What failed** (the control + the breach) → **Evidence** (the records that prove it: batch result, removal, sticker count, permit, licence, doc) `[P2]` → **Required action**. Top-to-bottom = the resolution narrative.
- **Context panel (right):** **Resolution history** (every status change, note, owner change) sourced from `Audit_Event` `[P5]`.
- **Action rail:** **Resolve (with evidence) · Escalate · Override (with reason) · Reassign owner** `[P6][P3]`.

**KEY VISUALIZATIONS**
- **Finding card (evidence card):** entities = `Compliance_Finding` + linked polymorphic entity. AI severity + "because" + the exact metric breach (e.g. "sticker variance −1,200 units").
- **Evidence list:** each item opens the real artifact `[P2]`.
- **Resolution timeline:** the CAPA journey, immutable `[P5]`.

**INTERACTION PATTERNS**
- Tap evidence item → source record `[P2]`.
- **Resolve** → must attach resolving evidence; recomputes the domain/posture; logs `[P6]`.
- **Override** → requires typed reason; the finding stays visible as "overridden by <name>, <reason>" (never silently cleared) `[P6]`.
- **Reassign** → owner picker + reason `[P3]`.

**DESIGN RULES FOR THIS SCREEN**
- A finding **cannot be closed without** (a) an owner and (b) resolving evidence `[P2][P3]`.
- Override never deletes — it annotates, preserving the audit trail.
- Empty state: n/a (screen only exists for a real finding).
- During regulator visit: the finding + its evidence is itself a one-tap pack `[P7]`.

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C31 | The finding + CAPA lifecycle |
| C35 | Severity + routing context |
| C30 | Resolution history from audit log |

---

### SCREEN 8 — EVIDENCE PACK BUILDER

**Primary persona:** P2/P3/P5 (any owner). **Secondary:** P1.
**Purpose in one sentence:** Generate a regulator-ready evidence package — per domain, per batch, or per shipment — in under 60 seconds, formatted for the right authority.
**Entry point:** Global command-bar **Generate Evidence Pack** on any screen / "Inspection mode" trigger.

*Inspector walks in: the user taps Generate Evidence Pack from wherever they are; this screen opens pre-scoped to the current context; they pick the regulator format and produce the pack.*

**LAYOUT ZONES**
- **Command bar:** scope selector (Domain / Batch / Shipment / Period), **regulator-format selector (Excise / SLSI / FCAU / Customs / NATA / CEA / Board)**, time selector ("pack as at <ts>") `[P5]`.
- **Status band:** what's in scope + estimated completeness of the pack before generation.
- **Primary panel:** **pack contents preview** — the records that will be included, grouped by the chosen regulator's expected structure; any gaps flagged (e.g. "1 COA missing for batch X").
- **Context panel (right):** selected item preview + provenance `[P2]`.
- **Action rail:** **Generate · Add item · Exclude (with reason) · Export (PDF/bundle)**.

**KEY VISUALIZATIONS**
- **Pack contents checklist (document checklist):** entities = `Evidence_Pack`, `Document`, plus the domain records. *Good:* complete, all items current. *Attention:* gap rows in red, with what's missing and where to get it.
- **Format template preview:** shows the pack laid out as the chosen regulator expects (Excise return + workpaper + sticker reconciliation; SLSI = batch genealogy + HACCP; FCAU/Customs = the document bundle).
- **Provenance badges:** each item shows its source + hash (so the pack is defensible) `[P2]`.

**INTERACTION PATTERNS**
- Pick scope + format → contents auto-assemble (C29).
- **Generate** → creates an immutable `Evidence_Pack` with hash, logged to `Audit_Event` `[P6]`.
- **Exclude an item** → requires reason (so the pack is honest about what was left out).
- Time selector → "pack as the posture stood before the audit / before release" `[P5]`.

**DESIGN RULES FOR THIS SCREEN**
- The pack is a **point-in-time, hashed** artifact — regenerating later produces a new versioned pack, never silently overwrites `[P5]`.
- If any in-scope evidence is missing, the pack is still generable but **stamps the gaps** — never fabricates `[P1]`.
- < 60-second target: pre-scoping from the calling screen is mandatory (no blank start).
- Offline: can assemble from last-synced data, clearly watermarked "as at <ts>."

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C29 | The whole screen (scope + format + generate) |
| C30 | Hashing + audit-log entry per pack |

---

### SCREEN 9 — AUDIT TIMELINE

**Primary persona:** P1/P2/P5. **Secondary:** Internal Audit.
**Purpose in one sentence:** Rewind compliance posture to any past moment to prepare for, or review after, an audit — the platform's time-travel mode made explicit.
**Entry point:** Command-bar time selector (deep) / post-audit review / "what did we know when?"

*Post-audit: the team opens the timeline to show "posture the day before the Excise review," proving what was known and signed when.*

**LAYOUT ZONES**
- **Command bar:** date/time scrubber (primary control here), domain filter, **Generate Evidence Pack (as at selected time)** `[P7][P5]`.
- **Status band:** posture **as at the selected timestamp** (watermarked AS AT).
- **Primary panel:** a **horizontal timeline** of compliance events — releases, declarations filed, findings opened/closed, licences renewed, shipments cleared, overrides — each a node. Scrubbing moves the "as at" line; the whole screen reflects that point.
- **Context panel (right):** the selected event's detail + who decided what + the evidence as it existed then `[P2]`.
- **Action rail:** Compare two points · Open event · Generate as-at pack.

**KEY VISUALIZATIONS**
- **Event timeline (timeline):** entities = `Audit_Event` (the spine), referencing all others. *Good:* continuous, every consequential act logged with an owner. *Attention:* gaps, overrides (shown distinctly), or clustered findings around a date.
- **Posture-at-time meter:** the Screen-1 gauge re-rendered for the selected moment.
- **Diff between two timestamps:** "what changed between the pre-audit snapshot and now" — AI-summarised `[P1]`.

**INTERACTION PATTERNS**
- Scrub the timeline → entire app context shifts to that moment (read-only) `[P5]`.
- Tap an event → its detail + decision-maker + then-current evidence.
- **Compare** two points → change list with AI explanation `[P1]`.
- Generate **as-at pack** → evidence exactly as it stood (key for proving good-faith at audit) `[P7]`.

**DESIGN RULES FOR THIS SCREEN**
- Past views are **strictly read-only** and watermarked — no editing history (immutability is the point).
- Overrides and reasons are always visible on the timeline (accountability) `[P6]`.
- Empty early-life: timeline starts at first logged event.

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C30 | Timeline is the audit-log made visual |
| C29 | As-at evidence pack generation |

---

### SCREEN 10 — OBLIGATION & CONTROL REGISTRY

**Primary persona:** Compliance admin (P5/P1). **Secondary:** domain owners reviewing their obligations.
**Purpose in one sentence:** Maintain the master mapping of regulatory obligations → controls → owners → required evidence — the rule engine that makes the platform adaptable by changing rules, not workflow.
**Entry point:** Admin nav.

*8am-Tuesday after a duty hike: the admin opens the Registry, edits the beer duty rate/version, and the change cascades to the Excise workbench and posture — without touching any other screen.*

**LAYOUT ZONES**
- **Command bar:** jurisdiction/industry filter, **add obligation**, version selector, time selector `[P5]`, **Export ruleset**.
- **Status band:** ruleset version + effective date + "controls without owners" / "obligations without evidence rule" counts (gaps in the rulebook itself).
- **Primary panel:** **obligation→control→evidence table** — rows = obligations (linked `Regulatory_Actor`), each mapped to control(s), owner role, required evidence type, frequency, and the capability that evaluates it (C-id). This is the system's source of truth for *what compliant means* `[P3]`.
- **Context panel (right):** selected obligation detail — legal reference, the config values (e.g. duty rate, label mandatory elements), version history `[P5]`.
- **Action rail:** Edit obligation · Map control · Assign owner · Set evidence rule · **Publish version**.

**KEY VISUALIZATIONS**
- **Obligation→control matrix (status table):** entities = `Regulatory_Actor` obligations, controls, evidence requirements; ties to C36 config. *Good:* every obligation has a control, an owner, an evidence rule, and a current config value. *Attention:* obligation with no control/owner/evidence = a hole in the rulebook (red).
- **Config version panel:** duty tables, label rules, thresholds — each versioned with effective dates `[P1]` (so a flagged value can always be traced to the rule and version that produced it).
- **Change-impact preview:** before publishing, shows which screens/metrics a rule change will affect `[P1]`.

**INTERACTION PATTERNS**
- Edit a config value (e.g. duty rate) → **change-impact preview** → **Publish version** → cascades to live screens; old version retained for time-travel `[P5][P6]`.
- Map/assign owner → propagates "named owner" everywhere that obligation surfaces `[P3]`.
- Tap an obligation → every finding/control/evidence currently bound to it.

**DESIGN RULES FOR THIS SCREEN**
- Publishing a new ruleset version **never** rewrites history — past evaluations stay tied to the version in force then (essential for audit defence) `[P5]`.
- An obligation cannot be set "active" without a control, an owner role, and an evidence rule `[P3]`.
- This screen is the **adaptability lever**: standing up a new industry/jurisdiction = new obligations + controls here, with no change to Screens 1–9.
- Restricted to admin role; all edits logged to `Audit_Event` `[P6]`.

**CAPABILITY → UI MAPPING**
| Capability | How it surfaces |
|---|---|
| C36 | Config/versioned ruleset management |
| C31 | Obligations link to their findings |
| C30 | All edits + versions logged |

---

*End of UI Specification. Part 1 = screen inventory contract (10 screens). Part 2 = full specs with layout zones, visualizations (entities + derived metrics from Stage 2), interaction patterns, design rules, and capability→UI mapping. Every screen carries the global time selector `[P5]` and one-tap evidence pack `[P7]`; every AI output shows its reasoning `[P1]`; every status links to proof `[P2]`; every finding/obligation names an owner `[P3]`; and every AI flag resolves to a human approve/escalate/override `[P6]`. `[VERIFY]` items (POS count, current duty rate, SAP/LIMS maturity, ~Rs 64.8 bn liability) remain inputs to discovery before build.*
