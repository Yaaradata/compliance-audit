# Stage 7 UX Blueprint -- yaara-uk-risk / cro-smf4-board

- **Run:** Yaara Risk & Compliance -- UK Banking, UK Board Risk View. Phase 3, stage 4 of 5.
- **Date:** 27 October 2026. **Status:** draft for confirmation; not locked.
- **Inputs read:** `PHASE3_BRIEF.md` (speed mode); `stage-7-ux-blueprint.md`; `conventions.md`; the methodology card anatomy (section F); the product profile (component vocabulary, roles and segregation of duties); the `sales-demo` intent; Stage 4 (sections 0–1.7, 4, 5); Stage 5 (sections 0–1.7, 2.4–2.6, 3, 4, the M10 and X9 rows of every section 5 block, 5.6, 6–9); Stage 6 (all).
- **ID key:** Q-n, HF-n, R-n, OD-n = Stage 4. C-n, O-n, K-n, E-n, TC-n, S5-OD-n = Stage 5. S1–S4, Z-n, DS-n, X-n, S6-OD-n = Stage 6. T2-n, H-n = Stage 3. New here: F-n (flows), DG-n (drill signatures), PG-n (process gaps), B-n (beats), HG-n (human gates), DS7-n (decisions), S7-OD-n (open decisions).
- **Demo firm:** Fernbridge Building Society `[fictional; illustrative]`. Demo "today": Tuesday 27 October 2026. Viewer: Eleanor Hartley `[fictional]`, CRO (SMF4). BRC chair: Graham Pryce `[fictional]`.

**Domain spine (every flow names the segments it traverses):** Strategic Objective → RAS Statement → Level 1 Metric → Level 2/3 Indicators and Thresholds → Policy Obligation → Control → Evidence / Data Feed → Accountable Owner → Attestation → Escalation / Reportability Decision.

**Standing rule for every "act now" in this file (applies to every row; not repeated):** the AI **prepares** or **proposes** a draft (O-1, AI marker + one-line reason) → a **named human gate** (O-2: Accept · Edit and accept · Reject) → an **audit entry** and artefact version (O-10, E-53, E-54) → optionally **send to owner** (O-7, internal only). Nothing is filed, notified, submitted or decided by the product. Board decisions read "proposed to the BRC on [date] · decision pending" (OD-9). There are no "file", "notify", "submit", "complete now" or "approve and send" controls anywhere (HF-8, X-9).

---

## 0. Gate summary

| Item | Decision in this file |
|---|---|
| Flows | 10 primary flows, one per Q1–Q10 (F-1 to F-10). Every flow reaches a gated draft and a routed owner |
| Click depth | CRO: card → evidence in **one** click (S2 or a scoped drill page); gated action is on the card face or in the drill (**two clicks to action at most**). No Layer 3 (rule 5) |
| Drill signatures | **11 distinct signatures** (DG-1 to DG-11), one per card type. No two share a drill block (section 2) |
| Process-gap diamond | **PG-1 (hero): T2-27 savings pot outside the flag's scope → product-launch control gap.** Six further routes PG-2 to PG-7 (section 3) |
| Storyline | Four beats in the brief's order (B-1 → B-4). The most differentiating signals (2 unverified, restriction breach) are already visible in the first viewport of S1 at open (section 4) |
| S6-OD-1 (where SMF16 records the beat 3 decision) | **Resolved for the spec (DS7-1):** the CRO view ends at "case prepared · sent to SMF16 · decision pending". The recorded-decision pattern is shown on a pre-seeded append-only row (event 2, SUP 15.3). A role-gated "Record decision" form exists only under the SMF16 viewer; the CRO never sees an enabled decision control. User to confirm (S7-OD-1) |
| S6-OD-5 (audit trail visibility) | **Resolved for the spec (DS7-2):** a compact inline "Audit trail (n entries)" list in S2 section i and in every scoped drill page, collapsed by default, expanded inline (no Layer 3). Faces show only "accepted by [name] on [date]" |
| Live behaviour | **None.** The persona has no real-time cadence (Stage 4 section 1.3). No streaming rail, ticker or timer-driven reveal |
| Persona switch | CRO ↔ "Viewing as BRC chair (preview)". UI state resets; the in-memory session record (gates, audit entries) persists (section 5.3) |

---

## 1. Primary flows (one per top question)

Format: landing → screen → card → drill → action → gate → routed owner. "1st click" = opens the evidence; "2nd click" = the gated action.

