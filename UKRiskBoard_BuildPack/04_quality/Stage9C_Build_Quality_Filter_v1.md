# Stage 9C Build-Quality Filter -- yaara-uk-risk / cro-smf4-board

- **Run:** Yaara Risk & Compliance -- UK Banking, UK Board Risk View. Phase 4.5 (governance bridge).
- **Date:** 27 October 2026. **Status:** draft for confirmation; not locked.
- **Inputs read:** `PHASE3_BRIEF.md` (speed mode); `stage-9c-build-quality-filter.md`; `conventions.md` (sections 4, 7, governance note); governance profiles `compliance.md` (primary) and `executive.md` (board headline); `_persona-theme-system.md`; Stage 4 (sections 1.6, 1.7, 3.4, 5); Stage 6 (all); Stage 7 (all); Stage 8 (all); product profile `DOES_NOT_DO` and `GOVERNANCE_PRODUCT_KEY`.
- **Rulebook loaded** (from `yaara-frontend-dashboard-skill/references/`, in profile order): `product_context_index.md` → `global_dashboard_rules.md` → `persona_specific_rules.md` → `product_specific_rules.md` → `component_rules.md` → `layout_density_rules.md` → `visualization_rules.md` → `naming_copy_rules.md` → `approved_patterns.md` → `rejected_patterns.md` → `frontend_review_checklist.md`.
- **This file authors no rule.** Every rule is cited by its name and real ID (CL-, RP-, AP-, CF-, LR-, VR-, NR-). Where a screen needs a rule the rulebook lacks, it is listed under Governance gaps (section 6), not invented.
- **Verdict key:** **PASS** (spec complies); **COND** (complies if Cursor follows the stated condition; goes into the Stage 10 prompt as-is); **FAIL** (the Stage 6/7/8 spec contradicts a rule and must change before Stage 10).
- **ID key:** HF-n, R-n, OD-n (Stage 4); X-n, DS-n, S6-OD-n (Stage 6); F-n, DG-n, B-n, S7-OD-n (Stage 7); CMP-n, TK-n, S8-OD-n (Stage 8). New here: **V-n** (findings), **GG-n** (governance gaps), **9C-OD-n** (open decisions).

---

## 0. Gate summary

| Item | Result |
|---|---|
| Product key | "AI Audit & Compliance Platform (SWIFT CSCF / Internal Audit / CRO posture)", resolved exactly in `product_context_index.md`. Fluid Compliance CRO directives adopted as persona overrides (brief) |
| Altitude | C-suite (CRO) on S1, S2, S3. S4 at board altitude (BRC chair): **no persona in the rulebook**; C-suite rules applied as the nearest altitude (GG-2) |
| HARD_ENFORCE items | **11** in the two profiles (deduplicated); **10 applied**, 1 not applicable (audit-cycle agnosticism: no audit-cycle UI here). **4 have spec hits** that must change (HE-4, HE-7, HE-8, HE-11) |
| AUTO_REJECT items | **17** checked (AR-1 to AR-17; 1 not applicable); **5 hits** (RP-002 over-statted; RP-004 over-claiming "forecast"; RP-005 judgmental labels; duplicated metrics; deep drill for an exec) |
| Distinct rule IDs cited | 50 (CL 16, RP 9, AP 9, CF 3, LR 9, VR 4); NR and unnumbered layout rules cited by name |
| FAIL findings | **11** (V-1 to V-11, section 5). All are spec-level, none is structural to the data model |
| Governance gaps | **10** (GG-1 to GG-10) |
| Theme (OD-1) | **Not decided.** Pass conditions for both options in section 4 |

---

## 1. Resolution

