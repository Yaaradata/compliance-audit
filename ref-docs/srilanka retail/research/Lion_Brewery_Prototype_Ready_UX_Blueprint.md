# Prototype-Ready UX Blueprint
## AI-Powered Audit & Compliance Platform — Lion Brewery (Ceylon) PLC — **MVP**

**Builds on:** Stage 3 UI Specification (10 screens, capabilities C1–C36).
**Audience:** the designer opening Figma + the engineer wiring interactions + the presenter running the demo.

**Design tokens used throughout (define once in Figma):**
Surfaces — `--bg-app` (page), `--surface-card`, `--surface-raised`, `--surface-overlay` (slide-overs).
Status — `--status-healthy` (green), `--status-watch` (amber), `--status-risk` (orange), `--status-critical` (red), `--status-neutral` (grey).
Text — `--text-primary`, `--text-secondary`, `--text-inverse`.
**AI** — `--ai-accent` (violet) — *every AI-authored element uses this colour + a small ✦ glyph so AI output is always visually distinct from system data.* `[P1]`
Grid — 1440px desktop primary, 12-col, 24px gutters. Mobile 390px secondary.

**Reused demo dataset (consistent across all parts — no lorem ipsum):**
- Site: **Biyagama** · Annual excise liability context: **Rs 64.8 bn** · Live June-2026 duty position: **Rs 5.41 bn**.
- Hero batch: **`LL625-BIY-20260612-014`** — Lion Lager 625 ml, SAP process order **4500087321**, signed ABV **4.8%**.
- Hero AI finding (Excise/sticker): **12 removals on 14-Jun — 28,800 units dispatched vs 27,600 Fool Proof Stickers applied → 1,200-unit gap ≈ Rs 0.9 M at risk.** Period variance total: **Rs 2.34 M**.
- Hero licence (Distribution): **`FL4/WP/COL/2026/0473`** — ABC Wine Stores (Pvt) Ltd, Colombo 04, **valid to 2026-06-19 (expires in 3 days)**.
- Regulators named: **Excise Department** (resident Excise Unit on-site at Biyagama), **SLSI**, **NATA**, **CEA**, **Sri Lanka Customs/ASYCUDA**, **FCAU** (export health certs).
- Owners: Priyantha Silva (Excise/Finance), Nilanthi Perera (QA), Roshan Fernando (Distribution), Amaya Jayasuriya (Regulatory/Export).

---

# PART 1 — MVP CUT DECISIONS

*Lens applied to each screen: the CTO has 8 minutes and one laptop tomorrow — which screens tell the complete value story, which are noise?*

| Screen (Stage 3) | Decision | Rationale |
|---|---|---|
| 1. Risk Posture Dashboard | **IN — standalone** | The demo's opening and the CTO's daily home. The "see risk at a glance" promise lives here. Non-negotiable. |
| 2. Domain Compliance Centre | **COLLAPSED → "Domain Drill" slide-over off the Dashboard** | Full obligations/controls/findings/evidence tabs per domain is v2 depth. For MVP the dashboard tile opens a slide-over showing that domain's open findings + owners + evidence links — enough for the F1/F6 drill, zero extra navigation weight. |
| 3. Batch Compliance Tracker | **IN — standalone** | Proves "every claim links to proof" at the batch level and carries the QA flow (F3) + the excise→batch trace (F2). The SLSI-inspector story needs it. |
| 4. Excise Reconciliation Workbench | **IN — standalone** | The MVP's centre of gravity (see below). The four-way tie-out + auto-drafted return is the Rs 64.8 bn value story. |
| 5. POS Licence Monitor | **IN — standalone (lightweight)** | Carries the "block a bad dispatch before it happens" beat (F4) and shows breadth beyond excise. Built lean: table + eligibility chips, map view deferred. |
| 6. Export Document Bundle | **DEFERRED → v2** | Export is ~15% of volume and not the CTO's core time/cost pain. The completeness-gate concept is mentioned in the close but not built; keeps the MVP focused on the domestic excise core. |
| 7. Finding Detail & Resolution | **COLLAPSED → reusable "Finding" slide-over** | Functionally always a drill view (never a nav destination). As a slide-over it serves F1 (assign owner) and F3 (escalate) without being a standalone page. |
| 8. Evidence Pack Builder | **IN — standalone (modal-style full panel)** | The single most persuasive demo moment ("2 days → 8 seconds"). Carries F2 and F5. Essential. |
| 9. Audit Timeline | **DEFERRED → v2 (global time selector retained, limited)** | Full point-in-time reconstruction is heavy. MVP keeps the command-bar **rewind to key snapshots** (release / declaration / dispatch events) but defers the dedicated timeline screen. The principle survives; the screen waits. |
| 10. Obligation & Control Registry | **IN — standalone (read-mostly + duty-config edit)** | Two MVP jobs: (a) keep the duty rate config-driven, never hard-coded (C36); (b) give the close its "adaptable across industries — change the rules, not the workflow" proof point. Built read-mostly with one editable path (duty-rate version). |

**Tally:**
- **Standalone MVP screens: 6** — Risk Posture Dashboard, Batch Compliance Tracker, Excise Reconciliation Workbench, POS Licence Monitor, Evidence Pack Builder, Obligation & Control Registry.
- **Collapsed drill views: 2** — Domain Drill slide-over, Finding slide-over.
- **Deferred to v2: 2** — Export Document Bundle, Audit Timeline (screen).