| Flow | Question | Path (landing → screen → card → drill) | Act now (verb → draft_type) | Human gate → routed owner | Audit entry (E-53 action) | Spine traversed |
|---|---|---|---|---|---|---|
| **F-1** | Q1 Appetite used; headroom | S1 → Z1 headline T2-1 (tile O1) → 1st click: S2 credit, section a (full gauge, cascade, plan versions, binding constraint K-4) | **Propose** appetite recommendation (options: re-phase / change appetite with rationale / confirm headroom use) → `decision_paper`; **prepare** `brc_paragraph` | CRO accepts → "proposed to the BRC on 27 October 2026 · decision pending"; CFO "accepted by" line for capital figures | `draft.created`, `gate.accept`, `decision_record.proposed` (keyed later by company secretary, D1) | Objective → RAS → L1 → thresholds → owner → escalation |
| **F-2** | Q2 Heading for amber before the next forum | S1 → Z4 LCR row, T2-4 marker → 1st click: S2 liquidity, section a (time to threshold K-9 vs weeks to BRC + ALCO lead time) and section c (indicator tree) | **Propose** pre-emptive owner action and early ERC flag; **prepare** `owner_note` | CRO accepts → send to owner (Treasurer `[fictional]`), CFO and ALCO | `draft.created`, `gate.accept`, `send_to_owner` | L1 → L2/3 → thresholds → owner |
| **F-3** | Q3 Figures I cannot defend | S1 → Z5 T2-14 (T2-17 inline) → 1st click: S2 financial crime, section b (DG-3 lineage) | **Prepare** `caveat_text`; **propose** `remediation_request` (feed owner, COO, CTO); **propose** `reattestation_challenge`; **open draft** triage entry → S3 ledger | CRO accepts caveat (face stays **Unverified**, DS-12); owner re-attests against a named run ID; SMF decides reportability | `draft.created` ×3–4, `gate.accept` per draft, `send_to_owner`, `ledger.draft_opened` | Metric → feed → runs → owner → attestation → escalation |
| **F-4** | Q4 Restriction obeyed; can the SMF attest | S1 → band (row 0) "What's critical: restriction breached" / Z4 row 1 → **peer nav** to S3 → Z1 T2-27 → 1st click: per-clause drill page (DG-6) → Z2 T2-28 → 1st click: clause evidence (DG-7) | **Propose** `containment_proposal` (SMF17); **propose** test-coverage fix (`read_across_test_proposal` to product owner and CTO, PG-1); **prepare** `per_clause_evidence_summary` (attesting SMF); **open draft** ledger entry | CRO accepts → send to SMF17 (deep link to MLRO workspace, OD-7); attesting SMF writes and signs outside the product | `draft.created`, `gate.accept`, `send_to_owner`, `ledger.draft_opened` | Obligation (restriction) → control → evidence → owner → attestation → reportability |
| **F-5** | Q5 Growth outrunning control capacity | S1 → Z2 T2-5 → 1st click: S2 financial crime, DG-2 dual-series | **Propose** exactly one of two: "Restore capacity" (+ **prepare** `resourcing_paper` for SMF17) or "Pace growth" (re-phase the campaign). No third option (HF-7) | CRO accepts → CEO, ExCo and board; "proposed · decision pending" | `draft.created`, `gate.accept`, `send_to_owner` (SMF17), `decision_record.proposed` | Objective → RAS → L1 (fin crime) → control capacity → owner → escalation |
| **F-6** | Q6 Trade-offs; collisions; floors | S1 → Z1 tile O2, T2-6 inline state → 1st click: S2 financial crime, section e (DG-4 pair) | **Propose** BRC re-decision (re-set bounds / restore guardrail / end trade-off); **prepare** `decision_paper` from register fields only. Floor row → "breach path" link → opens a draft ledger entry (S5-OD-5) | CRO accepts → BRC decides → company secretary keys the decision (D1) | `draft.created`, `gate.accept`, `decision_record.proposed` | RAS → L1 pair → floor obligation → escalation |
| **F-7** | Q7 Reportable; which clock; who decides | S1 → band (row 0) "What's critical: restriction breached" or Z4 row 1 (reportability is not in the band, V-3) → peer nav to S3 → Z3 ledger (route rows on the face under event group headers, V-9) → 1st click on a route row: route case drill page (DG-8) | **Prepare** `per_route_case` (facts, rule text by in-force date, options, **no default answer**); **propose** decider (SMF16 default). T2-30 (CRO and deciding SMF only): **prompt** to re-test the awareness date | CRO accepts the prepared case → send to SMF16 → SMF16 records the decision append-only (E-39) | `draft.created`, `gate.accept`, `send_to_owner`, `route_decision.recorded` (by SMF16 only) | Escalation → reportability decision |
| **F-8** | Q8 Is bad news reaching the BRC | S1 → band (row 0) "What's due before the BRC: 13 items qualify" → peer nav to S4 (viewer: BRC chair preview) → Z1 T2-34/T2-35 → 1st click: manifest drill (DG-9) | **Propose** one of three (remediation with owner / time-limited waiver / recalibration review) as `agenda_item`; **propose** restoring the item to the pack | Chair decides the agenda; CRO approves the pack (new manifest version); company secretary keys the decision (D1) | `draft.created`, `gate.accept`, `manifest.version_created`, `decision_record.proposed` | L2 → escalation |
| **F-9** | Q9 Read-across after a Final Notice | S1 → Z5 precedent line ("Metro, 12 November 2024") → 1st click: S2 financial crime, section g (precedent) + section b read-across (T2-32, T2-33) | **Propose** `read_across_test_proposal` on matched controls ("3 feeds share the batch design"); **prepare** a second-line note | CRO accepts → second line and SMF17 run the test | `draft.created`, `gate.accept`, `send_to_owner` | Precedent → control → feed → evidence |
| **F-10** | Q10 Emerging risks with no metric | S1 → scroll to Z6 T2-13 → 1st click: S2 at the mapped principal risk (DG-11 mapping) | **Propose** a new metric or owner, or a BRC horizon note | CRO accepts → principal-risk owner decides | `draft.created`, `gate.accept`, `send_to_owner` | Emerging risk → principal risk → L1 (missing) |

**Supporting flows** (same rule; reached from the flows above):

