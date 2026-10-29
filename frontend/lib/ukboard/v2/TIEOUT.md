# UK Board v2 — tie-out table

All figures come from the UK Board data module (`lib/ukboard/v1/data.ts`, read only, through `board.ts` and `boardTabs.ts`). The only new values are in `agentsData.ts` (AI Agents tab). Status counts are computed by `headlineCounts()`.

| Figure | Data source | Overview | Growth & Appetite | Board Decisions | Regulatory | Accountability | AI Agents |
|---|---|---|---|---|---|---|---|
| 12 measures: 8 within (2 heading for amber), 1 amber, 1 red, 2 unconfirmed | METRICS + selectors | Banner | Summary tiles | | | | |
| £96m headroom; 88% used; amber by Q2 2027; +1.5 pts | UNITS u-hltv, THRESHOLDS | Mortgages card; change list | Measure row (17.6%) | | | | |
| 2 of 3 limits broken; floor breach; review 27 days overdue | TENSION_PAIR | Savings card | Trade-offs | | | | |
| Members +31% (1.45m → 1.90m); handlers +9% (58 → 63) | CAPACITY | Savings card | Growth vs capacity | | | | |
| 30,160 per handler (was 25,000); 81% (31,600 of 39,000); queue 19 days (12 → 19), amber 14 | CAPACITY, u-capacity | For your decision; change list | Capacity stats; measure row | Decision 1 | | | Tuning lab base |
| NSFR 117% vs amber 115%, −8 pts | u-nsfr | Funding card; change list | Measure row | | | | Appetite Watch finding |
| LCR 162% vs amber 150%, −6 pts, ~9 weeks | u-lcr | Change list | Measure row | | | | |
| Monitoring coverage 94.0%, −3.1 pts; same-day 0%; signed off 3 hours early | u-tm, TM_RUNS, TM_COHORTS | Member protection card; change list | Measure row | | | Sign-off status | |
| Sanctions 1.3% (39 of 3,088) | u-sanctions | Not-changed list | Measure row | | | | |
| Restriction 112 of 9,400; +41; 104 customers incl. 3 exited; 24,000 not checked; routes 97 / 9 / 6; block fired 1,208; 1 of 4 clauses; sign-off 08 Nov (12 days) | RESTRICTION | For your decision; change list | Measure row | Decision 2 | Restriction health | | Tuning lab (97) |
| 2 events; 0 of 3 and 1 of 4 decided; day 1 and day 13; 2,300 customers; Head of Compliance 23 Oct | EVENTS, ROUTES | | | Decision 2 | Reporting clocks | | Reporting Clock |
| Awareness gap 54 days (CRO only) | EVENTS e-117 | | | | Reporting clocks | | |
| Vulnerable-customer exceptions 14.2 / 15.8 / 16.9; amber 3 quarters; removed at Executive Risk Committee 14 Oct, no reason; red projected Q1 2027 | SERIES u-vuln, PACK_ITEMS | For your decision; not-changed list | | Decision 3 | | Removed items; chair timeline | Board Pack |
| 12 of 13 in the pack; board pack v1 → v2 (→ v3 on restore) | PACK_ITEMS, MANIFEST_VERSIONS | | | | | Drawer | Board Pack |
| 4.6 months median (23 issues); 3 not escalated (14, 13, 12 months); 26,900 vs 10,000; 42 closed; 2 downgraded | KRI_DETAIL | Not-changed list | | | | Bad news | Queue |
| Backlog 31 vs 12 months (face); extended 3 times (drawer) | KRI tiles | Not-changed list | | | | Drawer | Queue |
| 7 emerging; 2 within 12 months; 142 days to 18 Mar 2027 | HORIZON | | Emerging row | | Horizon | | |
| Sign-off: 10 signed off · 1 due · 1 unconfirmed | integrity sign-off checks | | | | | Sign-off status | |
| Decision history (6 records, 11 Mar – 23 Oct 2026) | THRESHOLDS calibration, WAIVER, TENSION_PAIR, ROUTES | | | Decision history | | | |
| Precedents: Starling, Monzo, Metro (mechanism only) | precedents.ts | | | | Enforcement lessons | | Read-across |

## New values (AI Agents only, `agentsData.ts`)