**Centre of gravity — the one screen that, if perfect, gets a yes:**
**The Excise Reconciliation Workbench (Screen 4).** It is the only screen that touches the Rs 64.8 bn liability directly, turns the most painful manual job (the four-way tie-out + Fool Proof Sticker reconciliation) into a live, explainable view, and produces the auto-drafted return. If the variance is right, the AI reasoning is trustworthy, and the Excise evidence pack generates in 8 seconds, the CTO has seen the whole thesis.

---

# PART 2 — WIREFRAME BLUEPRINTS

*Per screen, the "first-10-seconds" job sits top-left or centre; everything else is subordinate.*

---

### WIREFRAME — RISK POSTURE DASHBOARD

**Screen type:** Full page. **Viewport:** Desktop primary / mobile secondary.
**Grid:** 12-col. Left nav 2-col (collapsible to icon rail). Main 10-col, split: command bar (full width), status band (full width), primary tile grid (7-col), AI feed + action rail (3-col right).

**First-10-seconds job:** read the **posture band + 3 counters** (top-centre) and spot the **red domain tile**.

**ZONE-BY-ZONE LAYOUT**

**Z1 — Left nav rail**
- Dimensions: ~16% w × 100% h · Position: left · Background: `--surface-raised`.
- Contents (reading order): Lion logo; nav items (icon+label): **Dashboard** (active), Excise Workbench, Batches, POS Licences, Evidence Packs, Registry; bottom: user chip "Dinesh — CTO", language toggle EN/සිං/தமிழ்.
- State: Dashboard highlighted. Interactive: yes — each routes to its screen.

**Z2 — Command bar**
- Dimensions: ~84% w × 8% h · Position: top · Background: `--surface-card`.
- Contents: global search input (placeholder "Search batch ID, FL no., CusDec ref…"); **Time selector** pill (default "Now ▾", rewind to snapshots) `[P5]`; right-aligned **"Generate Evidence Pack — Board ▾"** primary button `[P7]`; "Inspection mode" toggle.
- Interactive: search → results overlay; time pill → snapshot list; pack button → Evidence Pack Builder.

**Z3 — Status band**
- Dimensions: ~84% w × 14% h · Position: below command bar · Background: `--surface-card`, left accent bar coloured by posture.
- Contents (left→right, 4 cards):
  * **Posture meter** (gauge) — label "Overall Compliance Posture", value **"AT-RISK"**, `--status-risk`. Caption "computed from 7 domains ✦ tap for weighting" (`--ai-accent`). Interactive: yes → weighting popover `[P1]`.
  * **Counter card** — "Open Criticals" — **1** — `--status-critical`. Interactive → filters tile grid to critical.
  * **Counter card** — "Deadlines < 7 days" — **3** — `--status-watch`. Interactive → deadline list.
  * **Counter card** — "Duty position — Jun 2026" — **Rs 5.41 bn** — caption "of ~Rs 64.8 bn annual" — `--status-neutral`. Interactive → Excise Workbench.

**Z4 — Primary panel: domain tile grid**
- Dimensions: ~58% w × 70% h · Position: centre-left · Background: `--bg-app`, tiles `--surface-card`.
- Contents: 7 domain tiles (2 cols × 4 rows), each: domain name; status dot; trend arrow; one-line top finding; **owner chip** `[P3]`. Realistic states:
  * **Excise & Duty** — `--status-risk` — "Sticker variance 1,200 units ≈ Rs 0.9 M" — *Priyantha Silva*. Interactive → Domain Drill (Excise).
  * **Quality & Lab** — `--status-watch` — "Batch LL625-…-014 held: micro retest pending" — *Nilanthi Perera*.
  * **Distribution / POS** — `--status-watch` — "3 outlets expiring < 7 days" — *Roshan Fernando*.
  * **Labeling & Marking** — `--status-healthy` — "All artworks current" — *Amaya Jayasuriya*.
  * **Export** — `--status-healthy` — "No active holds" — *Amaya Jayasuriya*.
  * **Environmental / EHS** — `--status-healthy` — "EPL valid to 2027-03" — *EHS Lead*.
  * **Governance** — `--status-healthy` — "No open board items" — *Internal Audit*.
- Interactive: each tile → Domain Drill slide-over (Z6).

**Z5 — Context panel: AI "What changed" feed**
- Dimensions: ~26% w × 56% h · Position: right · Background: `--surface-card`.
- Contents: heading "✦ What changed" (`--ai-accent`); chronological items, each 2 lines — *change* + *because*:
  * "Excise → AT-RISK · because 12 removals (14-Jun) show 28,800 units vs 27,600 stickers — 1,200 gap ≈ Rs 0.9 M." `[P1]`
  * "Distribution → WATCH · because FL4/WP/COL/2026/0473 expires in 3 days."
- Interactive: item → jumps to the causing finding/workbench.

**Z6 — Domain Drill slide-over** *(collapsed Domain Compliance Centre; overlay, see its own wireframe below)*

**Z7 — Action rail** (within context panel footer)
- Buttons: Acknowledge · Assign · Escalate. Interactive: act on selected feed item, logged `[P6]`.

**COMPONENT SPECIFICATIONS**
- **Posture meter** — semicircular gauge — renders C32 band + driver count — click → weighting popover listing domains and the findings that set the band — empty: "No data feeds connected" (grey, never green) — error: "Posture stale — last sync 06:00."
- **Domain tile** — card — renders domain status + top `Compliance_Finding` + owner — click → Domain Drill — empty: "No findings" (healthy green) — error: red border "feed disconnected."
- **AI change-feed item** — list row, `--ai-accent` left border — renders change + reasoning string — click → source — empty: "No changes in window."