| Flow | Path | Act now | Gate |
|---|---|---|---|
| F-11 Promotion | S1 Z4 promotion lane "NSFR" → S2 liquidity section a | **Propose** promotion; **prepare** `promotion_reason`. Rotation-out candidate shown (S6-OD-3) | CRO; headline-set change logged |
| F-12 Badge expansion | Any badge → inline expansion (not a drill) → "Open evidence" → S2 section b | As F-3 | As F-3 |
| F-13 Handoff | Any `send_to_owner` → inline confirmation "Sent to [role] · audit entry [ref]" | -- | Deep links only to the v6 CRSA cockpit (SMF16) and MLRO workspace (SMF17); COO, CTO and owners get a confirmation only (OD-7) |
| F-14 Back | Any drill → "Back to [origin screen]" → origin screen with the clicked item highlighted and scrolled into view | -- | -- |

**Dead-end check:** every flow ends at a gated draft with a routed owner. The only zones with no action of their own are the AI bands (row 0 on S1, S3 and S4: routers to peer screens or zones, V-1, V-4) and the S4 footer counts, both of which lead into flows that end in an action.

---

## 2. Drill-down signatures (distinct per card type)

There are no matrices or heat-maps on any screen (R-3, X-2), so the stage file's "matrix cell" signature does **not apply**. Its bug-class rule (route by the item's own ID, never a shared constant) applies to every row-based drill below: scorecard rows, ledger rows, route rows, clause rows, feed items and manifest items.

| Sig | Card type (cards) | Opens as | Drill shape (in order) | What it proves | How it differs from the others |
|---|---|---|---|---|---|
| **DG-1** | **Position / headroom** (T2-1; strip tiles O1, O3 with T2-2, T2-8; scorecard position rows) | S2, section a, at the clicked principal risk | Full headroom gauge (set · actual · projection marker, labelled "projection", never "forecast" (V-7); range and stress, P4) → strip-tile detail moved off the tile face (V-6): headroom £, trajectory, the T2-2 first-time-buyer marker → threshold cascade (capacity → red → amber → operating limit) with approved rationale and calibration version → trajectory (window, points, slope, "early warning, not a prediction") → **binding-constraint ladder** (K-4: which of appetite, CET1, leverage, LCR, NSFR binds first at plan volumes) → plan versions → roll-up rule used ("worst-of `[practice-not-rule]`") | The figure's position against its own nested thresholds, and when a constraint binds | The only drill that leads with a gauge and a **ranked constraint ladder**; no evidence chain, no list |
| **DG-2** | **Growth vs capacity** (T2-5) | S2, financial crime section, capacity sub-block | **Two series on one time axis** (members index vs qualified handlers index; K-13 beside K-14) → queue median age against amber 14 since August (K-15) → next campaign date marker (6 weeks) → "resourcing action or decision recorded in the window: none" (decision-register search, empty) → precedent (Starling; Monzo, posture-tagged) → **two-option proposal block** | Growth is outrunning qualified capacity, and no decision exists | The only **dual-series single-axis** drill; ends in a closed binary choice, never a free option list |
| **DG-3** | **Chain integrity / unverified** (T2-14 with T2-17; badge failures T2-15, T2-16, T2-18) | S2, section b, at the clicked feed | **Lineage chain** metric → feed → last 3 reconciliation runs (result IDs) → cohort breakdown (same-day 0%; others 99.97%) → **attestation timeline** (signature time vs run completion per cycle; month 2 signed 3 hours early) → **ruled-out alternatives** ("cut-off rule applied; grace window applied; not a timing lag; not a value restatement") → "would read within appetite if verified" (underlying RAG, here only) → read-across (T2-32: 3 feeds share the batch design) → precedent (Metro) | The board figure cannot be defended, and why it is not a false positive | The only drill with a **lineage chain + timeline + ruled-out list**; shows the underlying RAG that is hidden everywhere else |
| **DG-4** | **Tension pair** (T2-6 inline; T2-7 waiver) | S2, section e | **Bound-by-bound pair table**: each bound beside its partner value (conversion +6.2 vs +5 cap; high-risk acceptance 1.1% vs 0.8%; third bound within) → review date (27 days overdue) → **floor row rendered as a breach** ("pre-CDD transacting: regulatory floor, not a trade-off") with "Open breach path" → keyer, keyed date and `source_decision_ref` (D1) → waiver conditions and expiry (TC-2 note) | The agreed trade-off is outside its own terms, and one "trade-off" is a floor | The only drill organised as **paired values with a keyer block**; the floor row exits to the reportability path |
| **DG-5** | **Ranked scorecard row** (T2-12 rows; promotion lane; T2-4 marker) | S2 at the row's principal risk, with **contributors first** | **Contributors**: the Level 2/3 children of the Level 1 row, ranked worst first under the worst-of roll-up → status history (quarters) → 1-click focus on one contributor (still inside S2, highlighted; no Layer 3) → promotion reason (T2-12) or weeks-to-amber arithmetic (T2-4) | Which children make the headline what it is | The only **coverage/portfolio** drill: breakdown → worst contributors → focus a contributor. Routed by the row's `unit_id` (DS7-5) |
| **DG-6** | **Population test** (T2-27) | Scoped drill page "Restriction clause evidence", keyed by `clause_id` | **Population funnel** in scope 33,400 → tested 9,400 → breaches 112 accounts / 104 customers → **breaches by route** (savings pot 97; others per 9A, TC-5) with the manual-route lane separate → **untested** 24,000 partner-channel openings shown as untested, never compliant → test definition → months since last zero-breach month (4) → labelled contrast line ("Flag dashboard: fired 1,208 times, 100% blocked. A flag firing is not evidence of adherence.") → restriction reference (R-03) and clause owner (TC-4) | Adherence by population, not by flag | The only **funnel + by-route** drill; the contrast line exists only here (HF-3, X-10). Counts only; records stay in SMF17's restricted view |
| **DG-7** | **Attestation evidence** (T2-28) | Scoped drill page "Attestation evidence", keyed by `restriction_id` + period | **Clause list** (4 rows: supported / partly / not supported) → per clause: the test runs present ÷ months in the period, breaches, milestones → prior attestations (dates, signer role) → "facts to disclose" proposal | Whether the attestation about to be signed matches the evidence | The only **clause-by-clause verdict list**; it never shows or drafts attestation wording (H-25 teaser only) |
| **DG-8** | **Worklist / ledger** (T2-29; T2-30 inline) | Scoped drill page "Reportability case", keyed by `route_id`, opened in **one click from a route row on the S3 face** (V-9; the event group header is not clickable) | **One route's case** (with the event and its sibling routes as context): facts (with T2-27 counts attached for event 1) → rule text by in-force date (clock "unverified" badge, S5-OD-7) → elapsed vs clock and 24-hour triage target `[firm practice, not rule]` → options with rationale (**no default answer**) → proposed decider → dissent field (read-only for the CRO) → **append-only decision history** → T2-30 block (CRO and deciding SMF only): earliest structured signal timeline (issue 21 August; test failed 02 September; logged awareness 14 October; gap 54 days) | Every engaged route needs a named decision, and who is deciding | The only **queue-to-item** drill with an append-only history; the Boolean-trap row ("1 of 4 routes decided") lives here |
| **DG-9** | **Exception feed / override log** (T2-34 + T2-35; feed items) | Scoped drill page "Pack manifest", keyed by `manifest_id` + `item_id` | **Manifest version diff** draft → locked → circulated (item present in draft v1, absent in v2) → the routing rule the item met → override row (approver: none; reason: none) → status history (14.2 → 15.8 → 16.9 per 10,000; amber 14, red 18) → decision-register search for the window (**empty**) → can tell / cannot tell (P2 copy; H-1 teaser) | The item qualified and left the pack with no recorded reason | The only **version-diff** drill; nothing can be removed from it (non-suppression, O-3) |
| **DG-10** | **Governance KRI tiles** (T2-36, T2-37, T2-38) | S2-style drill page per tile, keyed by tile `unit_id` | Three **different** shapes under one tile shell: T2-36 → **backlog series vs committed clearance line** (31 vs 12 months; extensions 3 vs limit 2; "never in a BRC pack" manifest search). T2-37 → **latency distribution with n** (median 4.6 months, n = 23; the 3 unescalated items listed by business unit; T2-39, T2-40 below; count only under the minimum n, S5-OD-11). T2-38 → **action-vs-metric pairs** (closed action beside its linked metric still outside band; downgrades with no metric movement; share of actions with no linked metric) | Weakness ageing; slowness; closures that fixed nothing | Same tile shell, three drill shapes: series-vs-commitment, distribution, paired before/after. Each differs from DG-1 to DG-9 |
| **DG-11** | **Mapping / horizon** (T2-13; T2-3 chip; T2-18 dot) | S2 at the mapped principal risk, mapping sub-block | **Mapping chain with the missing link shown as a gap**: emerging risk (or initiative, or obligation) → principal risk → Level 1 metric (**none**) → owner (none or named) → horizon band and time to crystallise | Something in horizon (or in plan) is measured by nothing | The only drill whose evidence is an **absence**, rendered as a broken link in the chain |

