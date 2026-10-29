# Stage 6 UI Specification -- yaara-uk-risk / cro-smf4-board

- **Run:** Yaara Risk & Compliance -- UK Banking, UK Board Risk View. Phase 3, stage 3 of 5.
- **Date:** 27 October 2026. **Status:** draft for confirmation; not locked.
- **Inputs read:**
  - `PHASE3_BRIEF.md`, including speed mode;
  - the stage file `stage-6-ui-specification.md`;
  - `conventions.md` sections 7 and 9;
  - the run configuration;
  - the product profile (component vocabulary, brand rules);
  - the methodology file (section F, card anatomy);
  - the persona profile (must-show, remove list, example screen set);
  - the `sales-demo` intent;
  - Stage 4 (all 545 lines);
  - Stage 5 (paged through sections 0–3, 4.4–4.5, 5.1–5.6, 6, 7, 8 and 9);
  - the Stage 3 catalogue: the card headers and tags for T2-1 to T2-45, section 6 (classification and the 24x7 set), section 7 (P1–P21) and section 8.1 (guardrails).
- **Speed mode:** tables, not prose. Earlier content is cited by ID: Q-n, HF-n, R-n and OD-n are from Stage 4; C-n, O-n, K-n, E-n, TC-n and S5-OD-n are from Stage 5; T2-n and P-n are from Stage 3.
- **Not decided here:** colour, spacing and chart styling (9C); flows and drill signatures (Stage 7); component names and props (Stage 8); seeded values (9A).
- **Demo firm:** Fernbridge Building Society `[fictional; illustrative]` (`firm_type = building_society`, still configurable).
- **Demo "today":** Tuesday 27 October 2026, building the Q3 2026 BRC pack.

**Domain spine (every zone below names its segment):** Strategic Objective → RAS Statement → Level 1 Metric → Level 2/3 Indicators and Thresholds → Policy Obligation → Control → Evidence / Data Feed → Accountable Owner → Attestation → Escalation / Reportability Decision.

---

## 0. Gate summary

| Item | Decision in this file |
|---|---|
| Screens | **4 screens.** Three are Layer 1 peers: S1 Board Risk View (landing), S3 Restrictions and reportability, S4 Escalation health (BRC chair). One is Layer 2: S2, the principal-risk drill. This is within the intent's 3–5 |
| Hero beats | Beat 1 and beat 2 → S1, with S2 as their drill. Beat 3 → S3. Beat 4 → S4 |
| Default landing | S1 Board Risk View, for the CRO (SMF4) |
| S1 headline | "How much appetite are we using to grow, and can we defend it?" Stage 4's proposal is confirmed (DS-2) |
| **OD-4 density** | **Resolved as Stage 4 recommended.** T2-6 is an inline state of strategy-strip tile O2. T2-17 is an inline state of the integrity badge's attestation dot, expanded on the T2-14 card. Visible units above the fold: T2-1 (headline), T2-5, T2-14 and the scorecard (T2-12). T2-13 sits below the fold. The stage file does not argue otherwise; rule 4 and the 5-second headline require it (DS-3) |
| v6 lenses | No lens toggle on Layer 1, and none in this variant's Layer 2 drill either. The lenses are absorbed as R-7 describes (DS-5) |
| Status model | Four face statuses: within appetite, amber, red, **Unverified**. `not_assessed` is shown with its reason. Integrity overrides status (Stage 5 section 4.4). Unverified is its own structural state (section 4.2) |
| Hard fails | HF-1 to HF-10 are designed out; section 4.5 shows where |
| Theme | Open (OD-1). Only structure is specified here |

---

## 1. Screen list