**RESPONSIVE BEHAVIOUR**
- Tablet: AI feed (Z5) drops below the tile grid; nav collapses to icon rail.
- Mobile: status band becomes a horizontal swipe of the 4 cards; tile grid single-column ordered by severity (Excise first); AI feed accessible via a "✦ Changes" tab. Priority content = posture band + the single worst tile.

**ANNOTATIONS**
[1] A single open Critical forces the band to AT-RISK/CRITICAL even if averages are green — hard rule, no "false green."
[2] Owner chip is mandatory; if null, render red "UNASSIGNED" and surface in Open-Criticals filter `[P3]`.
[3] Every numeric (duty position, counts) is click-through to lineage `[P2]`.
[4] AI elements must use `--ai-accent` + ✦; never style AI output like system data `[P1]`.

---

### WIREFRAME — EXCISE RECONCILIATION WORKBENCH  *(centre of gravity)*

**Screen type:** Full page. **Viewport:** Desktop primary (data-dense; mobile read-only summary).
**Grid:** 12-col. Left nav 2-col. Main 10-col: command bar (full), status band (full), four-column diff (7-col), break/context panel (3-col right), action rail (footer of context).

**First-10-seconds job:** read the **total variance** (status band) and see the **exception count**; eye then to the top red row of the diff.

**ZONE-BY-ZONE LAYOUT**

**Z1 — Left nav** (as Dashboard; "Excise Workbench" active).

**Z2 — Command bar**
- Contents: **Period selector** ("June 2026 ▾"); Time selector `[P5]`; **"Sync resident-Excise register"** button (shows "last synced 07:40"); **"Generate Evidence Pack — Excise ▾"** primary `[P7]`.

**Z3 — Status band**
- 3 cards: **Live duty position** "Rs 5.41 bn" (gauge, caption "✦ computed from 1,287 removals × current rate v2026.3" `--ai-accent`) `[P1]`; **Total variance** "Rs 2.34 M" `--status-risk` (caption "expected − declared"); **Reconciliation state** "Breaks: 4 (1 critical)" `--status-critical`.

**Z4 — Primary panel: four-column reconciliation diff**
- Background: `--surface-card`; rows align by removal event.
- Column headers: **① Removals (SAP)** · **② Stickers** · **③ Duty declared** · **④ Permits**.
- Sample rows (top = worst):
  * Row A `--status-critical`: ① GP-20260614-0312 · 28,800 units / 18,000 L · ② **27,600 applied (−1,200)** · ③ declared on 27,600 · ④ permit TP-…-0312 ✓. Mismatched cell = ② highlighted red.
  * Row B `--status-watch`: ① GP-20260612-0288 · batch LL625-…-014 · ② serials match · ③ ✓ · ④ ✓ — but **✦ ABV drift note** on ① (lab vs declared).
  * Rows C…: matched (green ticks).
- Interactive: any cell → opens its source in context panel `[P2]`; row → loads break detail.

**Z5 — Context panel: break detail**
- Contents for selected Row A: heading "Break — GP-20260614-0312"; **✦ AI reasoning** (`--ai-accent`): "28,800 units dispatched but only 27,600 sticker serials (FPS-2026-AA…) linked. 1,200 units unaccounted ≈ Rs 0.9 M duty at risk. Likely cause: stickers from order FPS-2026-AB not yet scanned at Line 2." `[P1]`; evidence links: "View sticker order", "View batch", "View gate pass."
- Below: **Variance waterfall** (mini chart) attributing Rs 2.34 M → Rs 0.9 M sticker shortfall + Rs 1.1 M ABV drift (Row B) + Rs 0.34 M timing.

**Z6 — Action rail (context footer)**
- Buttons: **Investigate** · **Link / resolve** · **Add note** · **Draft return** · **Sign & file** (disabled while critical break open — tooltip "Resolve critical break to file") `[P6]`.

**COMPONENT SPECIFICATIONS**
- **Four-way diff grid** — aligned reconciliation table — renders `Removal_Event` × `Fool_Proof_Sticker_Inventory` × `Excise_Declaration` × `Transport_Permit`; metric = excise duty variance + sticker reconciliation — cell click → source artifact — empty: "Period in progress — no removals yet" — error: red "Excise register sync failed — figures may not tie."
- **Duty gauge** — renders C6 live; caption shows rate version (config C36) — never a bare number `[P1]`.
- **Variance waterfall** — bar attribution — AI-authored, `--ai-accent` — click bar → the rows driving it.
- **Return draft card** (opens on "Draft return") — preview of `Excise_Declaration` with each line traceable to removals — Sign requires Finance e-sign.

**RESPONSIVE BEHAVIOUR**
- Tablet: diff columns become horizontally scrollable; context panel becomes a bottom sheet.
- Mobile: read-only — shows variance + breaks list only; "Sign & file" disabled on mobile (deliberate; filing is a desk action).

**ANNOTATIONS**
[1] **Hard block:** return cannot be signed while any Critical break (e.g. negative sticker balance) is open.
[2] Joint-review mode toggle → large-type 2-pane (diff + evidence) for sitting beside the resident Excise officer.
[3] Every figure one tap from source — no asserted number without lineage `[P2]`.
[4] AI cause-hypothesis ("likely cause…") must be labelled a hypothesis, not asserted fact `[P1][P6]`.