**Shared drill frame (not a signature):** every drill carries the clicked item's state sentence top-left, its badge expanded, "Back to [origin]", section i (drafts + gate + inline audit trail) and section h (can tell / cannot tell + extension teaser, R-12). The frame is common; the evidence block (DG-n) is never shared.

---

## 3. Cross-owner / process-gap "diamonds"

One function's data reveals another function's process gap. Each is designed explicitly: a **"Process gap" sub-block** in the drill names the gap type and the receiving owner, with its own send-to-owner draft. Source: Stage 4 section 4.4.

| # | Trigger (on the CRO view) | Process gap revealed | Routed owner | What they receive (`send_to_owner` after CRO gate) | Beat |
|---|---|---|---|---|---|
| **PG-1 (hero)** | T2-27: 97 of 112 breaching accounts opened via the **new savings pot**, a route outside the restriction flag's scope; 24,000 partner-channel openings untested | **Product-launch control gap**: a new product route launched without extending the restriction control or its population test | Product owner (savings) and CTO (test coverage); SMF17 for containment | Draft: route counts (no customer records), the clause, "flag scope does not include savings pot; partner channel untested", ask = extend the flag and the population test to both routes, by a date the owner proposes | B-3 |
| PG-2 | T2-14: same-day accounts 0% monitored | **Data-feed design gap**: a timestamp or cut-off rule excludes a cohort from the monitoring feed | COO and CTO (feed owner); SMF17 | Draft remediation request: run IDs, cohort counts (TC-3), cut-off rule, ask = fix and re-run, then re-attest | B-2 |
| PG-3 | T2-17: attestation signed 3 hours before the run completed | **Workflow-sequencing gap**: the attestation workflow allows signing before evidence exists | Second line (attestation process owner); COO | Draft: per-cycle signature vs run-completion times; ask = block signature until the referenced run is complete | B-2 |
| PG-4 | T2-5: queue age past amber; next campaign in 6 weeks; no resourcing decision | **Planning-governance gap**: campaigns are planned without a control-capacity check | CEO and ExCo (planning); SMF17 | The two-option proposal plus "add a capacity check to campaign approval" | B-1 |
| PG-5 | T2-35: item removed at ERC with no reason | **Governance-process gap**: the pack build allows unlogged removals | Company secretary and CRO office | Draft: manifest diff; ask = require approver + reason code on every removal | B-4 |
| PG-6 | T2-3: business current account launch (Q1 2027) with no RAS link | **Planning-to-appetite gap** | CFO (planning) with the CRO | Draft proposal of the missing RAS line and financial crime metric (CRO proposes; CFO co-signs, G-4) | B-1 (chip; mentioned) |
| PG-7 | T2-19 (drill): deployed value differs from approved | **Change-control gap** | CTO and model risk | Draft: change record refs; proposer, approver and validator must differ | Drill only |

