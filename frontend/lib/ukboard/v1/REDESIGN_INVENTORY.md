# UK Board v1 — redesign Pass 0 inventory (no code changes)

Scope: UK Board only (`app/UKBoard`, `components/UKBoard/v1`, `lib/ukboard/v1`). UK Banking Audit is not touched.

## 1. Current files

| Layer | File | Role | Fate in the redesign |
|---|---|---|---|
| Route | `app/UKBoard/v1/page.tsx` | Renders `UKBoardApp` | Kept |
| Shell | `components/UKBoard/v1/UKBoardApp.tsx` | Header, 3 tabs, viewer switch, theme, reset, view router | Rewritten: header A, no tabs, one page, drawer host |
| Store | `state/boardStore.tsx` | Context + reducer: view, viewer, theme, drafts, gates, audit, caveats, ledger drafts, manifest versions | Kept; `view` becomes `drawer` (open item or none) |
| Primitives | `primitives.tsx` | Layout grid, card shell, status token, delta, practice label, back link, details toggle, stat grid, integrity badge, precedent line, so-what | Kept where reused; new `AppetiteDial`, `BoardDrawer`, row, tile, decision card |
| AI and gates | `ai.tsx` | AI marker, `DraftActionCard` (Accept / Edit and accept / Reject), gated face line, audit trail, can-tell, process gap, AI band | Gate and audit kept unchanged; AI band removed (replaced by rule-built headline B) |
| Charts | `cards/charts.tsx` | Headroom gauge, series chart | Gauge replaced by `AppetiteDial`; series chart fixed (160px drawer / 64px F2, 11px labels, short x labels) |
| Screens | `screens/BoardRiskViewScreen.tsx` (S1) | Headline + strip, capacity card, defensibility card, scorecard, horizon | Replaced by sections B, C, D, E, F on one page |
| Screens | `screens/RestrictionsReportabilityScreen.tsx` (S3) | Population test, clause evidence, ledger | Deleted as a tab; its blocks move to the F3 and decision-2 drawers |
| Screens | `screens/EscalationHealthScreen.tsx` (S4) | Removed-item headline, exception feed, 3 KRI tiles, CRO preview strip | Deleted as a tab; blocks move to the F1 and decision-3 drawers; CRO drafts move to their items' drawers |
| Screens | `screens/PrincipalRiskDrillScreen.tsx` (S2) | Sections a–i | Becomes drawer content (Position / Why / Options / Evidence / Precedent / Audit) |
| Screens | `screens/ScopedDrillScreen.tsx` | DG-6 population, DG-7 clauses, DG-8 route case, DG-9 manifest, DG-10 KRI | Bodies reused inside the drawer |
| Helpers | `screens/shared.tsx` | Navigation, action list, short labels | Navigation replaced by `openDrawer(itemId)` |
| Data | `lib/ukboard/v1/data.ts` | All seed figures (provisional) | Unchanged values; metadata fields added (section 4) |
| Data | `types.ts`, `selectors.ts`, `precedents.ts`, `widgetRegistry.ts`, `TIEOUT.md` | Types, status precedence, precedents, registry, tie-outs | Kept; selectors gain verdict, tier and off-track rules |
| Tests | `tieout.test.ts`, `noOutbound.test.ts` | 15 tests | Kept; new tests for verdicts and off-track filtering |

## 2. Every face figure → new location