---

### WIREFRAME — BATCH COMPLIANCE TRACKER

**Screen type:** Full page. **Viewport:** Desktop primary / mobile (timeline scroll).
**Grid:** 12-col. Nav 2-col. Main 10-col: command bar (full), status band (full), horizontal checkpoint timeline (full-width, 7-row tall), context panel (3-col right), action rail (context footer).

**First-10-seconds job:** see the **batch identity + release status** and spot the **red checkpoint** in the timeline.

**ZONE-BY-ZONE LAYOUT**

**Z1 — Left nav** ("Batches" active).

**Z2 — Command bar**
- Batch search ("LL625-BIY-20260612-014"); Time selector ("rewind to before release") `[P5]`; **"Generate Evidence Pack — SLSI ▾"** `[P7]`.

**Z3 — Status band**
- Cards: batch ID `LL625-BIY-20260612-014`; SKU "Lion Lager 625 ml"; SAP order **4500087321**; **Canonical ABV 4.8% ✦ signed by Nilanthi Perera 12-Jun 09:42** (`--ai-accent` for the AI-validated tag) `[P3]`; **Release status: HELD** `--status-watch`.

**Z4 — Primary panel: checkpoint timeline (horizontal)**
- 8 nodes left→right, each = name · pass/fail/pending dot · timestamp · owner:
  Intake/COA ✓ · Mash/Brew ✓ · **Fermentation (ABV origin) ✓** · Filtration ✓ · **Bright-beer release ⛔ (micro retest pending)** `--status-watch` · Packaging (label + sticker) — pending · Bright→bond — pending · Removal/permit — pending.
- The red/amber node visually halts the chain (downstream greyed "not yet reached").
- Interactive: node → context panel evidence.

**Z5 — Context panel (selected node = Bright-beer release)**
- QC results list: ABV 4.8% ✓ · CO₂ ✓ · **Micro: retest pending** ⛔ · Fill volume ✓.
- **✦ AI note:** "Release blocked: microbiological result not yet posted from LIMS/instrument. First-pass plate flagged for re-read. Cannot release until micro = pass." `[P1]`
- Cards below: **Sticker application** (serials FPS-2026-AA0480001..AA0556800 vs 76,800 units — match ✓) `[P2]`; **Label verification** (image, all elements ✓).

**Z6 — Action rail**
- **Approve release** (disabled — tooltip "Micro result pending") · **Hold** (active) · **Order retest** · **Escalate** · **Override (reason required)** `[P6]`.

**COMPONENT SPECIFICATIONS**
- **Checkpoint timeline** — horizontal stepper — renders `Batch` + `QC_Test_Result` + `Material_Lot` + `Label_Version` + `Fool_Proof_Sticker_Inventory` + `Removal_Event` — node click → evidence — empty: future nodes greyed — error: "instrument feed offline" badge on node.
- **ABV triple-check card** (in context) — lab vs label vs excise basis — flags > 0.3% divergence `--ai-accent`.
- **Release control** — e-sign button — blocked while any node red; override annotates, never deletes `[P6]`.

**RESPONSIVE BEHAVIOUR**
- Tablet: timeline scrolls horizontally; context panel bottom sheet.
- Mobile: vertical stepper; release actions visible but e-sign requires confirmation step. Priority = status + the blocking node.

**ANNOTATIONS**
[1] AI never auto-releases; release is always human e-sign `[P6]`.
[2] "Trace forward" action (in command bar overflow) → every dispatch/shipment using this batch (recall readiness).
[3] If ABV unsigned, downstream excise/label cards show "pending authoritative ABV," never a guess.

---

### WIREFRAME — POS LICENCE MONITOR  *(lightweight)*

**Screen type:** Full page. **Viewport:** Desktop primary / mobile (exception list).
**Grid:** 12-col. Nav 2-col. Main 10-col: command bar (full), status band (full), outlet status table (7-col), context panel (3-col right).

**First-10-seconds job:** read **"dispatches to ineligible outlets today"** counter and see the amber/red rows sorted to top.

**ZONE-BY-ZONE LAYOUT**

**Z1 — Left nav** ("POS Licences" active).

**Z2 — Command bar**
- FL-category filter chips (FL3/FL4/FL6/FL7/FL8/FL11/FL13A/FL22); district filter; Time selector `[P5]`; "Sync FL register" (last synced 06:00); **"Generate Evidence Pack — Distribution ▾"** `[P7]`.

**Z3 — Status band**
- Cards: **POS licence compliance rate "99.7% (2,792 / 2,800 active)"** `--status-watch` `[VERIFY count]`; **Suspended: 2**; **Expiring < 7 days: 3**; **Today's dispatches to ineligible outlets: 1** `--status-risk` (the action trigger).

**Z4 — Primary panel: outlet status table**
- Columns: FL no. · Holder · Category · District · Valid-to · Status · Today's order? · Eligibility chip.
- Sorted "has order + ineligible" first. Sample top rows:
  * **FL4/WP/COL/2026/0473** · ABC Wine Stores (Pvt) Ltd · FL4 · Colombo · **2026-06-19** · Active · **Order today: 480 cases** · **AMBER "expires in 3 days"**.
  * FL3/WP/GMP/2026/0091 · (wholesaler) · FL3 · Gampaha · 2026-12-31 · Active · — · GREEN.
  * FL4/SP/GAL/2025/0210 · (retailer) · FL4 · Galle · 2026-05-31 · **Suspended** · no order · RED.