---

## 4. Demo storyline (ordered beats)

**Arc (DS7-3):** the brief's beat order is kept (B-1 → B-4), because S1 is the landing and the Stage 6 headline joins Q1 and Q3. The most differentiating signals are not held back: at the 5-second read, S1 already shows the row 0 band ("What's critical: restriction breached · 2 of 12 headlines unverified", V-1, V-2) above the headline, and "10 of 12 verified · 2 unverified" under it. An alternative "lead with beat 3" ordering is S7-OD-3.

**Talk track timing:** about 8–10 minutes in total; each beat 2–3 minutes.

| Beat | Screen and hook (what the CRO notices) | Drill (the proof) | Act now (draft) | Human gate + audit (what the audience sees) |
|---|---|---|---|---|
| **B-1 Headroom and growth against control capacity** | S1 at open. Z1 headline: "88% of high-LTV appetite used: £96m headroom on a £4.0bn new-lending plan `[illustrative]`". Then Z2: "Members +31%, qualified handlers +9%. Queue age 19 days against amber 14, since August." Tile O2: "2 of 3 bounds exceeded · review 27 days overdue", with the floor row | Click 1 on Z2 → **DG-2**: both series on one axis, queue age, campaign in 6 weeks, decision-register search empty, Starling/Monzo precedent. (Optional: click tile O2 → **DG-4**, floor row as breach) | **Propose** "Restore capacity" with a **prepared** resourcing paper for SMF17, **or** "Pace growth". Presenter picks "Restore capacity" | AI draft chip + reason → CRO clicks **Accept** → card reads "Proposed to CEO and board on 27 October 2026 · decision pending"; "Sent to Head of Financial Crime" confirmation; audit trail +3 entries (`draft.created`, `gate.accept`, `send_to_owner`). PG-4 noted |
| **B-2 Green that is not defensible** | Back on S1 (item highlighted). Z5: "**Unverified**: transaction monitoring coverage. Records reconciled 94.0% (2,256,000 of 2,400,000); same-day accounts 0% monitored." The scorecard shows the row with the Unverified token and no RAG | Click 1 → **DG-3**: lineage → last 3 runs → cohort breakdown → attestation timeline ("month 2 signed 3 hours before the run finished") → ruled-out alternatives → "would read within appetite if verified" → Metro precedent → "3 feeds share the batch design" | **Prepare** caveat text; **propose** remediation request (PG-2) and re-attestation challenge (PG-3); **open a draft** triage entry in the ledger | CRO **Edits and accepts** the caveat (one word changed, to show editing) → face stays "Unverified" with "caveat accepted by Eleanor Hartley on 27 October 2026; in pack with caveat" (DS-12). Remediation **accepted** → "Sent to feed owner, COO and CTO". Draft ledger entry appears in S3 as "case not prepared". Audit trail shows each entry with artefact version v1 → v2 for the caveat |
| **B-3 Restriction test failing; multi-clock reportability drafted for an SMF decision** | Band (row 0) "What's critical: restriction breached" → peer nav to **S3**; the S3 band (row 0, V-4) reads "What's critical / What's due before the BRC: attestation in 12 days / What's holding steady: 3 of 4 clauses supported". Z1: "**No**: 112 accounts for 104 customers in breach, in 9,400 tested this month. 24,000 partner-channel openings untested." Contrast line: "fired 1,208 times, 100% blocked" | Click 1 on Z1 → **DG-6** funnel, by route (savings pot 97), untested lane → **PG-1** diamond block. Back → Z2: "1 of 4 clauses not supported" → **DG-7** clause list. Back → Z3 ledger: route row SUP 15.3 under the event 1 group header (on the face, V-9) → one click → **DG-8** case. Event 2 shows "1 of 4 routes decided" (the Boolean trap) and the **T2-30** block (54 days) | **Propose** containment to SMF17 and the coverage fix (PG-1). **Prepare** the per-clause evidence summary for the attesting SMF. **Prepare** the case per route (no default answer); **propose** SMF16 as decider. **Prompt** the deciding SMF to re-test the awareness date (event 2) | CRO **Accepts** each → "Sent to Head of Financial Crime" (deep link to the MLRO workspace); "Case prepared · sent to Head of Compliance · decision pending" on each route. Presenter points at event 2's SUP 15.3 row: "Decided by [SMF16 name] on 23 October 2026 · rationale · dissent: none" (pre-seeded, append-only) to show what the SMF's record looks like (DS7-1). Nothing is filed or notified; the clocks keep running on screen |
| **B-4 BRC chair: "is bad news reaching me?"** | Header nav → **S4**, viewer chip "Viewing as BRC chair (preview)". Z1: "1 item qualified for this BRC but was removed at ERC on 14 October 2026 with no reason recorded: vulnerable-customer exceptions, amber for 3 quarters" | Click 1 → **DG-9**: manifest diff v1 → v2, routing rule met, override with no approver and no reason, status history, decision-register search empty, can tell / cannot tell (H-1 teaser: "Extension: committee minutes (next module)") | **Propose** one of three options for the chair; **propose** restoring the item to the pack. Z3 tiles: **propose** agenda item (T2-36), governance review (T2-37), re-open (T2-38) | In the preview the gate is shown as "for the BRC chair to decide". The CRO **accepts** the restore proposal → new manifest version v3 (draft) → "item restored · awaiting CRO pack approval"; audit +2. Close: "The product shows what qualified and who removed it. The chair decides." PG-5 noted |