| Value | Ties to |
|---|---|
| 8 agents; 2 checks this week (CHECK entries in the activity log, week from 26 Oct) | Computed by `checksThisWeek()` |
| 5 drafts waiting | The 5 queued drafts still at "AI draft" (computed) |
| 0 actions without approval | Product rule: no agent action without a named person |
| Model risk review 30 Sep 2026; 2 of 9 models past validation | "2 of 9" is existing data; the review date is new |
| Tuning test: 4 weeks, 2 × 5,000 accounts; A 94 of 97 / +2,100 (5.4%) / ~3 handlers; B 71 of 97 / +900 (2.3%); C 0 of 97 | 97 savings-pot breaches; 39,000 alerts a month; 63 handlers (≈ 620 alerts each) |
| Activity timeline (8 events, 14–27 Oct 2026) | Existing events and dates |

## Persona views

Tabs are now built per persona from `personaViews.ts`; the columns above name the section, which appears on exactly one tab per persona (test: "no section repeats within a persona"). No figure was added or changed in the persona redesign; only display copy was shortened.

## Board member view (`boardMemberData` seed)

New values for the Board member tabs live in `boardMemberData.ts`; agent additions in `agentsData.ts`. Source for every row below: "boardMemberData seed" unless a derivation or existing source is given.

| Figure | Where shown | Source / derivation |
|---|---|---|
| Mortgage new lending £2.9bn of £4.0bn plan (73%; plan pace 75% → "2 pts behind plan pace"); book £17.9bn | Briefing scorecard; Growth table | Seed; £4.0bn plan is existing (u-hltv) |
| £96m more high-LTV lending before the appetite limit | Scorecard; Growth table | Existing: (20% − 17.6%) × £4.0bn = £96m. To the 20% limit, not amber (amber 18.5% = £36m) |
| Savings balances +£1.1bn vs +£0.8bn plan (138%) | Scorecard; Growth table | Seed |
| +13 handlers to restore capacity | Scorecard; Decision 1 | Existing: 1.90m ÷ 25,000 = 76 needed − 63 today |
| Wholesale funding 34% vs 40% ceiling; NSFR 117% vs amber 115% (2 pts headroom); LCR 162% vs amber 150% | Scorecard; Financial strength | Existing (u-wholesale, u-nsfr, u-lcr) |
| CET1 16.8% vs 13.5% limit | Financial strength; board agent | Existing (u-cet1) |
| Consumer Duty 9 of 12 outcome measures in tolerance (3 outside) | Scorecard; Growth table | Seed; 3 = 12 − 9 |
| Credit: above 4.5× income 9.2% (limit 15%); cost of risk 6 bps (Q2 5 bps); arrears Q2 0.38% | Credit quality | Seed. Arrears now 0.42% is existing (6,100 of 1,452,000), not 0.41% |
| Consumer Duty outcomes: all 4 within tolerance (14 of 14 reviews; fair-value review; letters 71% vs 80% and vulnerable exceptions 16.9 vs amber 14 shown as amber key measures; call wait 6m 40s vs 5m) | Customers | 4 of 4 within is existing (u-cd headline, kept); key measures seed |
| Vulnerable-customer exceptions 14.2 → 15.8 → 16.9, amber 14, red 18 | Customers; Briefing pulse | Existing (u-vuln, VULN_HISTORY); amber 14 not 15 |
| Complaints 1.6 → 1.7 → 1.8 → 2.1 per 1,000; themes 34% / 21% / 14% | Customers; Briefing pulse | Seed |
| Ombudsman upholds 31% (118 of 381); Q2 27% | Customers; Briefing pulse | 31% existing; Q2 27% seed |
| Mortgage rate error: 2,300 customers; 1,720 contacted (75%); 580 still to contact; redress ~£410k; target 31 Dec | Customers; Briefing pulse | 2,300 existing; 1,720, £410k, 31 Dec seed; 580 = 2,300 − 1,720 |
| Speak-up 9 (Q2 5); 34 days median; 78% safe (target 80%); 0 retaliation | Customers | Seed |
| 3 policy tensions | Growth & Appetite | Seed (AI-found) |
| Decision 1 options: +£300m inflow kept / −£300m vs plan; ~£0.8m a year; ~10 / ~6 weeks to green | Decisions | Seed |
| Decision 3 options: ~2 quarters to green; 6-month waiver | Decisions | Seed; option names existing |
| Temporary 25% high-LTV limit expired 06 Oct; trade-off review 27 days overdue | Briefing; Decisions | Existing (decision history, TENSION_PAIR) |
| Monthly sign-off, month of the numbers Oct 2025 – Sep 2026 (HoFC late Aug, Sep; Compliance late Jul; Data owner missing Jun, Jul, signed before data check finished Sep) | Ownership | Seed; Sep "early" ties to "Monitoring: signed off 3 hours early" |
| Issues found 42: first line 16 (38%), second 11 (26%), audit 9 (21%), regulator 6 (14%) | Ownership | Seed; sums to 42 |
| 4 journeys, 2 mismatches; complaints 412 / 258 / 97 / 173 | Ownership | Seed |
| Regulator relationship: 2 open requests; restriction in force; 0 skilled person reviews; last meeting 18 Sep | Regulator view | Seed; restriction existing |
| Calendar: 8 Nov, 15 Dec, 18 Mar 2027, Jul 2027 | Regulator view | 8 Nov, 15 Dec, 18 Mar 2027 existing; Jul 2027 seed. "SMCR Phase 2, 22 Jan 2027" dropped (unverified) |
| Pack prepared 15 Oct | Briefing meta | Existing (board pack v2 created 15 Oct) |
| Since last board: 6 moved, 0 new red, restriction up 41 | Briefing banner | Existing: 6 CHANGES; restriction already red (38 → 71 → 112) |
| Customer Signals agent: 63 complaints mention "account frozen"; 0 checks this week | AI oversight (all personas see 7 agents) | Seed; 0 checks keeps the 41-check total |
| Agent value: pack prep 41 → 9 hours; 3 found before people; 1 day median; 0 without approval | AI oversight | Seed |
| 6 findings | AI oversight; Briefing panel | 5 existing activity items + the Customer Signals finding |