| Figure (current face) | Current place | New place |
|---|---|---|
| 88% of high-LTV appetite used (17.6% of 20%), +1.5 pts vs Q2 | S1 headline stat | C: mortgage tile dial |
| £96m headroom on £4.0bn plan | S1 headline stat | C: mortgage tile line ("£96m headroom, until Q2 2027"); B sentence |
| Amber projected Q2 2027 | S1 headline stat | C: mortgage tile line; drawer chart |
| 10 of 12 headlines verified · 2 unverified | S1 headline stat | B chip "2 figures not yet verified" |
| Gauge: actual 17.6 / amber 18.5 / red 20 / capacity 24 | S1 gauge | C dial (actual, amber, red); capacity in drawer |
| Strategy strip O1–O4 statuses and lines | S1 strip | C tiles with computed verdicts |
| O2: 2 of 3 bounds exceeded · review 27 days overdue · floor breach | S1 strip | C savings tile; review 27 days → drawer |
| O3: statutory cap 50% | S1 strip | Drawer (funding tile now shows NSFR) |
| 1 plan initiative has no appetite statement | S1 strip link | C header link "1 plan item has no appetite statement ›" |
| Queue 19 days (amber 14, +7 vs Q2) | S1 capacity card | E decision 1 key figure; D row |
| 30,160 members per handler (was 25,000) | S1 capacity card | E decision 1 support |
| Members +31% · handlers +9% | S1 capacity card | F2 panel |
| Alerts cleared within SLA 81% (31,600 of 39,000) | S1 capacity Details | F2 drawer |
| Campaign 08 December 2026 (6 weeks) | S1 capacity | E decision 1 deadline |
| TM coverage 94.0% (2,256,000 of 2,400,000), same-day 0%, attestation 3 hrs early | S1 defensibility card | E "Not yet verified" row 1; D row value; detail → drawer |
| Other cohorts 99.97% (2,256,677) | S1 defensibility Details | Drawer |
| 12-row scorecard values (112 accounts; 1.3%; 162%; 34%; 16.8%; 58%; 4 of 4; 2 of 146; 7.4%) | S1 scorecard | D off-track rows (off-track only); greens behind "within appetite · show" |
| 12 of 34 Level 1 metrics | S1 scorecard footer | Drawer of the collapsed greens line (practice label kept there) |
| NSFR 117% vs amber 115%, 10 → 2 pts in a quarter | S1 promotion lane | C funding tile dial; D row; drawer |
| Emerging: 7; 2 within 12 months; 1 with no metric; 142 days to 18 March 2027 | S1 horizon card | F4 panel; D EMERGING row "AI impersonation fraud · not measured" |
| 9 of 31 incidents classified in trial; 1 disclosure figure on hold | S1 horizon Details | F4 drawer |
| Restriction: 112 accounts / 104 customers / 9,400 tested / 33,400 in scope / 24,000 untested / +41 vs previous run | S3 population card | E decision 2 (112 of 9,400; 24,000 untested); D row; rest → drawer |
| Breach routes 97 / 9 / 6; flag fired 1,208, 100% blocked; 4 months since zero | S3 population card | Decision-2 drawer |
| 1 of 4 clauses not supported; attestation due in 12 days (08 November) | S3 clause card | F3 "next deadline in 12 days"; drawer |
| Ledger: 2 events, 7 routes, 1 decided (Helen Ward, 23 October); day 1 / day 13; 2,300 customers | S3 ledger | F3 "1 of 7 routes decided"; ledger → drawer |
| Awareness gap 54 days | S3 ledger header (CRO only) | F3 drawer, CRO only (unmounted for the chair) |
| Removed at ERC 14 October 2026, no reason; vulnerable-customer exceptions 16.9 (15.8, 14.2); amber 3 quarters; red projected Q1 2027 | S4 headline | E decision 3; rest → drawer |
| 12 of 13 in pack (v2 locked); 1 removed; manifest v1 → v2 (→ v3 on restore) | S4 feed | Decision-3 drawer and F1 drawer |
| 31 months vs 12; extensions 3 vs limit 2 | S4 KRI 1 | F1 drawer |
| Median 4.6 months (n = 23); 3 unescalated after 12 months | S4 KRI 2 | F1 panel |
| 26,900 overdue CDD vs 10,000; 42 closed; 2 downgraded | S4 KRI 3 | F1 panel (26,900 / 10,000); rest → drawer |
| Reportability 2 events; 1 of 7 decided | S4 footer | F3 panel (removed as footer) |
| All S2 drill figures (runs, cohorts, attestations, thresholds, contributors, owners, tension bounds, waiver, domain detail, precedents) | S2 | Drawer sections |

No figure is dropped: each is on the face once or in a drawer.

## 3. Face strings removed

AI band ("What's critical / due / holding steady" and its footnote) · page titles and subtitles of the 3 tabs · "SO WHAT" (×8) · "Details" (×12) · "Shown above" · "Practice" on the summary · named-check chips on the face · "Strategy strip" label · 14+ Propose/Prepare buttons on faces · "CRO preview actions" panel (5 drafts) · "Reportability (counts only)" footer · rule and internal codes on the face (R-03.x, SUP 15.3, FR7, E-2026-…).

## 4. Missing metadata (fields only; no new values)

None of the 12 headline units carries `tier`, `indicatorType`, `direction` or `objectiveId`. Proposed:

| Unit | tier | indicatorType | direction | objectiveId |
|---|---|---|---|---|
| Restriction on new high-risk customers | obligatory | lagging | higherIsWorse | O2 |
| Transaction monitoring coverage | obligatory | lagging | lowerIsWorse | O4 |
| Sanctions list rule coverage | obligatory | lagging | lowerIsWorse | O4 |
| Alert queue median age | top | leading | higherIsWorse | O2 |
| LCR (12-month average) | top | leading | lowerIsWorse | O3 |
| High-LTV share of new lending | top | leading | higherIsWorse | O1 |
| Wholesale funding share | top | lagging | higherIsWorse | O3 |
| CET1 against internal limit | top | lagging | lowerIsWorse | — |
| Impact tolerance used | top | lagging | higherIsWorse | O4 |
| Consumer Duty outcomes | obligatory | lagging | lowerIsWorse | O4 |
| Critical vulnerabilities past SLA | top | leading | higherIsWorse | O4 |
| EPC E–G share of new lending | top | leading | higherIsWorse | O1 |
| NSFR (promotion candidate) | top | leading | lowerIsWorse | O3 |
| AI impersonation fraud (emerging, unmeasured) | emerging | — | — | O4 |