**Closing line (talk track, not on screen):** "Every number had a denominator, every status had its chain, every action was a draft that a named person accepted, and every acceptance is in the audit trail."

**Reset between demos:** a presenter-only "Reset demo data" control in the header overflow menu re-seeds the in-memory store (section 5.3). It is not a filter and is not shown in screenshots.

---

## 5. Interaction states (sales-demo intent: happy path built; others static, never breaking the walk)

### 5.1 Selection, filter, navigation

| State | Behaviour |
|---|---|
| Hover / focus on any card, tile, row | Shows the rule line (deterministic) or the AI reason (with AI marker) as a tooltip; keyboard focusable; no click needed for the explanation (rule 2) |
| Click a card, tile or row | Opens its drill keyed by the item's own `unit_id` (or `clause_id`, `route_id`, `manifest_id`), never a shared constant (DS7-5) |
| Badge click | Expands inline to the failing check's text line; a second control "Open evidence" goes to DG-3 |
| Boxed lists (V-8, V-9) | S1 scorecard shows 4 visible rows (the urgent set) and scrolls internally; its summary line and promotion lane stay fixed beneath the box. S3 ledger shows ~4 visible route rows and scrolls internally; event group headers are not clickable. Keyboard focus moves into the box and scrolls the focused row into view |
| Strip tile hover (V-6) | Tooltip carries headroom £, trajectory and (O1) the first-time-buyer marker; click opens DG-1 |
| Integration star (V-11) | Star beside the title of any bank-feed card or row; hover or focus shows the caveat "needs the society's [feed] access" |
| Return from drill | Origin screen restored at the same scroll position; the clicked item highlighted until the next interaction |
| Selected row in a drill (DG-5 contributor, DG-8 route) | Highlighted in place; the detail opens beneath, inside the same drill (no Layer 3) |
| **Filters** | Only three: (1) comparison switch "Q3 vs Q2" (default) / "vs last ERC (14 October 2026)" in the header; (2) **Fraud filter** in the S2 financial crime section only (X-3); (3) firm type (`building_society` default) as a presenter configuration, not a viewer filter. No date-range picker (X-8) |
| Comparison switch | Re-labels every delta and the "new since last ERC" markers; statuses do not change; selection and open drill are kept |
| Firm-type switch | Re-evaluates every unit; T2-8 is removed with no empty slot; T2-5 readout swaps (Stage 5 section 9.1); closes any open drill and returns to S1 |

### 5.2 Loading, empty, error (per screen; matches Stage 6 section 7)

| Screen | Loading | Empty | Error / missing data |
|---|---|---|---|
| S1 | Static skeleton per zone (no spinner, no timer) | Scorecard "No headline outside appetite this quarter" (not used in the walk) | Zone reads "Not assessed: [reason]"; never blank, never green |
| S2 / drill pages | Static skeleton | Section i: "No drafts for this item"; audit trail "No entries yet" | Section reads "Evidence not available for this period" |
| S3 | Static skeleton | Ledger "No open events" | Route clock "Clock unverified" (S5-OD-7) |
| S4 | Static skeleton | "All qualifying items are in the pack" | Below minimum n: count only (S5-OD-11); a D1 register with no entry: "Not assessed (register not keyed)" |
| Gate actions | Immediate (in-memory) | -- | If a gate write fails, the draft stays "AI draft · not accepted" and shows "Not recorded; try again". It never shows a false "accepted" |

**Honest states built as part of the story (not stubs):** Unverified (two rows); caveat accepted but still Unverified; trajectory withheld under 4 points; untested population; Boolean-trap row; "SAR question open" only; T2-30 not rendered for the chair; "proposed · decision pending".

### 5.3 Live behaviour and reset rule

| Item | Rule |
|---|---|
| Simulated live behaviour | **None.** No streaming rail, ticker, auto-refresh, typing animation or timer-driven reveal. Route clocks show elapsed time computed from the demo "today" (27 October 2026), not a running clock |
| Viewer switch (CRO ↔ BRC chair preview; SMF16 viewer if S7-OD-1 option b) | **Resets UI state:** open drill, highlight, expanded badges, scroll, comparison mode, Fraud filter. **Re-evaluates visibility scopes:** T2-30 unmounted (not hidden) for the chair; SAR status-only above SMF17 |
| What persists across a viewer switch | The in-memory session record: gate decisions, drafts' statuses, artefact versions and audit entries. Beat 4 therefore sees the beat 1–3 outcomes (for example the caveat in the pack) |
| Timers | Any timeout used (for example a toast) is cleared on unmount and on viewer switch (Stage 8 constraint) |
| Storage | No browser storage. A page reload returns to the seeded state |

---

## 6. Human gates and maker-checker

### 6.1 Gate register (every act-now moment)