## One source of truth (`boardStore.ts`)

Every board figure is now held once in `boardStore.ts` (reading `v1/data.ts`, `boardMemberData.ts` and `agentsData.ts`); counts, percentages, headroom, posture and every "n of m" are computed by selectors and checked by `validateBoardStore()` (`boardStore.test.ts`). All three personas read the store. Each figure has one home tab; on any Board member tab a figure renders at most once (dev-only figure registry).

| Figure | Canonical value | Note |
|---|---|---|
| Posture | 5 within · 2 heading for amber · 2 amber · 1 red · 2 unconfirmed | Computed from the 12 measure statuses (replaces "8 within") |
| Consumer Duty (measure #4) | Amber: 2 of 4 outcomes amber · 9 of 12 measures in tolerance | Outcomes 3/3, 3/3, 2/3, 1/3; replaces the earlier "4 of 4 within" |
| High-LTV change | ▲ 1.5 pts (16.1% → 17.6%), labelled vs Q2 2025 | Shown since Q2 2025 at the board's request; vs Q2 2026 it is 0.3 pts |
| Mortgage headroom | £96m before the appetite limit (20%) | (20% − 17.6%) × £4.0bn; before amber would be £36m |
| Arrears 3m+ | 0.42% | Existing data (6,100 of 1,452,000) |
| Dates | Measures as at 30 Sep 2026 · evidence to 26 Oct 2026 · pack v2 locked 15 Oct | Briefing meta reads "evidence to 26 Oct" |
| vs Q2 for wholesale, CET1, service disruption, low-EPC | +1 pt · −0.2 pts · +4 pts · +0.2 pts | Existing deltas kept; "measures moved" computes to 10 |
| Low-EPC lending | Emerging tier | Moved from Top |
| Owners | Monitoring: Data owner (payments) · Consumer Duty: Chief Customer Officer · CET1: Chief Financial Officer · service disruption: Chief Operating Officer · low-EPC: Chief Credit Officer | Head of Compliance now holds no board measure |
| Sign-off | 60 owner-months: 54 on time · 3 late · 2 missing · 1 early | Computed from the strip |
| Agents | 8 · 2 checks this week · 6 findings this quarter · 5 drafts with the CRO · 0 without approval | Computed |

## C-suite redesign (one component library, roles only)

| Figure | Value | Source |
|---|---|---|
| Status changes since last board | 4: restriction Amber → Red; alert queue Within → Amber; LCR and NSFR Within → Heading for amber | Board-pack seed (`statusAtLastBoard`); the data holds no last-board date |
| Attestation this month | 10 of 12 measures · 1 due · 1 unconfirmed | Computed from each measure's sign-off check |
| Attestation record (12 months) | 54 of 60 owner-months on time · 3 late · 2 missing · 1 before data check | Computed from the sign-off strip |
| Accountable owners | 8 roles; measures 3/3/2/1/1/1/0/1 = 12 | Computed (`ownerRows`) |
| Reporting routes decided | 1 of 7 | Computed from v1 routes |
| Days to Board Risk Committee | Computed from today's date (15 Dec 2026) | Live clock; measures as at 30 Sep 2026 |
| High-LTV change | ▲ 1.5 pts vs Q2 2025 | Replaces ▲ 0.3 pts vs Q2 2026 |
| Enforcement themes | Restriction (FCA final notice · 2024), controls not scaling (FCA final notice · 2025), monitoring gap (notice unconfirmed) | No firm names; the monitoring record is unverified |
| Consumer Duty measure value | 2 of 4 outcomes amber (9 of 12 measures on Customers) | Computed |
| Restriction runs | Jul 38 · Aug 71 · Sep 112 | v1 restriction history |

## Risk-appetite rebuild (Top · Emerging · Obligatory)

Seeds added in `boardStore.ts` for this rebuild. Everything else is computed by the selectors and checked by `validateBoardStore()`.

| Figure | Value | Source |
|---|---|---|
| Board measures | 12: Top risks #1–#6, Emerging risks #7–#8, Obligatory risks · Level 0 #9–#12 | `MEASURES` |
| Posture | 4 within · 2 heading for amber · 4 amber · 1 red · 1 unconfirmed | Computed (`postureCounts`) |
| New measures #1, #6, #7, #12 | Lending growth 73% of plan (amber < 70%, limit < 65%); critical security findings 1 open (amber 1, limit 2); time to detect 12 min median (amber 15, limit 30); regulatory notifications 0 missed · 2 open | Seed |
| Rows below the 12 | 37 Level 2 metrics + 95 Level 3 controls = 132; 14 off track (9 Level 2 + 5 Level 3 reds); 3 unconfirmed | Seed counts per measure; computed totals (`rollupTotals`) |
| Band medians | Top risks 11.5% of the limit · Emerging risks 30% | Computed (`bandMedians`) |
| Objective status | Worst linked measure: red → Off track; amber or unconfirmed → Under pressure ("at risk" is a banned phrase); heading for amber counts as On track | Computed (`objectiveStatus`) |
| Attestation | 8 attested (#1 1 Oct, #2 30 Sep, #3 1 Oct, #4 2 Oct, #5 26 Oct, #8 2 Oct, #11 3 Oct, #12 2 Oct) · 3 due (#6, #7, #9 restriction due 8 Nov) · 1 unconfirmed (#10) | Seed; #9 keeps the existing restriction due date |
| Status changes since last board | 4 (restriction Amber → Red; alert queue, LCR and security findings Within → off track) · 1 new (#7) | Seed (`statusAtLastBoard`) |
| High-LTV decision (D2) headroom | Hold 20% £96m · Loosen 22% about £176m · Tighten 18% £16m | Computed (`ftbHeadroomM`) on the £4.0bn plan at 17.6% |
| Detection time series | May 7 · Jun 8 · Jul 8 · Aug 9 · Sep 11 · Oct 12 minutes | Seed (`DETECTION_SERIES`) |
| Policy linkage | 41 of 46 policies linked to a board measure; 5 untracked | Seed (`POLICIES`) |
| Not yet measured | Agent-initiated payments (Head of Payments (proposed)); synthetic-voice impersonation (Head of Fraud) | Seed (`EMERGING_UNMEASURED`) |
| Next SMF certification | 31 Jan 2027; 6 of 9 SMFs with evidence | Seed (`SMF_CERT`) |
| AI agents | 8 agents (Fraud Watch agent: backtests detection rules on historical data, Head of Fraud, Propose); 2 checks this week from the activity log | `agentsData.ts` |
| Detection model tuning | Current rules 12 min median vs challenger 40 sec; challenger false alerts +6% on the parallel cohort | `ATTACK_SIGNALS`, `measure("u-detect")` |
| Decision log stance | Hold · Hold · Loosen · Hold · Tighten (rate-error record has no stance) | Seed (`DECISION_HISTORY`) |

## Data sources and removals

Every panel names its feed (`SOURCES` and `PANEL_SOURCES` in `boardStore.ts`; each measure carries `source`). Board measures are as at 30 Sep 2026; operational feeds (transaction monitoring, fraud, security, signals, regulatory log, agent log) to 28 Oct 2026; board papers to 26 Oct 2026.

| Removed | Why |
|---|---|
| Retaliation cases (culture card) | No connected source produces it |
| Per-agent checks this week (agent drawer) | Replaced by the one weekly count from the activity log |
| Live, parallel-cohort and challenger wording | Tuning and detection figures are backtests on historical data |