| Item | Value |
|---|---|
| Product key | **"AI Audit & Compliance Platform (SWIFT CSCF / Internal Audit / CRO posture)"** (index entry, confidence High within compliance scope). Product profile `GOVERNANCE_PRODUCT_KEY` matches, marked `[unverified -- confirm with user]` |
| Adopted overrides | From "Fluid Compliance / Risk-&-Audit module" (brief): top-down from the CRO; developing risk by category, not miss-counts (RP-008); thousands-scale counts (RP-009); real-time control framing. Index note "do NOT merge with Fluid CX clusters" honoured: no LiSN intelligence components (DS8-8) |
| Persona altitude | **C-suite (CRO)** for S1, S2, S3 and scoped drills. **S4: board (BRC chair, SMF10)**: not in the index persona stack ("C-suite (CEO/COO/CRO)" is the top). Treated as C-suite or above: least detail, most status (CL-012). Flagged GG-2 |
| Density | Low to medium (CL-012; persona theme system row "CFO / Compliance / Board / Approver: conservative, low-chroma, low-medium density") |
| Precedence | Product/persona-specific overrides global. **One conflict found inside the rulebook:** the AI Audit & Compliance product rule and the CRO persona rule prefer "a single risk-posture heat map by domain" on the CRO landing, while RP-001 (and the compliance profile's AUTO_REJECT) bars matrices and heat-maps on a CRO screen. This run follows the selector's AUTO_REJECT and Stage 4 R-3: a ranked scorecard by category satisfies RP-001 and RP-008 together. Flagged GG-3 |
| Screen-specific rules | Not generalised. FASTag light-theme and density rules (Product E) are cited only through their global forms (CL-013, CF-002) |
| Repo | All existing paths and components remain `[unverified -- confirm against repo]` (Stage 8) |

---

## 2. Global enforce (every screen: S1, S2, S3, S4 and scoped drills)

| # | Rule (name, ID) | Cursor MUST enforce |
|---|---|---|
| GE-1 | Frame cards as business questions that resolve to a state (CL-001; NR business-question titles) | Every zone and card title is the Stage 6 question; its first line is the state sentence; status shown by `StatusToken` |
| GE-2 | Thin AI executive-summary band, change-first, question set by level (CL-004, AP-011, CF-003) | One `AiExecutiveBand` as **row 0, above all tiles**, one text line high, on **every Layer 1 screen (S1, S3, S4)**. C-suite steady-state set (CF-003): "What's critical / What's due before the BRC / What's holding steady" plus one AI line. Never the head's diagnostic set (broken / how bad / who's affected) |
| GE-3 | AI insight reads as AI: compact sparkle card above the fold, one zone per screen (CL-005, RP-006) | AI drafts render as compact `DraftActionCard` (CMP-30) with `AiMarker` (CMP-29) in the card's action slot; never a wide bar; one consistent slot position per card |
| GE-4 | Headline largest, first-seen, top-left; 5-second headline / 2-minute comprehension (LR-010; review checklist) | The Z1 headline of each Layer 1 screen is the largest element and sits directly under the band, top-left |
| GE-5 | Delta beside its number (LR-003; KPI card rule) | `DeltaValue` (CMP-6) renders value, denominator and delta inline; never right-aligned or at card bottom |
| GE-6 | One primary number per large KPI; density and whitespace discipline (CL-013; Internal Design Directive) | Each card face carries one primary number with its denominator; secondary figures go on one secondary line or to the drill |
| GE-7 | One persona per screen; density by seniority; drill capped at one click (CL-012, LR-007, LR-008, AP-019) | S1, S3 = CRO; S4 = BRC chair. Cards + one drill only. Inline expansion inside a drill is not a further layer |
| GE-8 | Tile ↔ drill consistency; every drill keyed by the clicked item (CL-007; LR-004) | Drill headline equals the clicked item's state sentence (Stage 8 section 2.3 test). No orphan tile, alert or band link |
| GE-9 | Define every metric; reconcile every figure; exact entity labels (CL-014; NR exact entity labels) | Every number carries its K-code definition in its tooltip/rule line and a denominator (HF-2). "Members" vs "customers" per Stage 6 section 4.4. Figures tie out across S1, S3, S4 (9A) |
| GE-10 | Name and register every widget; govern its data source; star integration-dependent tiles (CL-014, CL-021, AP-015) | Widget registry (widget → screen → data source → viewer). Tiles fed by a bank system feed (not by the product's own D1 registers) carry the star + access caveat |
| GE-11 | Consistent colour semantics; entity vs change palettes; problem and cause in the same alert colour; verified contrast (CL-009, CL-026, CF-002) | Status colours are RAG only, plus the Unverified token (GG-1). Deltas use a separate change palette. Contrast verified per section 4 |
| GE-12 | Visualization fits the data shape; never decorative (CL-008; VR-001 to VR-010) | Gauge only for the appetite-usage position; series only where ≥ 4 real points (VR-006); funnel only for in scope → tested → breach |
| GE-13 | One period selector cascades; banking grains (CL-018) | One header comparison control; QoQ default. "vs last ERC" is held as 9C-OD-3 (GG-5) |
| GE-14 | Specific frontend instructions (global rule "Make frontend instructions specific") | Every FAIL in section 5 is stated as preserve / remove / change |
| GE-15 | Preserve approved components; reuse proven templates relabelled (CL-022) | v6 reuse by props only (CMP-35 to 38); relabel, do not leak SWIFT labels |
| GE-16 | Compact header, filters top-right; typography for 1920×1080 / Zoom ("Compact the header; move filters to the top-right" layout rule; LR-006; CL-028) | `BoardHeader` is one slim row: firm and screen nav left; comparison switch, theme toggle and "Illustrative data" label top-right; evidence date and next forum as one meta line |

**Fixed checks from the stage file and the profiles (every element):** domain spine traced (Stage 6/8 spine columns); AI marker on every AI element (CMP-29); no status without its evidence (HF-6, compliance AUTO_REJECT "compliant without evidence + attestation"); no autonomous-action label (HF-8, TK-10); hard fails HF-1 to HF-10 as Stage 6 section 4.5.

**Compliance HARD_ENFORCE as applied:**

| HE | Item (profile) | Where applied | Status |
|---|---|---|---|
| HE-1 | Developing risk by category; coverage-first (RP-008) | S1 scorecard with domain label on every row; S3 coverage K-19 beside the breach ratio | COND (S1-Z4, S3-Z1) |
| HE-2 | Thousands-scale counts (RP-009) | Monitored populations: 2,400,000 records; 33,400 in scope; 26,900 overdue reviews | PASS; GG-6 on governance-object counts |
| HE-3 | Audit-cycle UI audit-type agnostic | No audit-cycle UI in this variant | N/A |
| HE-4 | Regulation firm-level and off the top band | S1 band currently carries "2 reportable events" | **FAIL → V-3** |
| HE-5 | Compliance landing leads with reconciliation/coverage + variance; evidence-on-click | S1 integrity line "10 of 12 verified"; S3 coverage; every badge opens DG-3 | PASS |

**Executive HARD_ENFORCE as applied:**

| HE | Item (profile) | Status |
|---|---|---|
| HE-6 | Question cards resolving to a state (CL-001) | PASS |
| HE-7 | Canonical executive triad (AP-001, AP-002) | **FAIL → V-1** (S1 hero question cards split across rows 1 and 3) |
| HE-8 | Thin AI band, change-first, CF-003 set (CL-004, CF-003) | **FAIL → V-1, V-2, V-4** |
| HE-9 | AI insight as a compact sparkle card above the fold (CL-005) | COND (GE-3) |
| HE-10 | Headline largest top-left; deltas beside; 5 s / 2 min | PASS (COND on S1 once the band moves) |
| HE-11 | One persona per screen; one-click drill (CL-012, LR-007) | **FAIL → V-9** (S3 ledger event row → route row → case) |

---

## 3. Global reject (Rejected Pattern Library and atomic rejections that apply)

| # | Rejection (ID) | Applies here as | Spec status |
|---|---|---|---|
| AR-1 | Compliance miss-counts on the CRO screen (RP-008) | "Flag fired 1,208 times" only as the labelled contrast line in DG-6 (X-10, R-4) | PASS |
| AR-2 | Single-unit compliance counts (RP-009) | Population counts at realistic scale | PASS (GG-6) |
| AR-3 | Per-transaction regulatory labels; "regulator" as an actor | Routes are event-level, on S3 only; no regulator actor | PASS |
| AR-4 | "Compliant" without evidence and attestation (product hard fail) | Unverified overrides RAG (HF-1); S3 never shows untested as compliant | PASS |
| AR-5 | Matrices / heat-maps / bubble-maps on exec screens (RP-001; VR-010) | v6 nine-domain grid removed (X-2); lens grid removed (X-1) | PASS |
| AR-6 | Over-statted cards, > 2 encoded dimensions (RP-002) | Objective tiles; compact gauge with forecast marker | **FAIL → V-6, V-7** |
| AR-7 | Component names over-claiming capability (RP-004; NR "name components for the capability they actually have") | "Forecast" on the compact gauge implies prediction; the method is a straight-line projection | **FAIL → V-7** |
| AR-8 | Judgmental / biased labels (RP-005; NR neutral labels) | "Cannot defend" (band), "What was closed without fixing anything?" (S4 tile 3), "Attested without evidence" (dot label) | **FAIL → V-10** |
| AR-9 | AI insight as a wide bar (RP-006) | LiSN Executive Pulse not imported (DS8-8) | PASS |
| AR-10 | Virality / social velocity; aggregated channel signals (RP-003, RP-007) | None present | N/A |
| AR-11 | Decorative / no-function elements (CL-013) | Badge dots are functional checks; "new since last BRC" marker only when true | COND |
| AR-12 | Duplicated metrics on one screen | S1 shows the same values in the headline, strip tiles, hero cards and scorecard | **FAIL → V-5** |
| AR-13 | Mixed-persona screens (CL-012, LR-007) | S4 preview: CRO pack actions on the chair's screen | COND (9C-OD-4) |
| AR-14 | Deep (> 1) drill for heads / execs (LR-008, AP-019) | S3 ledger | **FAIL → V-9** |
| AR-15 | Detached deltas; sentence-style titles | `DeltaValue` inline; titles are questions | PASS |
| AR-16 | Undefined / non-derivable metrics (CL-014) | Every KPI K-coded with a Stage 5 field and denominator | PASS |
| AR-17 | Heavy dark theme for dense business screens (CF-002) | Applies to S2 and scoped drills if the dark option is chosen | COND (section 4) |

---

## 4. Theme (OD-1, not decided): what each option needs to pass

Governing rules: CF-002 (light for dense business screens; dark only for polished exec demos with verified contrast); CL-009 / CL-026 (blue/green good, amber/red alert; separate entity and change palettes; verified contrast); persona theme system row "CFO / Compliance / Board / Approver: conservative, low-chroma, low-medium density"; theme system rule "the accent never overrides the contrast/accessibility rules"; design rule 6. Contrast thresholds below are WCAG 2.1 AA (text 4.5:1; large text and non-text UI 3:1), as used by the review checklist's "contrast passing".

**Measured contrast for the brand palette:**

| Pair | Ratio | Text (4.5) | Non-text (3.0) |
|---|---|---|---|
| White on #1c1c1c canvas | 17.0 | Pass | Pass |
| White on #2a2a2a surface | 14.4 | Pass | Pass |
| Purple #bc6cd3 on #1c1c1c | 5.05 | Pass | Pass |
| Purple #bc6cd3 on #2a2a2a | 4.25 | **Fail** (large text only) | Pass |
| Lime #dcfc84 on #1c1c1c / #2a2a2a | 14.9 / 12.5 | Pass | Pass |
| Border #3a3a3a on #1c1c1c / #2a2a2a | 1.50 / 1.26 | -- | **Fail** |
| Border #4a4a4a on #1c1c1c / #2a2a2a | 1.92 / 1.62 | -- | **Fail** |
| Purple #bc6cd3 on white | 3.37 | **Fail** | Pass |
| Lime #dcfc84 on white | 1.15 | **Fail** | **Fail** |

Lime #dcfc84 has hue about 76° (yellow-green). Under CL-009 green means "good", so lime on any status, delta, gauge band or positive-change mark reads as "within appetite". This confirms the Stage 4 point.

| Requirement | Option A: light-first default (conservative, low-chroma, dark toggle) | Option B: brand dark (#1c1c1c / #2a2a2a / #3a3a3a–#4a4a4a / #bc6cd3 / #dcfc84 / white) |
|---|---|---|
| CF-002 basis | Default for business screens; matches the board persona row. Passes S2 and drill density without the "heavy" rejection | Allowed only as a "polished exec demo with verified contrast". Acceptable for S1, S3, S4 (low-medium density). **S2 and scoped drills are dense**; AR-17 applies, so the light toggle must stay available and work on every drill |
| Status colours (CL-009) | RAG hues, each ≥ 3:1 against the light card surface as non-text and ≥ 4.5:1 where status text is coloured; glyph + word on every token (Stage 6 section 4.2) | Same RAG semantics re-tuned for dark: each ≥ 3:1 against #2a2a2a; glyph + word on every token |
| Accent | One muted accent for chrome only (navigation, focus, selected tab). **If the accent is blue, keep it off status, gauge and delta marks**: CL-009 reads blue as "good" | **Lime: never on status, deltas, gauges, trajectory markers or "within appetite" states.** Allowed only for brand chrome (wordmark, active nav underline) and never adjacent to a RAG token. **Purple: candidate for the AI sparkle marker (CMP-29)**, used for the glyph and border; its text label must be white, or purple text ≥ 18.66 px bold / 24 px regular when on #2a2a2a |
| Borders and badge dots | Component boundaries ≥ 3:1 where the border is the only cue (badge dots, inputs, focus ring) | #3a3a3a / #4a4a4a fail 3:1: use them only for decorative card separation. Badge dot outlines, the focus ring, inputs and gauge tracks need a lighter stroke (≥ 3:1 against the surface) |
| Change palette (CL-026) | Distinct from status hues | Distinct from status hues **and not lime** |
| Unverified token | Neither RAG hue nor accent; word + glyph (rule pending, GG-1) | Same; must not use purple (that is the AI marker) or lime |
| `[illustrative]`, practice labels | ≥ 4.5:1 | ≥ 4.5:1 on #2a2a2a (white or light grey) |
| Projector / NED viewing (Stage 4 section 2) | Light reads well when projected | Verify on a projector before a live BRC-chair demo |
| Shared requirement | Light/dark toggle (design rule 6); tokens via the existing theme mechanism [UV]; AI sparkle on every AI element in either theme | Same |

**9C position:** both options can pass. Option A passes with fewer conditions and matches CF-002 and the board persona row. Option B passes only with the lime and border restrictions above and a working light toggle on S2. The decision stays with the user (9C-OD-1).

---

## 5. FAIL findings: must change before Stage 10

| V | Element | Spec now (source) | Rule(s) | Required change |
|---|---|---|---|---|
| **V-1** | S1 layout | Band in row 2 below the headline row (DS-6); Z5 in row 3 beside the scorecard | CL-004, AP-011 (band "above all tiles"); AP-001 / AP-002 (three question cards, primary largest); LR-010 | Row 0: thin band, full width. Row 1: Z1 headline + strip (two-thirds, largest) \| right column with Z2 stacked above Z5. Row 2: Z4 scorecard (boxed, V-8). Row 3: Z6 below the fold. Phone order: band, Z1, Z2, Z5, Z4, Z6. The headline stays the first and largest card, top-left |
| **V-2** | S1 band sections | "Moved since the last BRC / Cannot defend / Needs a decision" | CF-003 (C-suite steady-state set); RP-005 ("Cannot defend" pre-judges) | Sections become "What's critical" (restriction breach 112 of 9,400 tested → S3; 2 of 12 headlines unverified) / "What's due before the BRC" (1 amber, 1 red, 1 promotion proposed; 13 items qualify → S4) / "What's holding steady" (8 of 12 within appetite). Figures as Stage 6; 9A ties them out |
| **V-3** | S1 band "2 reportable events, routes awaiting decision" | DS-14; Z3 | Compliance HARD_ENFORCE "keep regulation firm-level and off the top band"; NR "keep mandatory-action items out of the top band" | Remove reportability from the band. S1 reaches S3 through the restriction-breach item (a risk state) and scorecard row 1. Route counts stay on S3 and the S4 footer. DS-14 partly superseded (9C-OD-2) |
| **V-4** | S3 and S4 | No AI band specified | CL-004, AP-011 (every dashboard; S3 and S4 are Layer 1, not deep sub-screens); CF-003 | Add `AiExecutiveBand` as row 0. S3: critical = restriction breach with coverage; due = attestation in 12 days; holding steady = clauses supported (3 of 4). **No route decisions in the band** (V-3 rule). S4 (chair): critical = 1 qualifying item removed with no reason recorded; due = December agenda items proposed; holding steady = 12 of 13 qualifying items in the pack. One AI line each, with its source note |
| **V-5** | S1 duplicated values | T2-1 in the headline, tile O1 and scorecard row 6; T2-5 queue age in Z2 and row 4; T2-14 in Z5, tile O4 and row 2; T2-15 in tile O4 and row 3; wholesale funding in tile O3 and row 7 | Rejected atomic "duplicated metrics" (CL-013); executive AUTO_REJECT | **Each value renders once on S1.** Owners: T2-1 → Z1 headline; T2-5 → Z2; T2-14 → Z5; all others → Z4. Strip tiles show objective, status token, badge and inline state, with no repeated figure (O3 keeps the statutory line). Scorecard rows whose value is owned by a hero card show status + badge + "shown above" anchor, and no repeated value |
| **V-6** | `ObjectiveTile` (CMP-11) | Objective, binding statement, appetite used, headroom, QoQ delta, trajectory marker, badge, inline state, action (Stage 6 Z1 strip) | RP-002 (≤ 2 encoded dimensions); CL-013 (one primary number) | Face: objective (noun phrase), status token, collapsed badge, one inline-state line, one action. Headroom £, trajectory and the O1 first-time-buyer marker move to the tooltip and DG-1 |
| **V-7** | `HeadroomGauge` compact (CMP-10) | "set · actual · forecast" on the S1 face | RP-002 (third encoded dimension); RP-004 / NR "name components for the capability they actually have" (method is a straight-line projection, "early warning, not a prediction") | Compact mode: actual against the amber and red bands only. Projection stays as text ("amber projected Q2 2027 · early warning, not a prediction"). The projection marker appears only in the S2 full gauge, labelled "projection", never "forecast". Prop rename `forecast` → `projection` |
| **V-8** | `RasScorecard` (CMP-15) | 12 rows rendered full height | LR-002 (cap dense lists at ~4 visible lines with internal scroll); review checklist 5 | Boxed list, 4 visible rows (red, unverified, unverified, amber: the urgent set) with internal scroll. A fixed summary line beneath: "8 of 12 within appetite · 12 of 34 Level 1 metrics `[practice-not-rule]`". Promotion lane stays beneath the box |
| **V-9** | `ReportabilityLedger` (CMP-23), S3-Z3 | Event row → route row → route case (F-7); routes per event uncapped | LR-008, AP-019 (cards + one drill); LR-002 | Route rows render on the face under a non-clickable event group header, inside a boxed region of ~4 visible rows with internal scroll. One click on a route row opens DG-8. Event 2's "1 of 4 routes decided" line stays on the group header |
| **V-10** | Labels | "Cannot defend" (band); "What was closed without fixing anything?" (S4 tile 3); dot label "Attested without evidence" (T2-17) | RP-005; NR neutral labels | Band: replaced by V-2. S4 tile 3 title: "Which closed actions have not moved their metric?". T2-17 dot label: "Attestation precedes a completed run". State sentences and rule lines unchanged |
| **V-11** | `CardShell` (CMP-2), widget registry | No integration flag; no registry | AP-015; CL-014 / CL-021 (widget registry, data-source tag) | Add prop `integrationDependent: {feed: string; caveat: string}` → star + caveat ("needs the society's [feed] access"). Applies to tiles fed by a bank system rather than the product's own D1 registers: T2-5 (HR capacity, alert queue), T2-14 and T2-15 (monitoring and screening reconciliation), T2-27 (account-opening population), scorecard rows on bank feeds. Add `widgetRegistry.ts` (widget → screen → source → viewer) in `boardRiskV8/` |

---

## 6. Per-element mapping

**Columns:** the governance product key is "AI Audit & Compliance Platform (SWIFT CSCF / Internal Audit / CRO posture)" for every row (abbreviated **AAC**); S4 rows note the missing persona context. Altitude: **CS** = C-suite (CRO); **BD** = board (BRC chair; GG-2).

### 6.1 Screens

| Element | Alt. | Spine check | Applicable rules | Cursor MUST enforce | Cursor MUST avoid | Verdict |
|---|---|---|---|---|---|---|
| **S1 Board Risk View** (CMP-41a) | CS | Objective → RAS → L1 → feed → owner → attestation. Traced | CL-001, CL-004, AP-011, CF-003, CL-005, AP-001/AP-002, LR-010, LR-004, CL-012, LR-007, CL-013, RP-008, CL-003 | V-1 layout; V-2/V-3 band; V-5 de-duplication; four visible units plus the band above the fold; every zone ends in prepare/propose (rule 1); headline integrity line "10 of 12 verified" invariant across viewers (CL-003, CF-001) | RP-001 (no domain grid, X-2); RP-008; RP-006; duplicated metrics; lens toggle (X-1) | **FAIL** (V-1, V-2, V-3, V-5) |
| **S2 Principal-risk drill** (CMP-41b) | CS (Layer 2) | Full spine, sections in spine order | LR-008, AP-019, CL-007, CL-012 (persona rule CRO "avoid process-level data-health detail"), AP-016 (top-down evidence drill, relabelled), VR-006, CF-002 | Opens on the clicked unit with its section expanded; other sections collapsed as headers (curate, CL-012); section b shows the chain at decision altitude: run dates, result IDs, reconciled share, cohort with 0%, attestation timeline. **No per-batch duplicate / failed / blank tables** (process-owner detail). Fraud filter only in the financial crime section | Any Layer 3; lens tabs (X-1); matrices (RP-001); dense dark rendering without a light toggle (CF-002) | COND |
| **S3 Restrictions and reportability** (CMP-41c) | CS | Obligation → control → evidence → attestation → reportability. Traced | CL-004 (V-4), HE-5 coverage-first, RP-008, RP-009, LR-002, LR-008, NR firm-level regulation, HF-3, HF-8 | V-4 band; Z1 shows coverage "9,400 of 33,400 in scope tested" beside the breach ratio (K-19, K-20); V-9 ledger; route names in plain words with the reference in brackets ("FCA notification (SUP 15.3)"); "SAR question open" only | Flag count as status (X-10); "file / notify" (HF-8); regulator as an actor; two-click route access | **FAIL** (V-4, V-9) |
| **S4 Escalation health** (CMP-41d) | BD | L2 → escalation. Traced | CL-004 (V-4), CF-003 (C-suite set applied, GG-2/GG-4), CL-001, RP-005, LR-002, LR-007, CL-012, X-6 / CL-003 (no unexplained composite score) | V-4 band; Z2 feed boxed at ~4 visible rows, removed item pinned first; KRI tiles one primary number each; T2-30 unmounted (HF-9, TK-9); V-10 tile 3 title | Composite "escalation-health score" (X-6); "suppressed" on the face (X-4); individual SMF trails (HF-10); CRO controls mixed into chair content (9C-OD-4) | **FAIL** (V-4, V-10) |
| **Scoped drills** (CMP-41e: clause, route, manifest, KRI) | CS / BD | Per kind. Traced | LR-008, CL-007, AP-007 (manifest diff = run-over-run diff), LR-002 | One drill layer; header via `SectionHeader` + `BackToOrigin`; route case shows options with no default (HF-4) | Further drill; free option lists on T2-5 (HF-7) | PASS |
| **Shared header** (CMP-4) | CS / BD | Firm, forum. N/A to spine | "Compact the header" layout rule, LR-006, CL-018, R-10 | GE-16 slim header; one comparison control; dates DD Month YYYY ("Next BRC: mid-December 2026" to become a date when 9A seeds it) | Date-range picker (X-8); live ticker | COND |

### 6.2 Primitives (CMP-1 to CMP-8)

| Element | Alt. | Spine | Applicable rules | MUST enforce | MUST avoid | Verdict |
|---|---|---|---|---|---|---|
| `BoardLayoutGrid` (CMP-1) | CS / BD | -- | LR-001, LR-004, LR-010, composition guidance (2- or 3-column rows) | Row 0 band slot; V-1 rows; 16 px side gutter at phone width; tiles sized to their data | Stretching a small stat full width; equal sizing of all cards | COND |
| `CardShell` (CMP-2) | CS / BD | E-49 | CL-001, CL-013, RP-002, AP-015, NR problem/solution separation | Slot order per Stage 8; one primary number; V-11 integration star; problem (state) and solution (action) as separate blocks | > 2 encoded dimensions; noun-only titles | COND (V-11) |
| `SectionHeader` (CMP-3) | CS | Spine caption | NR self-explanatory headings | Name the section and its spine segment | "Overview", "Metrics", "Analytics" | PASS |
| `StatusToken` (CMP-5) | CS / BD | E-49.status | CL-009, CL-001 (resolve to a state), HF-1 | Within appetite / amber / red / **Unverified** / not assessed, each with word + glyph; Unverified never a RAG fill | Colour as the only cue; lime on "within appetite" | COND (GG-1) |
| `DeltaValue` (CMP-6) | CS / BD | Position fields | LR-003, CL-026 (change palette), HF-2 | Value + denominator + delta inline; change palette separate from status | Detached deltas; status hues on deltas | PASS |
| `PracticeLabel` (CMP-7) | CS / BD | E-02 | CL-013 (no clutter), HF-5 | Compact inline marker (small caps or superscript), legible at ≥ 4.5:1; full text in the tooltip | Bracketed labels that crowd the primary number | COND (GG-9) |
| `BackToOrigin` (CMP-8) | CS / BD | -- | CL-007, F-14 | Return to the origin with the item highlighted | Losing scroll position | PASS |

### 6.3 Data components (CMP-9 to CMP-27)

| Element | Alt. | Spine | Applicable rules | MUST enforce | MUST avoid | Verdict |
|---|---|---|---|---|---|---|
| `IntegrityBadge` (CMP-9) | CS / BD | Owner → feed → attestation → mapping | CL-013 (functional, not decorative), CL-009 (not colour alone), CL-007 (opens DG-3), HF-1, HF-6 | Four dots, fixed order, glyph + accessible name; collapsed when all pass; expands to the failing check's text line | Decorative use; colour-only pass/fail; "Attested without evidence" label (V-10) | COND |
| `HeadroomGauge` (CMP-10) | CS | RAS → L1 → thresholds | VR-001 (gauge for a 0–100 usage position), AP-014, RP-002, RP-004, TK-4 | V-7; bands from the threshold cascade; unique SVG IDs | "Forecast" wording; third marker on the compact face | **FAIL** (V-7) |
| `StrategyStrip` + `ObjectiveTile` (CMP-11) | CS | Objective → RAS | RP-002, CL-013, NR short noun phrase (tile titles are objective statements, not questions), LR-004 | V-6; O2 inline state "Agreed onboarding trade-off outside its terms: 2 of 3 bounds exceeded · review 27 days overdue"; floor row rendered as a breach (HF-7); T2-8 line rendered only for a building society, no empty slot | Repeating figures owned elsewhere (V-5); tradeable-floor framing | **FAIL** (V-5, V-6) |
| `HeadlineBlock` (CMP-12) | CS | Objective → RAS → L1 | LR-010, CL-001, CL-003, CF-001, LR-003 | Largest element, top-left under the band; one primary number "88% of high-LTV appetite used" with denominator and QoQ delta beside it; integrity line beneath | Second primary number; per-viewer recomputation | PASS |
| `CapacityCard` (CMP-13) | CS | Objective → RAS → L1 → control capacity | CL-001, CL-013 (one primary number), RP-002, AP-015, HF-7 | Primary: queue median age 19 days against amber 14, with delta. Secondary line: K-13 members per qualified handler beside K-14 alerts cleared within SLA. Two options only | Cost or ROI field; a third option; growth claimed as the cause | COND (V-11) |
| `DualSeriesChart` (CMP-14) | CS (drill) | L1 series | VR-006 (real series), banking grains (CL-018), LR-009, TK-4 | Real points only; quarterly or monthly ticks; markers for amber and campaign date | Decorative trend; dual y-axes that imply correlation | PASS |
| `RasScorecard` + `ScorecardRow` (CMP-15) | CS | RAS → L1 → L2/3 | RP-008 (category label per row), RP-001 (list, not grid), LR-002, CL-005 (AI triages the order), HF-5 | V-8; rows ranked red → unverified → amber → early warning → within appetite; domain label column; T2-4 marker shows weeks; V-5 anchor rows | Grid or heat-map; miss-counts | **FAIL** (V-8) |
| `DefensibilityCard` (CMP-16) | CS | Feed → owner → attestation | CL-001, CL-013, HF-1, compliance AUTO_REJECT ("compliant" without evidence), AP-015 | Primary "94.0% of records reconciled (2,256,000 of 2,400,000)"; one cohort line; T2-17 as the expanded attestation dot; face status stays Unverified after a caveat (DS-12) | Any RAG on the face; claiming missed suspicion | COND (V-10, V-11) |
| `LineageChain` (CMP-17) | CS (drill) | Feed → runs → attestation | Persona CRO "avoid process-level data-health detail", AP-016 (relabelled), CL-007 | Decision-altitude chain (see S2 row); underlying RAG shown here only; ruled-out list | Per-record data-health tables | COND |
| `ThresholdCascade` (CMP-18) | CS (drill) | Thresholds | CL-014 (defined), HF-5 | Rationale and calibration version beside each level | Write controls on thresholds (HF-4) | PASS |
| `ContributorList` (CMP-19) | CS (drill) | L1 → L2/3 | CL-003 (headline traces to contributors), LR-002, HF-5 | Worst-first under "worst-of `[practice-not-rule]`"; ~4 visible with scroll | A matrix of indicators | PASS |
| `TensionPairTable` (CMP-20) | CS (drill) | RAS → L1 pair → floor | HF-7, CL-009 (problem and cause same alert colour), keying (D1) | Bound beside partner value; floor row as a breach; keyer and decision reference | Floor as a tradeable bound | PASS |
| `PopulationTestCard` + `PopulationFunnel` (CMP-21) | CS | Obligation → control → evidence | VR-003 (funnel for in scope → tested → breach), RP-008, RP-009, HE-5, HF-3 | Coverage beside the breach ratio on the face; untested lane shown as untested; contrast line labelled and only in DG-6 | Flag count as status (X-10); account records on the face | COND |
| `ClauseEvidenceList` (CMP-22) | CS | Evidence → attestation | AP-006 pattern shape (three-state verdict; relabelled "supported / partly / not supported"), CL-022 (relabel, do not leak SWIFT labels) | Four clause rows; runs present ÷ months in period | Drafting attestation wording | PASS |
| `ReportabilityLedger` + rows (CMP-23) | CS | Escalation / reportability | LR-008, LR-002, NR firm-level regulation, HF-4, HF-8, HF-10 | V-9; elapsed vs clock with "clock unverified" badge; 24-hour target labelled firm practice | Two-click route access; "file / notify"; SAR detail | **FAIL** (V-9) |
| `RouteCasePanel` (CMP-24) | CS (drill) | Reportability decision | HF-4 (no default answer), LR-007 (record control only for the SMF16 viewer) | Options with rationale, no default; append-only history; `canRecord` false for the CRO and chair | A recorded decision attributed to the product or the CRO | PASS |
| `AwarenessGapBlock` (CMP-25) | CS (deciding SMF) | Reportability | LR-007, HF-9, TK-9 | Unmounted for the chair and board viewers | CSS hiding; a placeholder | PASS |
| `ExceptionFeed` + `OverrideLog` + `ManifestDiff` (CMP-26) | BD | Escalation | LR-002, AP-007 (diff view), RP-005 (neutral "removed at ERC with no reason recorded"), X-4 | Feed ~4 visible rows, removed item first; nothing removable from the face; manifest diff v1 → v2 | "Suppressed", "ignored", "not discussed" | COND |
| `GovernanceKriTile` (CMP-27) | BD | Escalation → metric | CL-001, CL-013 (one primary number), RP-005, X-6, minimum n (S5-OD-11) | Primary: tile 1 "31 months to clear against 12 committed"; tile 2 "median 4.6 months (n = 23)"; tile 3 "26,900 overdue reviews against a 10,000 target"; other figures on one secondary line | Composite score; tile 3's judgmental title (V-10) | **FAIL** (V-10) |
| `HorizonLine` (in CMP-11 file) | CS (below fold) | Emerging risk → principal risk → L1 | NR self-explanatory headings, rule 7 | Name the 18 March 2027 deadline in plain words; replace "shadow-classified" with a plain description | Unexplained internal terms | COND |
| `MappingGapChain` (in CMP-17 file) | CS (drill) | Mapping | CL-007 | Missing link rendered as a gap | -- | PASS |

### 6.4 AI components (CMP-28 to CMP-34)

| Element | Alt. | Spine | Applicable rules | MUST enforce | MUST avoid | Verdict |
|---|---|---|---|---|---|---|
| `AiExecutiveBand` (CMP-28) | CS / BD | Whole spine (summary) | CL-004, AP-011, CF-003, RP-006, RP-005, compliance HE "off the top band" | Row 0 on S1, S3, S4 (V-1, V-4); CF-003 sections (V-2); AI marker + source note; adds no figures | Reportability or route decisions in the band (V-3); wide multi-line bar | **FAIL** (V-1 to V-4) |
| `AiMarker` (CMP-29) | CS / BD | -- | CL-005; theme system "AI elements always carry the sparkle marker" | Sparkle + "AI draft" + one-line reason on every AI element; none on statuses or KPIs | Purple text below 4.5:1 on #2a2a2a (section 4) | PASS |
| `DraftActionCard` (CMP-30) | CS / BD | Escalation | CL-005 (compact sparkle card), NR problem/solution separation, HF-4, HF-8 | Compact; Accept / Edit and accept / Reject only; "accepted by [name] on [date]" after the gate | File / notify / submit verbs; autonomous wording | PASS |
| `AuditTrailInline` (CMP-31) | CS (drill) | -- | Rule 7, CL-013 | Collapsed; plain rows; IDs in tooltips | Hashes on the face | PASS |
| `SendToOwnerConfirm` (CMP-32) | CS | -- | RP-004 (honest capability) | "Sent to [role] · audit entry [ref]" | "Notified" | PASS |
| `CanTellCannotTell` (CMP-33) | CS / BD (drill) | -- | RP-004, AP-015-style honesty | "Extension: committee minutes (next module)" as a teaser only | A working Tier 3 card (R-12) | PASS |
| `ProcessGapBlock` (CMP-34) | CS (drill) | Control → owner | NR problem/solution separation, RP-005 | Gap and ask in separate blocks; neutral wording | Blame language | PASS |

### 6.5 v6 reuse (CMP-35 to CMP-39)

| Element | Alt. | Spine | Applicable rules | MUST enforce | MUST avoid | Verdict |
|---|---|---|---|---|---|---|
| `DomainDrillPanel` (CMP-35) | CS | Principal risk | CL-022 (reuse by props), RP-001, X-1 | Lens toggle not rendered (S8-OD-3) | Forking v6; lens tabs | COND |
| `precedentCorpus` (CMP-36) | CS | Precedent → control | CL-014 (source governed) | Posture tag always shown; read-only | Editing the corpus | PASS |
| `ScreeningDenominator` (CMP-37) | CS (drill) | Feed | RP-009 (3,088 list entries at real scale), HF-2 | Denominator labels per TC-8 | -- | PASS |
| `OperationalAssuranceVerdict` (CMP-38) | CS (drill) | Control | RP-004 ("verdict" names a rating vs test, not a prediction) | Rule line beside the verdict | Unexplained verdict | PASS |
| `SuppressionLedger` (CMP-39, conditional) | BD | Escalation | RP-005, X-4 | Face label "Override log"; reuse only if the label is configurable (S8-OD-4) | The word "suppressed" on any face | COND |

### 6.6 Demo storyline steps (naming and copy, RP-004 honest capability)

| Beat | Rules | Cursor MUST enforce | MUST avoid | Verdict |
|---|---|---|---|---|
| **B-1** Headroom and growth against capacity | CL-001, RP-004, NR "bottleneck vs driver", HF-7 | "Early warning, not a prediction" on every projection; "Restore capacity" / "Pace growth" only; result "Proposed to CEO and board on 27 October 2026 · decision pending" | "Forecast"; "AI predicts"; a decided outcome | COND (V-7) |
| **B-2** Green that is not defensible | RP-005, compliance AUTO_REJECT, HF-1, NR neutral labels | Face word "Unverified"; caveat result "caveat accepted by Eleanor Hartley `[fictional]` on 27 October 2026; in pack with caveat"; "records were not monitored", never "suspicious activity was missed" | "Cannot defend", "Attested without evidence" on faces (V-10); green after a caveat | COND (V-10) |
| **B-3** Restriction test failing; reportability drafted for an SMF | HF-3, HF-4, HF-8, NR firm-level regulation, RP-004 | "Case prepared · sent to Head of Compliance · decision pending"; "A flag firing is not evidence of adherence"; route names in plain words | "File", "notify", "submit"; the product shown deciding | COND (V-9) |
| **B-4** BRC chair: "Is bad news reaching me?" | RP-005, X-4, CL-012 | "Removed at ERC with no reason recorded"; "The product shows what qualified and who removed it. The chair decides." The beat question is the persona's own words (brief), kept | "Suppressed", "ignored", "buried"; CRO actions presented as the chair's | COND (9C-OD-4) |

---

## 7. Governance gaps (to add upstream in `yaara-frontend-dashboard-skill`; not invented here)

| GG | Gap | Needed by | Interim handling in this run (no rule authored) |
|---|---|---|---|
| **GG-1** | **No rule for a distinct "Unverified" (status withheld) visual state.** CL-009 covers good/alert colours only; no pattern for a fourth, non-RAG status, its ranking position, or how it suppresses gauges and deltas | `StatusToken`, `IntegrityBadge`, scorecard, Z5, beat 2 | Stage 6 section 4.2 structure only (word + glyph, never a RAG fill, underlying RAG in the drill). Visual treatment is 9C-OD-1b for the user |
| **GG-2** | **Persona context missing: BRC chair / board committee chair (SMF10, NED).** The index persona stack tops out at C-suite; no density, cadence or band question set for board altitude. Product context also lacks a UK board-risk (RAS / risk appetite) entry | S4 | C-suite rules applied as the nearest altitude |
| **GG-3** | **Rulebook contradiction:** AI Audit & Compliance product rule and CRO persona rule prefer "a single risk-posture heat map by domain" on the CRO landing; RP-001 and the compliance profile AUTO_REJECT bar heat-maps on a CRO screen | S1-Z4 | Selector AUTO_REJECT followed; ranked scorecard by category |
| **GG-4** | CF-003 question sets are written for weekly cadence ("this week"); no quarterly / board-cycle variant | All bands (V-2, V-4) | "What's due before the BRC" used as the cadence-matched reading of "this week" (rule 3) |
| **GG-5** | CL-018 lists banking grains only; no rule for a committee-anchored comparison ("vs last ERC") | Header switch | Held as 9C-OD-3 |
| **GG-6** | RP-009 does not say whether governance-object counts (clauses, routes, headlines, bounds) are exempt from thousands-scale | S1 integrity line, S3, tile O2 | Treated as exempt: they are not monitored-population counts |
| **GG-7** | LR-008 does not say whether a Layer 1 peer screen reached from the band counts toward drill depth | S1 → S3 / S4 | Treated as peer navigation, not a drill (Stage 6 section 6) |
| **GG-8** | CL-026 separates the change palette but does not define direction-of-good for risk metrics where an increase is adverse (appetite used, queue age) | `DeltaValue` | Change palette stays neutral to status; direction shown by sign and the rule line |
| **GG-9** | No rule for provenance / honesty labels (`[illustrative]`, `[practice-not-rule]`, "clock unverified", posture tags): placement and visual weight against CL-013 | `PracticeLabel` | Compact inline marker; full text in tooltip |
| **GG-10** | CF-002 gives no contrast thresholds and no guidance on brand accents whose hue collides with RAG semantics (lime #dcfc84) | Theme | WCAG 2.1 AA thresholds used for measurement (section 4) |

---

## 8. Open decisions

| # | Decision | Options | 9C recommendation | Owner |
|---|---|---|---|---|
| **9C-OD-1** (OD-1) | Theme | (a) light-first, low-chroma, dark toggle; (b) brand dark | Either passes under section 4; (a) has fewer conditions | User |
| **9C-OD-1b** (OD-1) | Unverified token visual | Pending GG-1 | Interim: word + glyph in the theme's neutral text colour; no RAG hue, not purple, not lime | User, then upstream |
| **9C-OD-2** | Remove reportability counts from the S1 band (V-3), partly superseding DS-14 | Accept; or keep and record a governance exception | Accept | User |
| **9C-OD-3** (S6-OD-4) | "vs last ERC" switch | Keep (GG-5) or cut to QoQ only | Cut for the sales demo; keep in the product backlog | User |
| **9C-OD-4** (S7-OD-2) | CRO actions on the S4 chair preview (B-4 restore acceptance) | Disabled with "for the BRC chair to decide" plus a separate "CRO preview actions" strip; or hide CRO actions on S4 | Separate labelled strip, so the chair's content stays single-persona | User |
| **9C-OD-5** | One-click export of the board view / pack extract (review checklist 9, CL-015) | Add an "Export pack view (PDF)" control; or omit for the demo | Omit for the demo; note for the product | User |
| **9C-OD-6** | S1 layout change (V-1): Z5 moves into the right column beside the headline | Accept; or keep the Stage 6 rows and record an AP-001 exception | Accept | User |
| Carried | OD-3 (BRC chair persona route), OD-5 (badge always on), S6-OD-2 (sanctions as second unverified headline), S7-OD-1, S8-OD-1 to S8-OD-7 | -- | Unchanged | User / repo |

---

## 9. Definition-of-done check

| Criterion | Status |
|---|---|
| Product key resolved in `product_context_index.md` | Met: AAC (section 1) |
| Altitude resolved | Met: C-suite; S4 board flagged (GG-2) |
| Rulebook files loaded in profile order | Met (header) |
| Real IDs only; no rule authored | Met; gaps listed in section 7 |
| Every screen, component and storyline step mapped | Met: 6 screen rows, 8 primitives, 21 data components, 7 AI, 5 v6 reuse, 4 beats |
| Precedence applied; no screen-specific rule generalised | Met; one contradiction flagged (GG-3) |
| Analyst matrix routing not mis-applied | Met: no analyst surface exists in this variant; RP-001 applied only to CRO and board screens |
| Feeds | Stage 10 (sections 2, 3, 5 and 6 verbatim); Stage 11 (sections 5 and 6 plus `frontend_review_checklist.md`) |

*End of Stage 9C. Not locked. The FAILs in section 5 are to be confirmed by the user and folded into Stage 10 as change instructions against Stages 6 to 8.*