| HG | Card | Draft (`draft_type`, verb) | Gate holder (named) | Decider / receiver | Face after gate | Audit entries |
|---|---|---|---|---|---|---|
| HG-1 | T2-1 | `decision_paper` (propose), `brc_paragraph` (prepare) | CRO; CFO "accepted by" for capital figures | BRC, then board; company secretary keys (D1) | "Proposed to the BRC on [date] · decision pending" | draft.created, gate.*, decision_record.proposed |
| HG-2 | T2-4 | `owner_note` (prepare); early ERC flag (propose) | CRO | Owner; CFO and ALCO | "Sent to [role]" | + send_to_owner |
| HG-3 | T2-5 | `resourcing_paper` (prepare); restore/pace (propose, 2 options) | CRO | SMF17 (paper); CEO and board (decision) | "Proposed · decision pending" | + send_to_owner |
| HG-4 | T2-6 | `decision_paper` (prepare); re-decision (propose) | CRO | BRC; company secretary keys | "Proposed to the BRC · decision pending" | as HG-1 |
| HG-5 | T2-12 | `promotion_reason` (prepare); promotion (propose) | CRO | CRO (headline set) | "Promoted by [name] on [date]" | + headline_set.changed |
| HG-6 | T2-13 | `owner_note` / metric proposal (propose) | CRO | Principal-risk owner | "Sent to [role]" | + send_to_owner |
| HG-7 | T2-14 | `caveat_text` (prepare); `remediation_request` (propose); triage entry (draft) | CRO | Feed owner, COO, CTO; SMF decides reportability | "Unverified" + "caveat accepted by [name] on [date]" | + caveat.accepted, ledger.draft_opened |
| HG-8 | T2-17 | `reattestation_challenge` (propose) | CRO | Feed owner re-attests against a named run ID | Attestation dot "Attestation precedes a completed run · challenge sent" (V-10) | + send_to_owner |
| HG-9 | T2-27 | `containment_proposal` (propose); coverage fix (propose); ledger entry (draft) | CRO | SMF17 (contains); product owner and CTO (PG-1) | "Sent to Head of Financial Crime" | + send_to_owner, ledger.draft_opened |
| HG-10 | T2-28 | `per_clause_evidence_summary` (prepare); facts to disclose (propose) | CRO | Attesting SMF writes and signs outside the product | "Evidence summary sent to [role]" | + send_to_owner |
| HG-11 | T2-29 | `per_route_case` (prepare); decider (propose) | CRO accepts the case | **SMF16 records** the decision (E-39) | "Case prepared · sent to Head of Compliance · decision pending" → after SMF16: "Decided by [name] on [date]" | + route_decision.recorded (SMF16 actor only) |
| HG-12 | T2-30 | Awareness-date prompt (prompt) | CRO | Deciding SMF records `awareness_date_stands` | "Prompt sent to deciding SMF" | + send_to_owner |
| HG-13 | T2-34 / T2-35 | `agenda_item` (propose, 3 options); restore item (propose) | CRO (pack); chair (agenda) | BRC chair; company secretary keys (D1) | "Item restored · awaiting CRO pack approval" | + manifest.version_created |
| HG-14 | T2-36 / T2-37 / T2-38 | `agenda_item`, `governance_review_proposal`, re-open request (propose / prepare) | CRO (as pack owner); chair | Chair; owner and SMF5 (T2-38) | "Proposed to the BRC chair" | as HG-1 |
| HG-15 | Drill cards (T2-7, T2-9, T2-19 to T2-24, T2-32, T2-33, T2-42) | As Stage 5 section 5.6 | CRO | As Stage 5 section 5.6 | "Sent to [role]" | as HG-2 |

**Gate controls (fixed):** Accept · Edit and accept · Reject (with reason code). Reject leaves a "Rejected by [name] on [date]" line and an audit entry; the draft is not deleted. "Edit and accept" creates artefact version n+1 with `parent_artifact_id` (E-54).

**Audit entry rendering (inline list, DS7-2):** `[DD Month YYYY HH:MM] · [name] ([role]) · [action] · [object, plain name] · v[n] · [reason code]`. Entry IDs, hashes and object codes appear only in a tooltip (rule 7).

### 6.2 Maker-checker chains (explicit flows)

| Chain | Maker | Checker 1 | Checker 2 / decider | Return path | Segregation rule |
|---|---|---|---|---|---|
| **MC-1 Attestation** (T2-14, T2-17) | Feed owner attests a **result ID** (E-21) | Second line challenges (C-10 check runs automatically) | CRO accepts caveat or withholds the figure | "Return with reason": the challenge goes back to the owner, who re-attests against a named, completed run | The attester may not own the control tested (ER-7, C-9) |
| **MC-2 Reportability** (T2-29, T2-30) | AI prepares the case per route (CRO office reviews) | CRO accepts the prepared case and proposes the decider | **SMF16 records** decision, rationale and dissent, append-only | A later fact appends a superseding row; nothing is edited | The product and the CRO never record SMF16's decision; T2-30 visible to CRO and deciding SMF only (D6) |
| **MC-3 Pack build** (T2-34, T2-35, T2-36 to T2-38) | CRO office assembles the draft manifest (O-4) | CRO approves (draft → locked) | Chair receives the circulated pack and the override log | Any removal needs approver + reason code; restore creates a new draft version | Qualifying items are non-suppressible (`suppressible = false`) |
| **MC-4 Board decision** (T2-1, T2-5, T2-6, T2-34) | CRO proposes | BRC / board decides (outside the product) | Company secretary keys the decision (D1) | Until keyed: "decision pending" | The product never shows itself deciding (OD-9) |
| **MC-5 Calibration / change** (T2-19, T2-20, T2-24) | Proposer (AI draft `calibration_proposal`, accepted by CRO) | Accountable owner approves | Second line or model risk validates | Rejection returns to proposer with reason | Proposer, approver and validator are three different people; no product write path to thresholds (ER-10) |