- Interactive: row → context panel.

**Z5 — Context panel (selected = ABC Wine Stores)**
- Licence document thumbnail (FL register source); validity history; dispatch history.
- **✦ AI note:** "Eligibility AMBER: licence valid but expires in 3 days (2026-06-19). 480-case order scheduled today will deliver before expiry — eligible — but renewal not yet on file. Recommend confirm renewal before next cycle." `[P1]`
- Action rail: **Hold dispatch** · **Clear dispatch (reason)** · **Flag for renewal follow-up** · Open licence doc `[P6]`.

**COMPONENT SPECIFICATIONS**
- **Outlet status table** — renders `Customer_Licence` + `Dispatch_Order`; metric = POS licence compliance rate — row click → context — empty: "No active orders to validate" — error: "FL register sync failed — eligibility shown 'unverified', last sync <ts>" (never green).
- **Eligibility chip** — go/amber/hold (C16) with AI reason on hover `[P1]`.

**RESPONSIVE BEHAVIOUR**
- Tablet: table horizontally scrollable; context = bottom sheet.
- Mobile: shows only ineligible/expiring rows (exception list); full table behind a filter. Priority = "ineligible with order today."

**ANNOTATIONS**
[1] System **recommends** hold; human clears/holds with reason — never auto-cancels an order `[P6]`.
[2] Sync staleness explicit; unverified ≠ green.
[3] Map view deferred to v2 (table only for MVP).

---

### WIREFRAME — EVIDENCE PACK BUILDER

**Screen type:** Full-panel modal (opens over the calling screen, pre-scoped). **Viewport:** Desktop primary / mobile supported (the inspector may be standing).
**Grid:** Centered panel ~80% viewport. Header (scope+format), contents preview (left 8-col), provenance/preview (right 4-col), footer action bar.

**First-10-seconds job:** confirm **scope + regulator format** and hit **Generate** — the panel opens already scoped to where the user was.

**ZONE-BY-ZONE LAYOUT**

**Z1 — Header (command)**
- **Scope selector** ("Period: Jun 2026 ▾" / Batch / Shipment / Domain) — pre-filled from calling screen; **Regulator-format selector**: tabs **Excise · SLSI · FCAU · Customs · NATA · CEA · Board**; Time selector "pack as at: Now ▾" `[P5]`.

**Z2 — Primary panel: pack contents preview**
- Grouped by chosen regulator's expected structure. For **SLSI** format, current audit period:
  * "Batch genealogy records (Jun) — 412 batches ✓"
  * "HACCP / CCP logs — ✓"
  * "Release sign-offs — ✓"
  * "Lab COAs (incoming) — ⚠ 1 missing (malt lot ML-2026-0337)" `--status-watch`.
- Each row: include toggle (on), status, view.

**Z3 — Context panel: provenance / preview**
- Selected item preview + **provenance badge** (source system + hash) `[P2]`; "✦ Completeness: 99.8% — 1 COA gap stamped, not fabricated." `[P1]`

**Z4 — Footer action bar**
- **Generate** (primary) · Add item · Exclude (reason) · format note "Excise pack = return + workpaper + sticker reconciliation."

**COMPONENT SPECIFICATIONS**
- **Pack contents checklist** — renders `Evidence_Pack` + `Document` + domain records (C29) — Generate → immutable hashed `Evidence_Pack`, logged to `Audit_Event` — empty: "Select scope to assemble" — error: gaps **stamped**, never auto-filled.
- **Format template** — switches structure per regulator tab — Excise/SLSI/FCAU/Customs/NATA/CEA/Board.

**RESPONSIVE BEHAVIOUR**
- Mobile: full-screen; scope/format as a top dropdown pair; Generate fixed at bottom. Optimised for the < 60-second inspector path.

**ANNOTATIONS**
[1] Panel **must** open pre-scoped from the calling screen (no blank start) — this is what makes < 60 s achievable.
[2] Pack is point-in-time + hashed; re-gen creates a new version, never overwrites `[P5]`.
[3] Missing evidence is stamped in the pack — the platform never fabricates proof `[P1]`.

---

### WIREFRAME — OBLIGATION & CONTROL REGISTRY  *(read-mostly + duty-config edit)*

**Screen type:** Full page (admin). **Viewport:** Desktop only.
**Grid:** 12-col. Nav 2-col. Main 10-col: command bar (full), status band (full), obligation→control matrix (7-col), config/version panel (3-col right).

**First-10-seconds job:** for the demo close — see the **obligation→control→owner→evidence matrix** that proves "compliance = a configurable ruleset," and the **duty-rate version** as the editable lever.

**ZONE-BY-ZONE LAYOUT**

**Z1 — Left nav** ("Registry" active, admin-gated).

**Z2 — Command bar**
- Jurisdiction filter ("Sri Lanka ▾"), Industry filter ("Brewing ▾" — the adaptability lever), version selector ("Ruleset v2026.3 ▾"), "Add obligation", "Export ruleset".

**Z3 — Status band**
- Cards: "Ruleset v2026.3 — effective 2026-06-01"; "Controls without owners: 0"; "Obligations without evidence rule: 0" (rulebook health) `[P3]`.