| # | Screen | Layer | Persona | Question answered (Stage 4) | Storyline role | Beat |
|---|---|---|---|---|---|---|
| **S1** | **Board Risk View** (landing) | 1 | CRO | Q1 headroom; Q5 capacity; Q6 trade-offs; Q3 defensibility; Q2 early warning; Q10 horizon (below the fold) | Opens the pitch: "risk as a strategic lever". Room to grow in mortgages, but onboarding growth is outrunning financial crime capacity, a trade-off has hit a floor, and one green headline cannot be defended | 1, 2 |
| **S2** | **Principal-risk drill** | 2 | CRO | The evidence behind any S1 item: threshold, chain, owners, indicators, tensions, precedent (Q2, Q3, Q6, Q9) | Proves the beat 2 flip in one click: lineage → reconciliation runs → attestation. The domain expert's click-through survives here | 2 (detail); 1 (drill) |
| **S3** | **Restrictions and reportability** | 1 | CRO (the decision itself is SMF16's) | Q4 restriction adherence; Q7 reportability | The wow moment: the flag fired 1,208 times with 100% blocked, yet the population test finds 112 accounts in breach. Ends with a case prepared per route and a named SMF deciding | 3 |
| **S4** | **Escalation health** | 1 | BRC chair (SMF10); the CRO previews | Q8: "Is bad news reaching me?" | The closer. One item was removed at ERC with no reason recorded, and it is the persistent amber with nothing done. The chair sets the agenda and commissions a review | 4 |

**Cut decisions**

| Candidate | Decision | Why |
|---|---|---|
| A separate "Decisions" screen (persona profile example 3, for waivers and tensions due at the BRC) | **Cut.** Tensions sit inline on S1 (T2-6), waivers in the S2 drill (T2-7), and the ledger on S3 | It would duplicate S1 and S3; rule 4 |
| Restrictions and reportability as two screens | **Merged into S3** | Beat 3 is one story: test → attestation → ledger |
| Escalation health as a "preview" panel inside S1 (OD-3 option b) | **Cut.** S4 is a separate BRC chair screen (OD-3 option a) | One persona per screen (CL-012); beat 4 is the chair's question |
| T2-41 private SMF view | Not built (OD-10 option a) | A secondary-persona journey; R-8 |
| A Consumer Duty screen (T2-42, T2-43) | Cut. T2-42 is in the S2 conduct drill; T2-43 is not built | No beat |
| An emerging-risk screen | Cut. The horizon line goes below the fold on S1 | Q10 is a must-show but not urgent (rule 4) |

---

## 2. Widget justification

### 2.1 Keep

| Component | Screen and zone | Renders | Justified by |
|---|---|---|---|
| Strategy strip (four objective tiles) | S1-Z1 | T2-1 (headline tile); T2-2 marker (tooltip and DG-1 only, V-6); T2-3 chip; **T2-6 inline state**; T2-8 statutory line. Tile faces carry no figure owned elsewhere on S1 (V-5) | Must-show; Q1, Q6; wedge (POSITIONING_WEDGE) |
| Headroom gauge (compact) | S1-Z1, inside the T2-1 headline | T2-1: actual against the amber and red bands only. The projection is text, not a marker (V-7) | Must-show; P4 (plain number on the face; range, stress and the projection marker in the drill) |
| Growth-against-capacity card | S1-Z2 | T2-5 | Q5; WOW; beat 1 decide moment |
| AI executive band (thin) | Row 0 on S1 (S1-Z3), S3 (S3-Z0) and S4 (S4-Z0) (V-1, V-4) | A summary over the units in the C-suite set "What's critical / What's due before the BRC / What's holding steady" (V-2); links to peer screens. No reportability counts or route decisions (V-3) | CL-004; AP-011; CF-003; R-5 (no wide bar) |
| RAS headline scorecard (ranked list) with promotion lane | S1-Z4 | T2-12; T2-4 marker; badges carry T2-15, T2-16, **T2-17**, T2-18 | Must-show; north-star K-5, K-8; R-3 (a list, not a grid) |
| Chain-integrity badge (four dots) | On every headline, tile and card in S1, S3 and S4 | E-50; T2-14 to T2-18 | Must-show; trust threshold 5; OD-5 |
| Defensibility card | S1-Z5 | T2-14 with **T2-17 inline** | Q3; WOW; beat 2 |
| Horizon line | S1-Z6, below the fold | T2-13; T2-31 count; T2-26 count | Must-show (emerging overlay); Q10 |
| Threshold cascade, leading-indicator tree, lineage, owners, tension pair, precedent panel | S2 | Drill cards (Stage 4 section 3.3, screen 2) | Trust threshold 2 and 7; rule 5 |
| Restriction adherence test | S3-Z1 | T2-27 | Must-show; Q4; HF-3 |
| Attestation evidence card | S3-Z2 | T2-28 | Q4; WOW |
| Reportability decision ledger | S3-Z3 | T2-29; T2-30 inline (CRO and deciding SMF only) | Must-show; Q7 |
| Exception feed with override log | S4-Z1 and S4-Z2 | T2-34 headline; T2-35 override log | Must-show; Q8; the suppressed near-miss the intent requires |
| Governance KRI tiles (three) | S4-Z3 | T2-36, T2-37, T2-38 | Q8; the BRC chair's KPI vocabulary |

**v6 reuse** (all `[unverified -- confirm against repo]`):

| v6 component | Use here |
|---|---|
| DomainDrillPanel | Host for S2, with the lens toggle not rendered in this variant |
| Precedent corpus | The precedent line on cards, plus the S2 precedent panel |
| ScreeningDenominator | T2-15 drill in S2 |
| OperationalAssuranceVerdict | T2-23 drill in S2 |
| SuppressionLedger | Candidate host for the T2-35 override log. The face label is "Override log" |
| CRSA cockpit and MLRO workspace | Handoff destinations only (OD-7) |

### 2.2 Remove for this role

R-1 to R-14 (Stage 4 section 1.6) apply in full. Stage 6 adds the removals specific to these screens:

| # | Removed | Reason |
|---|---|---|
| X-1 | The v6 lens toggle (Assurance, Exposure, Momentum, Ownership, Defensibility) on any screen in this variant | R-7; OD-6. Exposure → strip and gauge. Ownership → the owner dot, at the top level. Assurance and Defensibility → the badge. Momentum → trajectory markers |
| X-2 | The v6 nine-domain overview as a grid | R-3 (RP-001). It is re-expressed as the ranked scorecard, with the domain as a label column |
| X-3 | Fraud as a lens | It becomes a filter on the financial crime section of S2 only |
| X-4 | The labels "suppressed", "SuppressionLedger", "near-miss", "ignored" and "not discussed" on any face | P2 fixed copy, and rule 7. The face says "removed at ERC with no reason recorded" |
| X-5 | Internal references on faces: TM-04, E-2026-117, R-03, R-03.2, I-8812, DD-03, S1 to S4, unit-type labels ("chain break", "tension collision"), T2-n IDs | Rule 7; R-11. Plain names go on the face; references go in the S2 and S3 drills and tooltips |
| X-6 | Any composite "escalation-health score" | It would be an unexplained score (rule 2). S4 shows four KRIs, each with its own denominator |
| X-7 | The v6 components DispositionDispersion and CadenceFeasibility, and the MLRO Operational Assurance / Inherent Exposure / Fraud toggle | Owned by SMF17; not in the CRO's KPI vocabulary |
| X-8 | Date-range pickers | R-10. The comparison is built in (Q3 vs Q2), with one "vs last ERC" switch |
| X-9 | Any "Approve and send", "Submit", "File", "Notify" or "Complete now" button | HF-8. Only prepare, propose, draft and send to owner |
| X-10 | Customer counts presented as status ("flag fired 1,208 times") | R-4; HF-3. These appear only as the labelled contrast line on T2-27 |

---

## 3. Per-screen zone specification

**Shared header (S1, S3, S4)**

| Element | Content |
|---|---|
| Firm | Fernbridge Building Society `[illustrative]` |
| Screen navigation | Board Risk View · Restrictions and reportability · Escalation health (BRC chair) |
| Viewer chip | "Chief Risk Officer". On S4: "Viewing as BRC chair (preview)" |
| Period | "Q3 2026 (as at 30 September 2026) vs Q2 2026". One-click switch: "vs last ERC (14 October 2026)" |
| Evidence date | "Evidence runs to 26 October 2026" |
| Forum | "Next BRC: mid-December 2026 `[illustrative]`" |
| Labels | Persistent "Illustrative data" label; theme toggle |
| Excluded | No lens toggle and no date-range picker |

**Shared conventions**

| Convention | Rule |
|---|---|
| Delta | Every number carries its delta beside it |
| New items | Every headline and card carries a "new since last BRC" marker |
| Card title | A business question that resolves to a state (CL-001) |
| People | Roles on the face; names in the drill |

### S1 Board Risk View (Layer 1, landing)

**Layout** (structure only):

| Row | Left (about two-thirds width) | Right (about one-third width) |
|---|---|---|
| 0 | Z3: AI executive band, full width, one text line high (V-1) | (full width) |
| 1 | Z1: headline and strategy strip (the first and largest card) | Z2: T2-5, stacked above Z5: T2-14 (V-1) |
| 2 | Z4: RAS scorecard, boxed at 4 visible rows (V-8) | (full width) |
| 3 (below the fold) | Z6: horizon line, full width | (full width) |

- **Band position (V-1, supersedes DS-6):** the thin band sits in row 0, above all tiles (CL-004, AP-011). It is one text line high, so the headline stays the first and largest card at top-left.
- **Right column (V-1):** Z2 and Z5 stack in the right column of row 1, so the three question cards (headline, capacity, defensibility) sit together, with the headline largest (AP-001 / AP-002).
- **Phone width:** the zones stack in this order: band (Z3), Z1, Z2, Z5, Z4, Z6. The urgent units (T2-5 and T2-14) then come before the scorecard.
- **Rules applied:**
  - 1: every zone ends in a prepare or propose action;
  - 2: section 3 explain lines;
  - 3: Q3 vs Q2 built in;
  - 4: the urgent items (T2-5 past amber; one headline unverified; the restriction breach in the band and the scorecard) all sit inside the first viewport;
  - 5: every element drills one click to S2 or S3;
  - 6: low to medium density, with only 4 units above the fold;
  - 7: plain names only.

| Zone | Headline and "so what" | Cards (ID) | KPIs (K-code → Stage 5 field) | Explain line (rule = deterministic, no AI marker; AI = AI marker) | Time default | Primary action → route | Layer 2 drill | Spine |
|---|---|---|---|---|---|---|---|---|
| **Z1 Headline and strategy strip** | **"How much appetite are we using to grow, and can we defend it?"** Largest figure: "88% of high-LTV appetite used: £96m headroom on a £4.0bn new-lending plan `[illustrative]`", with the QoQ delta and a compact gauge (actual against the amber and red bands only; no projection marker on the face, V-7). The projection is a text line: "amber projected Q2 2027 · early warning, not a prediction". Integrity line beneath: "10 of 12 board headlines verified · 2 unverified". **So what:** "Room to grow in mortgages to Q2 2027 at plan volumes. Savings and onboarding growth is not inside its controls: decide pace or capacity, and caveat two figures before the pack locks." | **T2-1** (headline, tile O1); four tiles O1 to O4 (below); embedded T2-2, T2-3, **T2-6 (inline)**, T2-8 | K-1 (E-17.value ÷ E-08.red); K-2 (E-08.red − E-17.value; E-07.exposure_base_gbp); K-3; K-4 (C-4); K-16 summary (E-50.overall) | **Rule:** "High-LTV share 17.6% against appetite 20%. A straight-line projection over 6 quarters at plan volumes reaches amber in Q2 2027. Early warning, not a prediction." **AI (draft paragraph):** "Drafted from the appetite statement, the Q3 position and the stamped plan version only. It sets out three options; the board decides." | Q3 vs Q2, plus the projection | **Propose** an appetite recommendation (re-phase, change appetite with rationale, or confirm deliberate use of headroom). **Prepare** a draft BRC paragraph. → CRO gate → "proposed to the BRC on [date] · decision pending" (OD-9) | S2, opened at the credit risk section: full headroom gauge with range and stress (P4), threshold cascade with rationale, plan versions | Objective → RAS → L1 |

**Z1 strip tiles (V-6, V-5).** Each tile face shows five things only: the objective (a noun phrase), a status token, the collapsed four-dot badge, one inline-state line and one action. No tile repeats a figure that another S1 zone owns (V-5). Headroom £, the trajectory marker and the O1 first-time-buyer marker (T2-2) move to the tile tooltip and the DG-1 drill. Values are `[illustrative]` and come from Stage 5's X9 rows.

| Tile | Objective (face) | Status token (face) | Inline-state line (face) | Tooltip and DG-1 only (not on the face) | Cards |
|---|---|---|---|---|---|
| O1 | Owner-occupied mortgage growth | Within appetite | "Position shown in the headline above" (T2-1 is owned by Z1) | Headroom £96m of £4.0bn plan; amber projected Q2 2027; first-time-buyer marker: "First-time-buyer appetite 31% used for 3 quarters; plan at 72% (£1.44bn of £2.0bn)" | T2-1, T2-2 |
| O2 | Savings and digital member onboarding | Outside agreed terms | **T2-6 inline state:** "Agreed onboarding trade-off outside its terms: 2 of 3 bounds exceeded · review 27 days overdue". Floor row, shown as a breach and never as a bound: "Pre-CDD transacting: regulatory floor, not a trade-off → breach path" (S5-OD-5) | Financial crime capacity is the binding item (T2-5 is owned by Z2) | T2-5 (link), T2-6 |
| O3 | Resilient funding base | Within appetite | Statutory line, rendered only for a building society: "Statutory cap 50% (building society)". The wholesale funding value is owned by scorecard row 7 (V-5) | Wholesale funding 34% against an internal ceiling of 40%; projected 39% in Q3 2027 | T2-8 |
| O4 | Member and society safety as we grow | Unverified | "2 coverage figures unverified: see Defensibility and the scorecard". T2-14 is owned by Z5; T2-15 by scorecard row 3 (V-5) | Badge expansion text (section 4.2) | T2-14, T2-15 |
| Strip footer | -- | -- | Chip: "1 plan initiative has no appetite statement: business current account launch, Q1 2027" | -- | T2-3 |

| Zone | Headline and "so what" | Cards (ID) | KPIs | Explain line | Time default | Primary action → route | Layer 2 drill | Spine |
|---|---|---|---|---|---|---|---|---|
| **Z2 Growth against capacity** | "Is growth outrunning financial crime control capacity?" → "Members +31%, qualified handlers +9%. Queue age 19 days against amber 14, since August." **So what:** "The next savings campaign starts in 6 weeks and no resourcing decision is recorded." | **T2-5** | K-13 members per qualified handler (25,000 → 30,160); K-14 alerts cleared within SLA (beside K-13; value from 9A); K-15 queue age | **Rule:** "Members grew 31% and qualified handlers 9%, so members per handler rose from 25,000 to 30,160. Queue median age has been above the 14-day amber since August." **AI:** "Proposed because queue age is past amber and no resourcing action or decision is recorded. Only two options exist: restore capacity or pace growth." | QoQ, plus a projection to the campaign date | **Propose** "Restore capacity" (and **prepare** a resourcing paper for SMF17) **or** "Pace growth" (re-phase the campaign). No third option exists (HF-7). → CRO gate → CEO and board; "proposed · decision pending" | S2 financial crime section: both series on one time axis, CDD backlog, unlinked actions, precedent (Starling; Monzo) | Objective → RAS → L1 (fin crime) → control capacity |
| **Z3 AI executive band** (row 0, V-1) | Three sections (CF-003 C-suite set, V-2) plus one AI line, each a link. **What's critical:** "Restriction on new high-risk customers breached: 112 of 9,400 tested → Restrictions and reportability · 2 of 12 headlines unverified". **What's due before the BRC:** "1 amber, 1 red · 1 promotion proposed · 13 items qualify → Escalation health". **What's holding steady:** "8 of 12 within appetite". No reportability counts or route decisions in the band (V-3): S1 reaches S3 through the restriction-breach item and scorecard row 1 | Summary of T2-1, T2-5, T2-12, T2-14, T2-15, T2-27, T2-35 (count only) | K-5, K-16, K-20, K-30 (qualified count) | **AI:** "Summarised from the 12 headlines and the BRC exception feed as at 30 September 2026, with evidence to 26 October 2026. It adds no figures of its own." | Q3 vs Q2 | Section links route to S3 and S4. These are peer Layer 1 screens, not drills. No action of its own | -- | Whole spine (summary) |
| **Z4 RAS scorecard** | "Which board headlines need attention?" 12 rows ranked by urgency: red → unverified → amber → early warning → within appetite. **Boxed list (V-8):** 4 visible rows (red, unverified, unverified, amber: the urgent set) with internal scroll for the rest. Fixed summary line beneath the box: "8 of 12 within appetite · 12 of 34 Level 1 metrics `[practice-not-rule]`". Promotion lane stays beneath the box. Rows whose value is owned by a hero card (rows 2, 4, 6) show status + badge + a "shown above" anchor and no repeated value (V-5). **So what:** the top rows are the agenda | **T2-12** (promotion lane beneath the rows: "Proposed for the board view: NSFR"); T2-4 marker on the LCR row; the badge on every row carries T2-15, T2-16, **T2-17** and T2-18 | Per row: K-1 or the metric value with its denominator; K-5; K-7 (capital and liquidity rows); K-8; K-9 (T2-4 marker) | **Rule (T2-12):** "NSFR is not a headline but moved from 10 points to 2 points above amber in one quarter, which meets the promotion rule (firm practice)." **Rule (T2-4):** "LCR reaches amber in about 9 weeks. The BRC is in 7 weeks and ALCO needs 6 weeks to act." **AI (promotion reason):** "Drafted from the NSFR series; the CRO decides whether it joins the board view." | Q3 vs Q2 per row; the T2-4 marker shows weeks | **Propose** promotion (T2-12); **propose** an owner action and an early ERC flag (T2-4). → CRO gate → logged | S2 at the row's principal risk | RAS → L1 → L2/3 |
| **Z5 Defensibility** | "Can I defend this figure?" → **"Unverified: transaction monitoring coverage."** "Records reconciled 94.0% (2,256,000 of 2,400,000); same-day accounts 0% monitored; other cohorts 99.97%; last run 26 October 2026 `[illustrative]`." **T2-17 inline**, as the expanded attestation dot: "Attested 'no exceptions' for 3 months while completeness fell; the month 2 signature came 3 hours before the run finished." **So what:** "Caveat or withhold this figure before the pack locks, and ask the feed owner to remediate and re-attest." | **T2-14**, with **T2-17** inline | K-17 feed completeness (E-18 counts); K-18 attestations backed by evidence (E-21.attested_result_id against E-18.run_completed_ts) | **Rule (T2-14):** "Only 94.0% of payment records reached transaction monitoring in the 26 October run, and same-day accounts none. A figure built on an incomplete feed cannot be shown as within appetite." **Rule (T2-17):** "The attestation must reference a finished run. The month 2 signature preceded the run by 3 hours." **AI (caveat draft):** "Drafted from the reconciliation counts only. It says records were not monitored, not that suspicious activity was missed." | Latest run against the previous run (run dates shown) | **Prepare** caveat text (an accepted caveat leaves the face status "Unverified": S5-OD-8, DS-12). **Propose** remediation to the feed owner and COO/CTO, and a re-attestation challenge (send to owner). **Open a draft** triage entry → S3 ledger | S2 financial crime section: lineage, the last 3 runs, cohort breakdown, attestation per cycle, precedent (Metro, 12 November 2024), read-across "3 feeds share the batch design" (T2-32) | Feed → owner → attestation |
| **Z6 Horizon line** (below the fold) | "Which emerging risks have no measure?" → "7 emerging risks; 2 within 12 months; 1 (AI-enabled impersonation fraud) has no linked metric." Counts: "Days to 18 March 2027: [n] · n of N incidents shadow-classified" (T2-31); "1 disclosure figure under hold review" (T2-26) | **T2-13**; T2-31 and T2-26 as counts | K-34 | **Rule:** "1 of the 2 emerging risks expected within 12 months has no linked metric." **AI (proposal):** "Proposed because an in-horizon risk has no metric or owner; the principal-risk owner decides." | QoQ | **Propose** a new metric or owner, or a BRC horizon note | S2 at the mapped principal risk | Emerging risk → principal risk → L1 |

**Indicative scorecard headline set for 9A** (DS-8). Every value is `[illustrative]`; 9A ties them out.

| Rank | Row (face name) | Domain label | Status | Value on the face (V-5) | Card or link |
|---|---|---|---|---|---|
| 1 | Restriction on new high-risk customers: population test | Regulatory | Red | Value shown | → S3 (T2-27) |
| 2 | Transaction monitoring coverage | Financial crime | Unverified | "Shown above" anchor → Z5 (T2-14 owned by Z5) | T2-14 / T2-17 |
| 3 | Sanctions list rule coverage | Financial crime | Unverified | Value shown (T2-15 owned by Z4) | T2-15 |
| 4 | Alert queue median age | Financial crime | Amber | "Shown above" anchor → Z2 (T2-5 owned by Z2) | T2-5 |
| 5 | LCR (12-month average) | Liquidity | Within appetite, with an early-warning marker | Value shown | T2-4 |
| 6 | High-LTV share of new lending | Credit | Within appetite, amber projected | "Shown above" anchor → Z1 headline (T2-1 owned by Z1) | T2-1 |
| 7 | Wholesale funding share | Liquidity (statutory) | Within appetite | Value shown (wholesale funding owned by Z4) | T2-8 |
| 8 | CET1 against internal limit | Capital (board-layer key; S5-OD-1) | Within appetite | Value shown | -- |
| 9 | Important business services: impact tolerance used | Operational resilience | Within appetite | Value shown | T2-9 (drill) |
| 10 | Consumer Duty outcomes within tolerance | Conduct | Within appetite | Value shown | T2-42 (drill) |
| 11 | Critical vulnerabilities past SLA | Cyber | Within appetite | Value shown | -- |
| 12 | Share of new lending on EPC E–G collateral | Climate (PRA, SS3/19) | Within appetite | Value shown | T2-11 (drill) |

**S1 value ownership (V-5).** Each value renders once on S1: T2-1 → Z1 headline; T2-5 → Z2; T2-14 → Z5; T2-15, wholesale funding and every other headline value → Z4. Strip tiles and the band carry no repeated figure (O3 keeps its statutory line). Rows 1–4 are the 4 visible rows of the boxed scorecard (V-8).

The mix is 8 within appetite, 1 amber, 1 red and 2 unverified, so the screen is not all red (an intent failure mode). 3m+ arrears moves to the credit drill.

### S2 Principal-risk drill (Layer 2)

**Structure:**
- One page per principal risk. It opens focused on the item clicked, which is highlighted, with "Back to Board Risk View".
- **Sections run in spine order. There are no lens tabs** (X-1).
- There is no further drill. Evidence detail is expanded inline, so there is no Layer 3 (rule 5).
- **Headline (top-left):** the clicked item's state sentence, carried from S1 with its badge expanded.

| Section | Content | Cards | Spine |
|---|---|---|---|
| a. Position | Full headroom gauge (set, actual, projection marker labelled "projection", never "forecast" (V-7); range and stress view, P4); threshold cascade (capacity → red → amber → operating limit) with the approved rationale and calibration version; trajectory with window and point count; roll-up rule used ("worst-of `[practice-not-rule]`") | T2-1, T2-20 (calibration check), T2-4 arithmetic | RAS → L1 → thresholds |
| b. Chain integrity | Lineage: metric → feed → the last 3 reconciliation runs → cohort breakdown → attestation per cycle, each with a result ID. The underlying RAG is shown here only: "would read within appetite if verified". Change log; rating against test; read-across | T2-14, T2-17, T2-15 (ScreeningDenominator), T2-16, T2-18, T2-19, T2-23 (OperationalAssuranceVerdict), T2-32 | Feed → owner → attestation |
| c. Indicators | Leading-indicator tree (declared pairs) | T2-21 | L2/3 → L1 |
| d. Owners | Accountable SMF and risk owner by name `[fictional]`; MRM version and effective date; segregation-of-duties flags | T2-16 | Accountable owner |
| e. Tensions and waivers | The tension pair: each bound, the partner value, the floor row (as a breach), the keyer and source decision reference (D1); waiver conditions and expiry (TC-2 note: "temporary 25% limit expired; register not yet updated") | T2-6, T2-7 | RAS → L1 pair → floor |
| f. Domain detail (by principal risk) | Financial crime: T2-10, T2-24, the T2-25 count, and a **Fraud filter**. Operational resilience: T2-9. Climate: T2-11. Conduct: T2-42. Pre-circulation: T2-22 | as listed | per domain |
| g. Precedent | Real UK Final Notice with posture tag, plus "Did our read-across test the population?" | T2-33 | Precedent → control |
| h. Can tell / cannot tell | Fixed P2 copy for Group 2 partials, plus an "Extension: committee minutes (next module)" teaser. Teaser only, never a working card (R-12) | T2-5, T2-6, T2-17 partials | -- |
| i. Draft panel | The drafts for this item: AI marker, reason, gate (accept / edit and accept / reject), "accepted by [name] on [date]", audit entry | O-1, O-2, O-10 | Escalation |

- **Time default:** inherited from the clicked unit (section 1.2 of Stage 4).
- **Rules applied:** 2 (each section's rule line is visible); 5 (this is the only drill); 7 (codes such as TM-04 appear here, in labelled reference fields).

### S3 Restrictions and reportability (Layer 1)

**Layout:**

| Row | Left (two-thirds) | Right (one-third) |
|---|---|---|
| 0 | Z0: AI executive band, full width, one text line high (V-4) | (full width) |
| 1 | Z1: T2-27 headline | Z2: T2-28 |
| 2 | Z3: reportability ledger, full width, boxed (V-9) | (full width) |

**Z0 AI executive band (V-4).** CF-003 sections plus one AI line. **No route decisions or route counts in the band** (V-3 rule).

| Section | Content | Link |
|---|---|---|
| What's critical | "Restriction on new high-risk customers breached: 112 of 9,400 tested; 24,000 partner-channel openings untested" | Z1 |
| What's due before the BRC | "Q3 2026 attestation due in 12 days" | Z2 |
| What's holding steady | "3 of 4 clauses supported by the evidence" | Z2 |
| AI line | **AI:** "Summarised from the population test run and the clause evidence for Q3 2026. It adds no figures of its own." | -- |

**Rules applied:**
- 1: each zone ends in a proposal or a prepared case;
- 4: the breach and the attestation due date sit in one viewport;
- 3: monthly test run against the previous run; clocks.

| Zone | Headline and "so what" | Cards | KPIs | Explain line | Time default | Primary action → route | Layer 2 drill | Spine |
|---|---|---|---|---|---|---|---|---|
| **Z1 Restriction test** (headline) | "Is the restriction on new high-risk customers obeyed across the whole population?" → **"No: 112 accounts for 104 customers in breach, in 9,400 tested this month. 24,000 partner-channel openings untested. Months since the last zero-breach month: 4 `[illustrative]`."** Breach routes: savings pot 97; other routes as 9A assigns (TC-5). Manual-route lane shown separately. **Contrast line, labelled:** "Flag dashboard, same month: fired 1,208 times, 100% blocked. A flag firing is not evidence of adherence." **So what:** "Contain today, and fix test coverage for the partner channel." | **T2-27** | K-19 tested ÷ in scope (one population unit, fixed by 9A: TC-5); K-20 breaches ÷ tested, by route; K-21 | **Rule:** "The test checked the whole in-scope population against the restriction and found 112 accounts in breach. Untested openings are shown as untested, not compliant." **AI (containment proposal):** "Lists counts only. Account records stay in the Head of Financial Crime's restricted view." | Latest run against the previous run, plus months since zero | **Propose** containment to SMF17 (send to owner; deep link to the SMF17 workspace, OD-7). **Propose** a test-coverage fix. **Open a draft** ledger entry → Z3 | Per-clause evidence: test definition, population, breaches by route, untested routes. The restriction reference (R-03) and the clause owner appear here (TC-4) | Obligation (restriction) → control → evidence |
| **Z2 Attestation evidence** | "Does the attestation we are about to give match the test?" → **"Q3 2026 attestation due in 12 days. 1 of 4 clauses not supported by the evidence."** Per clause: supported / partly / not supported. **So what:** "The attesting SMF needs the evidence summary before signing." | **T2-28** | Clauses supported ÷ clauses (C-20); test runs present ÷ months in the period | **Rule:** "For Q3 2026 the test runs and milestones support 3 of 4 clauses; one is not supported because the test found breaches." **AI:** "Evidence summary prepared clause by clause. It does not write or judge the attestation wording." | Attestation period against the due date | **Prepare** an evidence summary per clause for the attesting SMF; **propose** the facts to disclose. The SMF writes and signs; the product never drafts a compliance claim | Clause-by-clause evidence with prior attestations | Evidence → attestation |
| **Z3 Reportability ledger** | "What may be reportable, on which clock, and who is deciding?" **Face layout (V-9):** route rows render on the face under a non-clickable event group header, inside a boxed region of about 4 visible rows with internal scroll. One click on a route row opens the route case (DG-8). Event 2's "1 of 4 routes decided" line stays on its group header. Two event groups (per TC-6): (1) the restriction breach; (2) "Mortgage reversion-rate error affecting 2,300 customers". Per route (SUP 15.3, FR7, SUP 15.11, SAR as "SAR question open" only, OFSI where engaged): elapsed time against the clock and the 24-hour triage target `[firm practice, not rule]`; decision status; proposed decider; recorded decision with name, timestamp and rationale (append-only). Event (2) shows "1 of 4 routes decided" (the Boolean trap). **So what:** "Every engaged route needs a named SMF decision; the product prepares the case." | **T2-29**; **T2-30** inline under the event group header (CRO and deciding SMF only) | K-23 routes decided ÷ engaged routes; K-24 elapsed against clock; K-22 awareness to notification (S5-OD-9); K-25 awareness gap (D6 scope) | **Rule (T2-29):** "This event may engage 4 routes; 1 has a recorded decision. Clocks run from the logged awareness date. Clock values unverified (S5-OD-7)." **AI (case):** "Prepared per route with the rule text in force on the event date. It proposes who decides, not what to decide." **Rule (T2-30):** "A linked issue was raised 21 August and a control test failed 02 September, 54 days before the logged awareness date. The deciding SMF decides whether the date stands." | Elapsed time against each clock; days from awareness | **Prepare** the case per route; **propose** the decider (SMF16 by default). The SMF records the decision, in the SMF16 workspace or a role-gated form (Stage 7; OD-7). The product never files or notifies. For T2-30, **prompt** the SMF to re-test the date; the product never re-dates | Per-route case: facts, rule text by in-force date, options with rationale, dissent field, decision history | Escalation / reportability decision |

**Visibility:**
- The T2-30 element **is not rendered** (no placeholder) when the viewer is the BRC chair or a board persona (HF-9, O-9).
- Above SMF17, the SAR route shows only "SAR question open" or "closed" (HF-10).

### S4 Escalation health -- BRC chair (Layer 1)

**Viewer:** the BRC chair, Graham Pryce `[fictional]`. The CRO sees the same screen as "Viewing as BRC chair (preview)", the read-only preview that lets her test the pack before circulation.

**Layout:**

| Row | Left (two-thirds) | Right (one-third) |
|---|---|---|
| 0 | Z0: AI executive band, full width, one text line high (V-4) | (full width) |
| 1 | Z1: headline | Z2: exception feed with override log |
| 2 | Z3: three KRI tiles, full width | (full width) |

**Z0 AI executive band (V-4; chair altitude, CF-003 applied per GG-2/GG-4).** No route decisions or route counts in the band (V-3 rule).

| Section | Content | Link |
|---|---|---|
| What's critical | "1 qualifying item removed at ERC with no reason recorded" | Z1 |
| What's due before the BRC | "December agenda items proposed" (count from the session's accepted agenda proposals) | Z3 |
| What's holding steady | "12 of 13 qualifying items in the pack" | Z2 |
| AI line | **AI:** "Summarised from the BRC exception feed, the override log and the governance KRIs for this cycle. It adds no figures of its own." | -- |

**Rules applied:**
- 1: every tile ends in an agenda or review proposal;
- 3: this quarter against last, rolling 4 quarters;
- 4: the near-miss is the headline;
- 7: the P2 fixed copy, with no "suppressed".

| Zone | Headline and "so what" | Cards | KPIs | Explain line | Time default | Primary action → route | Layer 2 drill | Spine |
|---|---|---|---|---|---|---|---|---|
| **Z1 Headline** | "Is bad news reaching the BRC?" → **"1 item qualified for this BRC but was removed at ERC on 14 October 2026 with no reason recorded: vulnerable-customer exceptions, amber for 3 quarters (14.2 → 15.8 → 16.9 per 10,000 contacts; amber 14, red 18), with no action, decision or escalation recorded."** Early warning: red in 2 quarters. **So what:** "Put it on the December agenda and decide remediation, a time-limited waiver or a recalibration review." This joins T2-34 and T2-35 on one item (TC-10, DS-11) | **T2-34**, with the **T2-35** state inline | K-6 persistence; K-29 persistent ambers with nothing recorded ÷ persistent ambers | **Rule:** "Amber for 3 consecutive quarters, past the firm's 2-quarter persistence rule `[practice-not-rule]`, with no linked action, decision or BRC escalation recorded. It also meets a BRC routing rule but is absent from the pack." **AI:** "Three options drafted for the chair: remediation with an owner, a time-limited waiver, or a recalibration review." | Rolling 4 quarters | **Propose** one of the three options; **propose** restoring the item to the pack. The chair decides; a named person keys the outcome into the decision register (D1) | Status history, the decision-register search result (empty), the routing rule met, the manifest versions, and can tell / cannot tell (H-1 teaser) | L2 → escalation |
| **Z2 Exception feed and override log** | "What qualified for this BRC?" → "13 items qualify under your routing rules; 12 in the pack; 1 removed at ERC with no reason recorded." Items cannot be removed from the face. Each removal shows the approver and reason code, or "no reason recorded" | **T2-35** (override log); feed items T2-34, T2-36 and T2-38 (and Level 1 reds and ambers from S1) | K-30 | **Rule:** "Items are placed by the firm's routing rules and cannot be removed without a named approver and a reason code." | This cycle against the last | **Propose** restore, or **propose** that a reason be recorded. The CRO approves the pack; the chair sees the log | Manifest versions (draft → locked → circulated); the routing rule for each item | Escalation |
| **Z3 KRI tile 1** | "Which known weaknesses are overdue and never reached the BRC?" → "CDD refresh finding extended 3 times over 19 months; never in a BRC pack; projected to clear in 31 months against a committed 12." | **T2-36** | K-26; K-27; series labelled "CDD refresh backlog (total customers)" (TC-9) | **Rule:** "At the current clearance rate the backlog clears in 31 months against the committed 12." | Rolling 4 quarters | **Propose** an agenda item and an owner review; **prepare** a BRC paragraph | Finding history, extensions, backlog series | Escalation |
| **Z3 KRI tile 2** | "How long does bad news take to reach us?" → "Median 4.6 months from first logged high severity to the BRC (n = 23); 3 material items unescalated after 12 months." | **T2-37** | K-28, with n shown; count only below the firm minimum (S5-OD-11) | **Rule:** "Measured from the first logged high severity, so it may understate the true time." | QoQ, rolling 4 quarters | **Propose** a governance review of the escalation route, naming the slowest routes | T2-39, T2-40 (self-identification ratio) | Escalation |
| **Z3 KRI tile 3** | "Which closed actions have not moved their metric?" (V-10) → "42 CDD remediation actions closed this quarter; overdue CDD reviews still 26,900 against a target of 10,000; 2 issues downgraded with no metric movement." | **T2-38** | K-31; series labelled "Overdue CDD reviews" (distinct from tile 1: TC-9) | **Rule:** "The linked metric is still outside its band after the declared recovery time." | QoQ | **Propose** re-opening or reinstating severity, for the owner and SMF5; **prepare** a re-open request | Actions with their linked metric series; share of actions with no linked metric | Escalation → metric |

**Footer:** "Reportability: [n] events; [n] of [n] routes decided" (counts only; T2-29 board scope). T2-30 is not rendered. There are no individual SMF trails.

---

## 4. Card anatomy (methodology section F slots)

### 4.1 Slot values per bound card

**Common slots (they apply to every card in the table below):**
- **Title:** the zone title in section 3.
- **Owner:** the role is on the face; the name `[fictional]` is in the drill.
- **AI marker:** on every draft, as an "AI draft" chip with its one-line reason. After the gate it reads "accepted by [name] on [date]". Statuses, checks and KPIs carry **no** AI marker; they show a rule line instead (Stage 5 section 8.4).
- **Integration star and access caveat (V-11):** any card, tile or scorecard row fed by a bank system rather than the product's own D1 registers carries a star beside its title and the caveat "needs the society's [feed] access". Applies to T2-5 (HR capacity, alert queue), T2-14 and T2-15 (monitoring and screening reconciliation), T2-27 (account-opening population) and scorecard rows on bank feeds. Rendered by the card shell (Stage 8 CMP-2 `integrationDependent`); sources listed in the Stage 8 widget registry.

| Card | Status slot | Headroom / position slot (with denominator) | Honesty line (badge + as-of + the X6 limit) | Owner on face | Action slot (verb → gate) | Precedent | Can tell / cannot tell (drill) |
|---|---|---|---|---|---|---|---|
| T2-1 | Within appetite, with amber projected | 17.6% of 20%; £96m of £4.0bn plan | 4 dots pass · as at 30 September 2026 · "projection assumes plan volumes and current mix" | Accountable SMF (credit); Chief Credit Officer | Propose / prepare → CRO; CFO "accepted by" for capital figures | -- | n/a |
| T2-5 | Amber (queue age) | 30,160 members per handler (1.90m ÷ 63); within SLA beside it | 4 dots · "detection from counts; growth is not claimed as the cause" | SMF17 | Propose restore or pace → CEO and board | Starling; Monzo | No action, decision or escalation recorded · H-8 |
| T2-6 (inline) | "Outside agreed terms"; floor row = breach | 2 of 3 bounds exceeded, with each bound beside its partner value | 4 dots plus keyer and decision reference (D1) · "bounds only as good as the keying" | Pair owner (first line) | Propose re-decision; prepare paper → BRC | FCA on Monzo | H-4 |
| T2-12 | Per row | "12 of 34 Level 1 metrics" | Badge of the promoted metric · "cap is a firm choice" | CRO | Propose promotion → CRO | -- | n/a |
| T2-13 | Mapped / unmapped | 1 of 2 in-horizon risks with no metric | Mapping dot · "registered risks only" | Principal-risk owner | Propose metric or owner → owner | -- | H-18 teaser |
| T2-14 | **Unverified** | 94.0% (2,256,000 of 2,400,000); same-day cohort 0% | Feed dot fails · run 26 October 2026 · "proves records not monitored, not missed suspicion" | Feed owner; SMF17 | Prepare caveat; propose remediation; open draft triage → CRO, owner, SMF | Metro, 12 November 2024 | n/a |
| T2-17 (inline) | Attestation dot: "Attestation precedes a completed run" (V-10) | 3 of 3 cycles attested against failing or unfinished runs | Signature time against run completion · "commentary quality not judged" | Feed owner | Propose challenge and re-attestation → owner | Metro | H-5 |
| T2-27 | Red (breach) plus untested | 112 accounts in 9,400 tested; 24,000 untested | Test-run date · "no adherence claimed for the untested" | SMF17 (containment); attesting SMF | Propose containment; open draft case → SMF17, SMF16 | Starling VREQ (posture-tagged) | Override lane · H-24 |
| T2-28 | 1 of 4 clauses not supported | Clauses supported ÷ 4; months tested ÷ months in the period | Run coverage for the period · "cannot read the draft text" | Attesting SMF | Prepare evidence summary → SMF writes and signs | -- | H-25 |
| T2-29 | Undecided routes per event | Routes decided ÷ engaged routes; elapsed ÷ clock | Keying check (D1) · "clocks unverified" · "engagement is the SMF's legal judgement" | Proposed decider (SMF16) | Prepare case; propose decider → SMF records | -- | H-6, H-34 |
| T2-34 | Amber, persistent, nothing recorded | 3 quarters ÷ persistence rule of 2 | Register and manifest keying · "proves nothing recorded, not that nothing was discussed" | BRC chair (decides) | Propose three options → chair | -- | H-1 |
| T2-36 | Overdue, extended | 31 months projected against 12 committed; extended 3 times against a limit of 2 | Backlog series · "assumes current clearance rate" | Finding owner; SMF5 | Propose agenda item → chair | -- | n/a |
| T2-37 | Above latency threshold | Median 4.6 months, n = 23 | Issue-log completeness share · "may understate" | BRC chair | Propose governance review → chair | -- | H-9 |
| T2-38 | Closed without effect | 26,900 against a 10,000 target; 42 closed | Action-to-metric link share · "closure notes not judged" | Owner; SMF5 | Propose re-open → owner and SMF5 | -- | H-21, H-2 |

**Embedded states.** Each takes the host's slots:

| Card | Where it shows | What it shows |
|---|---|---|
| T2-2 | Marker on tile O1 | -- |
| T2-3 | Chip on the strip | "No appetite statement" |
| T2-4 | Marker on the LCR row | Weeks to amber · weeks to the BRC · lead time |
| T2-8 | Line on tile O3 | Society only; not rendered for a challenger, with no empty slot |
| T2-15 | Feed dot of the sanctions row | "39 of 3,088 list entries covered; 0 alerts in 3 weeks against 42 expected a week" |
| T2-16 | Owner dot on any row | "No accountable SMF" |
| T2-18 | Mapping dot on any row | -- |
| T2-30 | S3 ledger row | Scoped |
| T2-35 | S4 Z1 and Z2 | -- |

### 4.2 The integrity badge and the "Unverified" state (structure only; colour at 9C)

| Element | Specification |
|---|---|
| Badge | Four dots in fixed order: **owner · feed · attestation · mapping**. Always present and quiet (OD-5, D8 recommendation adopted for the spec). Each dot has a text label and an accessible name. Pass and fail differ by **shape or glyph**, not colour alone |
| On failure | The badge expands into a text line naming the failed check and its evidence ("Feed: 94.0% reconciled, run 26 October 2026"). Any one failure sets the status to Unverified (Stage 5 section 4.4). There is no partial green |
| Unverified status | A distinct status token with the word "Unverified" and its own glyph; it is never a RAG fill. The value is still shown, labelled "unverified"; no RAG appears on the row, the tile or the headline count. The underlying RAG appears only in the S2 drill ("would read within appetite if verified") |
| Caveat accepted | The face still reads "Unverified", with a secondary note "caveat accepted by [name] on [date]; in pack with caveat" (S5-OD-8) |
| Not assessed | "Not assessed", with its reason ("no current threshold", "register not keyed", "history under 4 points: trajectory withheld") |
| Governance gap | No rulebook pattern exists for the Unverified token. This is raised to 9C (OD-1) |

### 4.3 AI element anatomy

| Element | Specification |
|---|---|
| Chip | "AI draft", plus the one-line reason (rule 2) |
| Gate controls | Accept · Edit and accept · Reject. These are the only controls, and a named human always operates them |
| After the gate | "Accepted by [name] on [date]", and the artefact version |
| Option sets | Options are fixed by Stage 5 (`DraftAction.options[]`). T2-5 offers two only. T2-29 proposes no default answer |
| Audit | Every gate writes an audit entry (O-10). Stage 7 decides whether the audit trail is visible in the drill |

### 4.4 Copy rules on faces

| Rule | Source |
|---|---|
| "Members" for the society; "customers" for the restriction and reportability populations where the rule text uses "customers" | Stage 5 section 9.1 |
| Dates as DD Month YYYY | Brand rules |
| British spelling; no exclamation marks | Brand rules |
| Partial cards use "no action, decision or escalation recorded" | P2 |
| Practice is labelled `[practice-not-rule]` wherever a cap, N, triage target, roll-up or cadence appears | HF-5 |
| `[illustrative]` on every seeded figure | Non-negotiables |
| Precedents keep their posture tags | Non-negotiables |

### 4.5 Hard-fail coverage

| HF | Designed out by |
|---|---|
| HF-1 | Section 4.2: Unverified overrides RAG on the row, tile, headline count and caveat |
| HF-2 | Every position and KPI cell above carries a denominator; the T2-27 coverage unit is fixed by 9A (TC-5) |
| HF-3 | T2-27 status comes from the population test; the flag figure is a labelled contrast line only |
| HF-4 | AI marker and reason on every draft; T2-29 proposes the decider, not the answer; there are no threshold write controls |
| HF-5 | Practice labels on the cap, N, triage target, roll-up and attestation cadence |
| HF-6 | Every status opens to the S2 chain; a unit with no chain renders the break (T2-16 or T2-18) |
| HF-7 | Floor row shown as a breach (T2-6); T2-5 has two options only; no cost or ROI field |
| HF-8 | Action vocabulary limited to prepare, propose, draft and send to owner (X-9) |
| HF-9 | T2-30 is not rendered on S4 or for board viewers |
| HF-10 | Counts only on S1, S3 and S4; "SAR question open" only; records stay in SMF17's restricted view |

---

## 5. Goal → Capability → UI

| Question | Capabilities (Stage 5) | UI zone | Gap |
|---|---|---|---|
| Q1 Appetite used; headroom to grow | C-1, C-2, C-3, C-4, C-5, C-17 (guard), O-1, O-13 | S1-Z1 (T2-1, T2-2, T2-3, T2-8); S2-a | None |
| Q2 What heads for amber or red before the next forum | C-3, C-15, C-14, C-6, O-7 | S1-Z4 (T2-4 marker); S2-a, S2-c (T2-20, T2-21) | Roll-up rule open (S5-OD-3) |
| Q3 Board figures I cannot defend | C-7, C-8, C-9, C-10, C-11, C-12, C-27, C-33, C-41, O-8 | S1-Z5 (T2-14, T2-17); badges in S1-Z4; S2-b; S1-Z6 (T2-26 count) | Tier 3 by design: H-5 |
| Q4 Restriction obeyed; can the SMF attest | C-19, C-20, O-6, O-9 | S3-Z1, S3-Z2 | Tier 3: H-24, H-25. TC-4 and TC-5 to fix at 9A |
| Q5 Growth outrunning control capacity | C-16, C-3, O-7 | S1-Z2 | Tier 3: H-8. Data gap: capacity feeds (S5-OD-6) |
| Q6 Trade-offs; collisions; floors | C-17, C-18, O-5 | S1-Z1 tile O2 (inline); S2-e | Tier 3: H-4. Needs the keyed register (D1) |
| Q7 Reportable; which clock; who decides | C-21, C-22, O-6, O-9 | S3-Z3; counts on the S4 footer only (removed from the S1 band, V-3) | Tier 3: H-6, H-34. Verification gap: clocks (S5-OD-7) |
| Q8 Is bad news reaching the BRC (CRO and BRC chair) | C-25, C-26, C-28, C-29, C-30, C-31, C-32, O-4 | S4-Z1, Z2, Z3; drills T2-39, T2-40 | Tier 3: H-1, H-2, H-9 |
| Q9 Read-across after a Final Notice | C-24, O-12 | S2-b (T2-32), S2-g (T2-33) | Tier 3: H-17 |
| Q10 Emerging risks; horizon; no metric | C-36, C-11, C-23 | S1-Z6 | Tier 3: H-18 |

There is no question without a capability. Every gap is a Tier 3 boundary, carried as the "cannot tell" line, or a data or verification decision.

---

## 6. Navigation and landing

| Item | Specification |
|---|---|
| Landing | **S1 Board Risk View** for the CRO persona. In the live product: CRO (SMF4) → Board View routes to this new variant. The variant name and negation guards are for Stage 8 and Stage 10 (`variant !== "v6"` guards must also exclude the new variant) `[unverified -- confirm against repo]` |
| Layer 1 peers | S1 ↔ S3 ↔ S4 through the header navigation and the S1-Z3 band links. **Peer navigation is not a drill**, so rule 5 holds: S3 and S4 each have exactly one drill layer |
| Layer 2 | S2 from any S1 tile, row or card, and from S3 and S4 drill links (per-clause evidence, per-route case and the manifest open as S2-style drill pages scoped to that unit). Back always returns to the originating Layer 1 screen, with the item highlighted |
| Demo walk | S1 Z1 (beat 1: headroom) → Z2 (capacity; propose) → tile O2 (floor) → Z5 (beat 2: Unverified) → S2 lineage (prepare caveat) → band → S3 (beat 3: test → attestation → ledger; case prepared; SMF decides) → S4 (beat 4: the removed item; the chair proposes the agenda). Stage 7 owns the flow |
| Persona switch | CRO (default). BRC chair for S4 (a fourth persona route in the live product: OD-3). SMF16 and SMF17 are reached only by deep links for handoffs (OD-7) |
| Handoffs | "Sent to owner" confirmation with an audit entry for COO, CTO and first-line owners (G-1). Deep links to the v6 CRSA cockpit (SMF16) and the MLRO workspace (SMF17) |

---

## 7. States (sales-demo intent: happy path built; the rest static, never breaking the walk)

| Screen | Loading | Empty | Error / missing data | Honest states that **must** be built (they are part of the story) |
|---|---|---|---|---|
| S1 | Static skeleton per zone | Scorecard: "No headline outside appetite this quarter" (not used in the demo) | Zone reads "Not assessed: [reason]"; never blank, never green | Unverified (two rows); trajectory withheld under 4 points; T2-8 removed under a challenger firm type; "proposed · decision pending" |
| S2 | Static skeleton | "No drafts for this item" | Section reads "Evidence not available for this period" | Underlying RAG shown only here; can tell / cannot tell; extension teaser |
| S3 | Static skeleton | Ledger: "No open events" | Route clock "Clock unverified" (S5-OD-7) | Untested population shown as untested; Boolean trap row; T2-30 scoped out for board viewers; "SAR question open" |
| S4 | Static skeleton | "All qualifying items are in the pack" | Below the minimum n: count only (S5-OD-11) | "Removed at ERC with no reason recorded"; "Not assessed (register not keyed)" if a D1 register is empty |

No browser storage (intent).

---

## 8. Decisions taken in this stage

| # | Decision | Basis |
|---|---|---|
| DS-1 | Four screens: S1, S3 and S4 at Layer 1; S2 at Layer 2 | Intent 3–5; catalogue indicative mapping; cuts in section 1 |
| DS-2 | S1 headline confirmed: "How much appetite are we using to grow, and can we defend it?", with an integrity line ("10 of 12 verified") under the T2-1 figure | Stage 4 section 1.7; joins Q1 and Q3 |
| DS-3 | **OD-4 resolved:** T2-6 inline on tile O2; T2-17 inline on the attestation dot (expanded on T2-14). Four visible units above the fold; T2-13 below the fold | Stage 4 recommendation; rule 4; the stage file does not argue otherwise |
| DS-4 | OD-3 option (a): S4 is the BRC chair's own screen, with a CRO preview | One persona per screen |
| DS-5 | No lens toggle anywhere in this variant. S2 is organised in spine order. The v6 DomainDrillPanel is reused as host with the toggle not rendered; v6 itself is unchanged | R-7; X-1; OD-6 recommendation, extended to Layer 2 |
| DS-6 | ~~The thin AI band sits below the headline row, not above it~~ **Superseded by V-1 (9C):** the band sits in row 0 on S1, S3 and S4; Z2 and Z5 stack in the S1 right column | CL-004, AP-011; the one-line band keeps the headline the first and largest card |
| DS-7 | Badge always on and quiet, expanding to Unverified; pass and fail by glyph, not colour alone | OD-5 recommendation (user confirmation still open) |
| DS-8 | Indicative 12-headline set, with sanctions as a second unverified headline (T2-15 on the face) and a regulatory row linking to S3. Result: 8 within appetite, 1 amber, 1 red, 2 unverified | Rule 4; intent (not all red); 9A to confirm |
| DS-9 | Plain names on faces; internal references only in drills | Rule 7; X-5 |
| DS-10 | No composite escalation-health score; four KRIs with denominators | Rule 2 |
| DS-11 | The S4 headline joins T2-34 and T2-35 on one item; face copy "removed at ERC with no reason recorded" | TC-10 recommendation; P2 |
| DS-12 | An accepted caveat does not change the face status | S5-OD-8 |
| DS-13 | The T2-6 floor lane renders inline on beat 1 as a breach row, linking to the breach path; beat 3 stays on the restriction | S5-OD-5 |
| DS-14 | S1 shows reportability as counts only; the restriction breach appears as a red scorecard row and a band item linking to S3. **Partly superseded by V-3 (9C-OD-2):** S1 shows no reportability counts; route counts stay on S3 and the S4 footer | R-14; rule 4; compliance "keep regulation firm-level and off the top band" |
| DS-15 | "Capital" is a board-layer domain label on the scorecard only | S5-OD-1 option (c); repo check pending |
| DS-16 | TC-9 is handled in the UI by two distinct labels: "CDD refresh backlog (total customers)" on T2-36 and "Overdue CDD reviews" on T2-38. 9A seeds two series | Both appear on S4 |
| DS-17 | T2-30 is not rendered, with no placeholder, for BRC chair or board viewers | D6; HF-9 |

---

## 9. Open decisions

| # | Decision | Status after Stage 6 |
|---|---|---|
| OD-1 | Theme; plus the "Unverified" visual token | Open. Structure is defined (section 4.2); the token is a 9C governance gap |
| OD-2 | Firm type | Defaulted to building society; the switch stays live (T2-8 render gate; T2-5 readout) |
| OD-3 | BRC chair as a fourth persona route in the live product | Adopted for the spec (DS-4); **the user must confirm**, because it adds a route and a persona-switch entry |
| OD-5 | Badge always on | Adopted for the spec (DS-7); user confirmation outstanding |
| OD-6 | Lens names (terminology research), and whether any lens toggle returns at Layer 2 | Spec renders none (DS-5); names deferred |
| OD-7 | Handoff destinations, and **where the SMF records the beat 3 decision** (SMF16 workspace deep link or a role-gated form) | Open for Stage 7 (new sub-question S6-OD-1) |
| OD-8 | Named keyer for the D1 registers | Open. The UI shows the keyer on every register-backed state |
| OD-9 | Beat 1 resolution | "Proposed · decision pending" is specified; confirm |
| OD-11 | K-13 and K-14 in the KPI vocabulary | Used on S1-Z2; confirm |
| OD-12 | Cadence; quarter-on-quarter default | Built in; verify with a UK CRO |
| S5-OD-3, 4, 6, 7, 9, 10, 11, 12 | Roll-up, trajectory defaults, capacity feeds, clocks, `notification_made_on`, S1 forum window, minimum n, point-in-time ratings | Carried; the UI labels each as practice or unverified where it appears |
| **S6-OD-1** | Where the SMF16 route decision is keyed in the demo (see OD-7) | Stage 7 |
| **S6-OD-2** | Sanctions as a second unverified headline (DS-8): it strengthens beat 2 but adds a same-day S1 item to S1 | Confirm, or move T2-15 to the S2 drill only (S1 then reads "11 of 12 verified") |
| **S6-OD-3** | Promotion lane rotation: which green headline is proposed to rotate out when NSFR is promoted, keeping the cap at 12 | 9A |
| **S6-OD-4** | Whether "vs last ERC" is needed in a sales demo or only in the product | Keep as a single switch unless the user cuts it |
| **S6-OD-5** | The audit trail as a visible panel in the S2 drill, or as an entry count only | Stage 7 |
| Tie-outs | TC-2 (S2-e note), TC-4 and TC-5 (S3-Z1 and Z2 side by side), TC-6 and TC-7 (S3-Z3 two events, "day n"), TC-9 (DS-16), TC-10 (DS-11) | 9A must resolve them before build. They are all visible on the screens specified here |

---

## 10. Definition-of-done check

| Criterion | Status |
|---|---|
| Single dominant top-left headline with a "so what" per screen | Met: S1-Z1, S2 (inherited), S3-Z1, S4-Z1 |
| Every card cites its Stage 3 ID; every KPI cites its Stage 5 K-code and field | Met (section 3 and section 4.1) |
| Every AI signal has its explain line written | Met. AI lines are written for every draft and the band. Rule lines are written for every deterministic status |
| Remove list populated with reasons | Met: R-1 to R-14 (Stage 4) plus X-1 to X-10 |
| Goal → Capability → UI covers every top question | Met: Q1 to Q10 (section 5) |
| No colours, spacing or chart styles specified | Met. Structure only; "Unverified" is defined by token and glyph, and colour is left to 9C |
| Domain spine on every zone | Met (Spine column) |

*End of Stage 6. Not locked. Feeds: Stage 7 (the drill targets, the demo walk and S6-OD-1/5), Stage 8 (zones → components; v6 reuse list), 9A (headline set, tie-outs, two CDD series) and 9C (the Unverified token, HF coverage, rule citations per screen).*

---

## Revision 27 October 2026 — 9C fixes applied

Source: `Stage9C_Build_Quality_Filter_v1.md` section 5. No figures changed except to remove duplicates on S1.

| V | What changed in this file |
|---|---|
| V-1 | S1 layout: band moved to row 0 (full width); Z2 stacked above Z5 in the row 1 right column; Z4 row 2; Z6 row 3. Phone order: band, Z1, Z2, Z5, Z4, Z6. DS-6 marked superseded |
| V-2 | S1 band sections renamed to "What's critical / What's due before the BRC / What's holding steady"; "Cannot defend" removed |
| V-3 | "2 reportable events, routes awaiting decision" removed from the S1 band; T2-29 and K-23 dropped from the band; section 5 Q7 and DS-14 updated |
| V-4 | AI band added as row 0 (Z0) on S3 and on S4, each with CF-003 sections, one AI line and no route decisions |
| V-5 | S1 value ownership set (T2-1 → Z1; T2-5 → Z2; T2-14 → Z5; T2-15, wholesale funding and others → Z4); strip tiles carry no repeated figure; scorecard rows 2, 4, 6 show a "shown above" anchor |
| V-6 | Strip tile face reduced to objective, status token, badge, one inline-state line, one action; headroom £, trajectory and the T2-2 first-time-buyer marker moved to tooltip and DG-1 |
| V-7 | Compact gauge shows actual against amber and red bands only; projection as text; S2 full gauge marker labelled "projection", never "forecast" |
| V-8 | Scorecard boxed at 4 visible rows with internal scroll; fixed summary line "8 of 12 within appetite · 12 of 34 Level 1 metrics"; promotion lane beneath the box |
| V-9 | S3 ledger: route rows on the face under non-clickable event group headers, boxed at ~4 visible rows; one click opens DG-8 |
| V-10 | S4 tile 3 title → "Which closed actions have not moved their metric?"; T2-17 dot label → "Attestation precedes a completed run"; "Cannot defend" removed (V-2) |
| V-11 | Integration star and access caveat added to the common card slots, with the list of bank-feed cards |