---

## 7. Decisions taken in this stage

| # | Decision | Basis |
|---|---|---|
| DS7-1 | S6-OD-1: CRO flow ends at "case prepared · sent to Head of Compliance · decision pending"; a pre-seeded append-only SMF16 decision row demonstrates the record; a role-gated "Record decision" control exists only for the SMF16 viewer | Boundary (HF-4, HF-8); OD-7; keeps the CRO from appearing to decide |
| DS7-2 | S6-OD-5: inline collapsible audit trail in every drill; faces show only "accepted by" | Trust threshold item 8; rule 5 (no Layer 3) |
| DS7-3 | Beat order B-1 → B-4 as the brief; differentiating signals visible at open | Brief; Stage 6 headline (DS-2) |
| DS7-4 | No simulated live behaviour at all | Persona cadence (Stage 4 section 1.3); removes the stale-closure bug class |
| DS7-5 | Every drill is addressed by the item's own ID (`unit_id`, `clause_id`, `route_id`, `manifest_id` + `item_id`) | Stage file bug class |
| DS7-6 | Gate outcomes persist across viewer switch within the session; UI state resets | Beat 4 must see beats 1–3 outcomes; persona-switch bug class |
| DS7-7 | Presenter-only "Reset demo data" re-seeds in memory | Repeatable demos without storage |
| DS7-8 | Each process gap is an explicit "Process gap" sub-block with its own send-to-owner draft | Stage file 7.3 |
| DS7-9 | B-2 demonstrates "Edit and accept" (versioning); B-1 and B-3 demonstrate "Accept"; Reject is available but not walked | Shows all gate controls without lengthening the walk |

## 8. Open decisions

| # | Decision | Recommendation | Owner |
|---|---|---|---|
| **S7-OD-1** | Where SMF16 records the beat 3 decision: (a) pre-seeded row only, (b) also a role-gated form under an SMF16 viewer in this variant, (c) deep link to the v6 CRSA cockpit | (a) for the demo walk; build (b) only if the user wants SMF16 shown live. (c) only if the cockpit has a ledger surface `[unverified -- confirm against repo]` | User |
| S7-OD-2 | Whether the BRC chair preview gate controls are shown disabled ("for the chair to decide") or hidden | Disabled with label, so the audience sees who decides | User / 9C |
| S7-OD-3 | Beat order: brief order (1–4) or lead with beat 3 for a compliance-led audience | Keep 1–4; offer the alternative as a talk-track variant | User |
| S7-OD-4 | Whether PG-1 names the savings product owner as a role or a fictional name on the face | Role on the face, name in the drill (Stage 6 convention) | 9A |
| Carried | OD-1 (theme; Unverified token), OD-3 (BRC chair route), OD-5, OD-7, OD-8, OD-9, S5-OD-5, S5-OD-7, S5-OD-8, S6-OD-2, S6-OD-3, S6-OD-4; tie-outs TC-2 to TC-10 (B-2 and B-3 depend on TC-3, TC-5, TC-6, TC-7; B-4 on TC-10) | Unchanged | As listed |

## 9. Definition-of-done check

| Criterion | Status |
|---|---|
| Every top question has a flow that reaches an action or a routed owner | Met: F-1 to F-10 |
| No two card types share an identical drill block | Met: DG-1 to DG-11; only the drill frame is shared |
| Process-gap moment designed | Met: PG-1 (hero) to PG-7 |
| Storyline ordered; every beat ends in act-now + approve | Met: B-1 to B-4 |
| Every state the intent requires is specified | Met: section 5; live-reset rule stated |
| Spine traversed in every flow | Met (section 1, last column) |
| No auto-fire; prepare / propose only | Met: section 6 |

*End of Stage 7. Not locked. Feeds: Stage 8 (flows, DG-1 to DG-11, drill IDs, viewer-switch rule), 9B (beat payloads and evidence packs per DG), 10 (storyline and gates to build).*

---

## Revision 27 October 2026 — 9C fixes applied

Source: `Stage9C_Build_Quality_Filter_v1.md` section 5. No figures changed.

| V | What changed in this file |
|---|---|
| V-1 | Flows, dead-end check and storyline arc now refer to the S1 band in row 0 (above the headline), not "Z3 band" below it |
| V-2 | Band references use the C-suite set ("What's critical / What's due before the BRC / What's holding steady"); "Needs a decision" removed from F-4 and B-3 |
| V-3 | F-7 no longer enters via a band "2 reportable events" item; it enters via "What's critical: restriction breached" or scorecard row 1 |
| V-4 | Dead-end check covers the bands on S1, S3 and S4; B-3 names the S3 band content |
| V-5 | No flow change; B-2's scorecard row reads as status + badge + "shown above" anchor per Stage 6 |
| V-6 | DG-1 receives the strip-tile detail moved off the face (headroom £, trajectory, first-time-buyer marker); tile tooltip row added to section 5.1 |
| V-7 | DG-1 full gauge marker labelled "projection", never "forecast" |
| V-8 | Section 5.1 boxed-list behaviour for the S1 scorecard (4 visible rows, internal scroll) |
| V-9 | F-7, B-3 and DG-8: route rows on the S3 face under non-clickable event group headers; one click from a route row to DG-8; section 5.1 boxed-list behaviour |
| V-10 | HG-8 face text → "Attestation precedes a completed run · challenge sent" |
| V-11 | Section 5.1 integration-star interaction added |