**Z4 — Primary panel: obligation→control matrix**
- Columns: Obligation (regulator) · Control · Owner role · Required evidence · Frequency · Evaluating capability (C-id) · Config value.
- Sample rows:
  * "Pay duty on LPA removed (Excise Dept)" · "4-way reconciliation" · Finance Lead · Removal+sticker+permit records · Monthly · **C6/C7/C8** · **Duty rate: [config v2026.3]**.
  * "Affix Fool Proof Sticker per bottle (Excise Dept)" · "Sticker reconciliation" · Finance Lead · Sticker serials · Batch · **C11** · n/a.
  * "Label per SLS + Food Act" · "Label verification" · Regulatory · Approved artwork · Batch · **C13** · mandatory elements list.
  * "No alcohol advertising breach (NATA)" · "Ad review" · Regulatory · Campaign approvals · Event · **C14** · —.

**Z5 — Config / version panel**
- Selected obligation's config: duty rate value (editable), legal reference, version history `[P5]`.
- **Change-impact preview** (✦): "Editing duty rate will recompute: Excise Workbench variance, Dashboard duty position, June return draft." `[P1]`
- Buttons: Edit · Map control · Assign owner · **Publish version**.

**COMPONENT SPECIFICATIONS**
- **Obligation→control matrix** — renders `Regulatory_Actor` obligations + controls + evidence rules (C36) — row click → config panel — empty: "No obligations for this jurisdiction/industry" — error: rows missing control/owner/evidence flagged red.
- **Version publisher** — edit → change-impact preview → Publish → cascades live + retains old version for time-travel; all edits logged `[P5][P6]`.

**RESPONSIVE BEHAVIOUR** — Desktop only (admin); no mobile target for MVP.

**ANNOTATIONS**
[1] Publishing never rewrites history — past evaluations stay tied to the version in force then `[P5]`.
[2] Obligation cannot be "active" without control + owner + evidence rule `[P3]`.
[3] This is the **adaptability lever**: switching Industry filter ("Brewing"→"Distilling") swaps the obligation set with no change to Screens 1–9 — the demo's close proof.

---

### WIREFRAME — DOMAIN DRILL (slide-over) *(collapsed Domain Compliance Centre)*

**Screen type:** Right slide-over panel (~40% viewport width), over the Dashboard. **Viewport:** Desktop primary / mobile full-screen.
**Grid:** single column inside the panel.

**First-10-seconds job:** see the tapped domain's **open findings + owners** and tap the top one.

**ZONE-BY-ZONE LAYOUT**

**Z1 — Panel header**
- Domain name "Excise & Duty"; status "AT-RISK"; close ✕; **"Open full workbench →"** link (to Excise Workbench).

**Z2 — Body: open findings list**
- Each finding row: severity dot · title · **owner chip** `[P3]` · age.
  * `--status-critical` · "Sticker variance 1,200 units ≈ Rs 0.9 M" · *Priyantha Silva* · 6h.
  * `--status-watch` · "ABV drift on LL625-…-014 (lab vs declared)" · *Priyantha / Nilanthi* · 1d.
- Interactive: row → **Finding slide-over** (stacks).

**Z3 — Footer**
- "Evidence coverage: 96%" with link; **Generate Evidence Pack — Excise** `[P7]`.

**COMPONENT SPECIFICATIONS**
- **Findings list** — renders domain-filtered `Compliance_Finding` + owners — row → Finding slide-over — empty: "No open findings (healthy)" — error: "domain feed disconnected."

**RESPONSIVE BEHAVIOUR** — Mobile: full-screen sheet, swipe-down to dismiss.

**ANNOTATIONS**
[1] Slide-over keeps the Dashboard context behind it (cheap drill, no full navigation) — serves F1/F6 click discipline.
[2] Unassigned owner → red "UNASSIGNED" + inline assign `[P3]`.

---

### WIREFRAME — FINDING (slide-over) *(collapsed Finding Detail & Resolution)*

**Screen type:** Right slide-over (~40%), stacks over Domain Drill / opens from any flag. **Viewport:** Desktop / mobile full-screen.
**Grid:** single column.

**First-10-seconds job:** read **what failed + required action**, then act (resolve/escalate/override) or open evidence.

**ZONE-BY-ZONE LAYOUT**

**Z1 — Header**
- Finding title "Sticker variance — GP-20260614-0312"; **severity CRITICAL ✦** with reasoning chip; **owner: Priyantha Silva** `[P3]`; age 6h; CAPA status "Open"; due 2026-06-18.

**Z2 — Body (top→bottom narrative)**
- **What failed:** "Control '4-way reconciliation' failed — units dispatched (28,800) > stickers applied (27,600)."
- **Evidence** (each opens source) `[P2]`: "Gate pass GP-…-0312", "Sticker order FPS-2026-AB", "Batch LL625-…-014", "Excise register line."
- **✦ AI reasoning:** "1,200 units ≈ Rs 0.9 M duty at risk; likely unscanned sticker order FPS-2026-AB at Line 2 (hypothesis)." `[P1]`
- **Required action:** "Reconcile FPS-2026-AB scan or void; update declaration."

**Z3 — Resolution history** (from `Audit_Event`) `[P5]`
- "06:12 flagged by system ✦ · 06:30 assigned to Priyantha · …"

**Z4 — Action rail (sticky footer)**
- **Resolve (attach evidence)** · **Escalate** · **Override (reason required)** · **Reassign owner** `[P6][P3]`.

**COMPONENT SPECIFICATIONS**
- **Finding card** — renders `Compliance_Finding` + linked entity + AI reasoning — Resolve requires resolving evidence; Override annotates (never deletes) — empty: n/a — error: "linked evidence unavailable."

**RESPONSIVE BEHAVIOUR** — Mobile: full-screen; action rail fixed bottom.

**ANNOTATIONS**
[1] Cannot close without owner + resolving evidence `[P2][P3]`.
[2] Override stays visible as "overridden by <name>: <reason>" `[P6]`.

---

# PART 3 — DRILL FLOW SPECIFICATIONS

*Rule: reaching evidence from a top-level signal in > 4 clicks is a UX failure — flagged where relevant.*

### DRILL FLOW F1 — CTO: red domain → finding → evidence → assign owner
**Persona:** P1 (Dinesh). **Trigger:** Excise tile is red on the Dashboard. **Goal:** understand the exposure and make sure someone owns it.
**Click map:**
- Click 1: **Excise tile (red)** → Domain Drill slide-over → open findings, top = "Sticker variance 1,200 units ≈ Rs 0.9 M", owner *Priyantha*.
- Click 2: **the sticker-variance finding** → Finding slide-over → what failed + evidence list + ✦ AI reasoning + required action.
- Click 3: **"Gate pass GP-…-0312" evidence link** → source artifact (the proof) `[P2]`.
- Click 4: **Reassign / confirm owner** (or Escalate) → logged `[P6]`.
**Resolution:** Confirm owner = Priyantha / escalate.
**Maximum click count:** 4. **Evidence reached at click 3 ✓ (within 4).**
**AI touchpoints:** Domain Drill finding line + Finding slide-over reasoning ("1,200 units ≈ Rs 0.9 M; likely unscanned order FPS-2026-AB — hypothesis"), `--ai-accent` `[P1]`.

### DRILL FLOW F2 — Excise Officer: workbench → variance → trace to batch → evidence pack
**Persona:** P2 (Priyantha). **Trigger:** Total variance Rs 2.34 M in status band. **Goal:** explain the variance and hand the resident Excise officer a pack.
**Click map:**
- Click 1: **Duty position card (Dashboard)** → Excise Workbench → four-way diff, breaks: 4.
- Click 2: **Row A (red ②)** → break detail + ✦ reasoning; "View batch" link visible.
- Click 3: **"View batch"** → Batch Tracker (LL625-…-014) → sticker application card shows the gap `[P2]`.
- Click 4: **"Generate Evidence Pack — Excise"** → Builder (pre-scoped) → Generate.
**Resolution:** Export Excise pack for the resident officer.
**Maximum click count:** 4. **Evidence (break detail) at click 2 ✓.**
**AI touchpoints:** break-detail reasoning + variance waterfall attribution, both `--ai-accent` `[P1]`.

### DRILL FLOW F3 — QA: batch-hold alert → batch → failed test → lab result → approve/escalate
**Persona:** P3 (Nilanthi). **Trigger:** Batch-hold alert (Quality tile / AI feed). **Goal:** decide release.
**Click map:**
- Click 1: **Batch-hold alert** → Batch Tracker → red "Bright-beer release" node.
- Click 2: **the red node** → context panel: micro retest pending + ✦ AI note.
- Click 3: **"Micro" result** → lab result detail (value vs spec, source).
- Click 4: **Hold / Order retest / Escalate** (Approve disabled while red) `[P6]`.
**Resolution:** Hold + order retest (release blocked by design).
**Maximum click count:** 4. **Evidence at click 2–3 ✓.**
**AI touchpoints:** the release-block reasoning note `[P1]`; AI never overrides the hold `[P6]`.

### DRILL FLOW F4 — Distribution: POS check → licence expiring in 3 days → flag → block + log
**Persona:** P4 (Roshan). **Trigger:** "Dispatches to ineligible outlets today: 1". **Goal:** stop a risky dispatch cleanly.
**Click map:**
- Click 1: **Distribution tile / POS Monitor** → outlet table, FL4/WP/COL/2026/0473 amber "expires in 3 days".
- Click 2: **the outlet row** → context: licence doc, valid-to 2026-06-19, ✦ eligibility reasoning.
- Click 3: **"Hold dispatch" (+ reason)** → system marks load hold, writes `Audit_Event` "blocked by Roshan: licence expiring".
**Resolution:** Dispatch held + logged; renewal follow-up flagged.
**Maximum click count:** 3 ✓.
**AI touchpoints:** eligibility chip reasoning (amber, with the "delivers before expiry but renewal not on file" nuance) `[P1]`; human confirms the hold `[P6]`.

### DRILL FLOW F5 — SLSI inspector arrives → SLSI pack for current period in < 60 s
**Persona:** P5 (Amaya). **Trigger:** Inspector at reception. **Goal:** a printable SLSI pack, fast.
**Click map:**
- Click 1: **Command-bar "Generate Evidence Pack"** (from wherever) → Builder, pre-scoped to current context.
- Click 2: **Format tab "SLSI" + Scope "Period: current audit window"** → contents assemble (genealogy + HACCP + releases; 1 COA gap stamped).
- Click 3: **Generate → Export PDF** → hashed pack.
**Resolution:** Hand/print the SLSI pack.
**Maximum click count:** 3, **< 60 s ✓.**
**AI touchpoints:** completeness check ("99.8% — 1 COA gap stamped, not fabricated") `[P1]`.

### DRILL FLOW F6 — CTO board demo: full value story in 5 clicks
**Persona:** P1 (presenter). **Trigger:** the board demo. **Goal:** tell the whole thesis fast.
**Click map:**
- Click 1: **Dashboard** → posture AT-RISK + counters + duty Rs 5.41 bn.
- Click 2: **Excise tile** → Domain Drill → sticker-variance finding (✦ reasoning).
- Click 3: **the finding** → Finding slide-over → evidence + required action.
- Click 4: **"Generate Evidence Pack — Excise"** → Builder.
- Click 5: **Generate** → hashed Excise pack in ~8 s.
**Resolution:** "From red flag to regulator-ready proof in 5 clicks."
**Maximum click count:** 5 (intentional full-story path; evidence itself reached by click 3 ✓).
**AI touchpoints:** posture weighting, finding reasoning, pack completeness — all `--ai-accent` `[P1]`.

---

# PART 4 — DEMO NARRATIVE

*Target: ≤ 6 minutes. Designed toward the turn in Scene 4 — the 8-seconds-vs-2-days moment where the CTO stops evaluating the product and starts placing it.*

**THE SETUP (30 seconds)**
> "Today, when the Excise officer downstairs questions a number, or SLSI walks in unannounced, your team spends two days pulling spreadsheets, gate passes, and sticker counts to prove you're compliant. You're spending senior time defending the past instead of running the present. Let me show you the same job — done live, with the proof already assembled."

**SCENE 1 — THE RISK POSTURE (60 seconds)**
*Open the **Risk Posture Dashboard**.*
> "This is your whole compliance picture for Biyagama, live. One word at the top — right now we're **At-Risk**. One open critical. Three deadlines inside a week. And your June duty position, **Rs 5.41 billion**, tracking against your roughly **Rs 64.8 billion** annual liability."
*Gesture to the tiles.*
> "Seven domains, each with a status and — this matters — **a named owner**. No status without someone accountable. The red one is Excise. Let's go where the money is."
*(Click 1: Excise tile.)*

**SCENE 2 — THE DRILL (90 seconds)**
*Domain Drill slide-over opens.*
> "One open critical here: a **Fool Proof Sticker variance**. Owned by Priyantha in Finance. Watch how fast we get to proof."
*(Click 2: the finding → Finding slide-over.)*
> "Here's exactly what failed: on the 14th of June, **28,800 units were dispatched but only 27,600 stickers were applied** — a **1,200-unit gap, about Rs 0.9 million** of duty at risk. And every line here is a link — the gate pass, the sticker order, the batch."
*(Click 3: open the gate-pass evidence.)*
> "That's the actual gate pass from SAP. Nothing on this screen is asserted without the document behind it. Two days of reconciliation — and we're looking at the root cause in three clicks."

**SCENE 3 — THE AI MOMENT (60 seconds)**
*Point to the violet ✦ reasoning block.*
> "Now — your team didn't find this. The system did, overnight, and told you **why**, not just that something was wrong: '1,200 units unaccounted, roughly Rs 0.9 million, **likely an unscanned sticker order on Line 2**.' That's a hypothesis, clearly labelled — the AI flags and explains, but Priyantha decides."
*Hover the Distribution tile's amber chip.*
> "Same thing here — it caught a Colombo wine store, FL4/…/0473, whose **licence lapses in three days**, before you shipped into a problem. The AI does the watching. Your people stay in charge of every decision."

**SCENE 4 — THE EVIDENCE PACK (60 seconds)** *(the turn)*
*(Click 4: "Generate Evidence Pack — Excise". Click 5: Generate.)*
> "So the officer downstairs wants it all tied out. Watch."
*Pack generates.*
> "**Eight seconds.** Return, workpaper, sticker reconciliation, every figure traceable, time-stamped, hashed. The thing your team blocks out two days for. And if a document were genuinely missing, it would say so — it stamps the gap, it never invents proof."
*Pause.*
> "Excise format here. One tap switches it to **SLSI** for a quality inspector, or **FCAU and Customs** for an export shipment. Same proof, the regulator's format."

**SCENE 5 — THE CLOSE (30 seconds)**
*Open the **Registry** for five seconds; flip the Industry filter.*
> "Last thing. None of this is hard-wired to beer. Compliance here is a **ruleset** — obligations, controls, owners, evidence. Change the rules and the same platform runs your distillery, your water business, any regulated line. You adapt the rules, not the way your people work."
*Close.*
> "So: faster oversight, no more two-day audit scrambles, and your team back on the work that grows the business. The question isn't whether this works — you just watched it. It's **which line we point it at first.**"

**Total demo time:** ~5 min 30 s end to end (≤ 6 min target met).

---

*End of Prototype-Ready UX Blueprint. Part 1 = defensible MVP cuts (6 standalone + 2 collapsed + 2 deferred; centre of gravity = Excise Reconciliation Workbench). Part 2 = 8 Figma-ready wireframe blueprints with zones, components, responsive behaviour, annotations. Part 3 = 6 drill flows, all reaching evidence in ≤ 4 clicks (F6's 5-click path is the full-story demo route; evidence itself at click 3). Part 4 = a one-rehearsal demo script designed toward the Scene-4 turn. `[VERIFY]` items (POS count ~2,800, current duty rate, ~Rs 64.8 bn liability, SAP/LIMS maturity) remain inputs to discovery before build.*
