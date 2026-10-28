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
| 2 events; 0 of 3 and 1 of 4 decided; day 1 and day 13; 2,300 customers; Helen Ward 23 Oct | EVENTS, ROUTES | | | Decision 2 | Reporting clocks | | Reporting Clock |
| Awareness gap 54 days (CRO only) | EVENTS e-117 | | | | Reporting clocks | | |
| Vulnerable-customer exceptions 14.2 / 15.8 / 16.9; amber 3 quarters; removed at Executive Risk Committee 14 Oct, no reason; red projected Q1 2027 | SERIES u-vuln, PACK_ITEMS | For your decision; not-changed list | | Decision 3 | | Removed items; chair timeline | Board Pack |
| 12 of 13 in the pack; board pack v1 → v2 (→ v3 on restore) | PACK_ITEMS, MANIFEST_VERSIONS | | | | | Drawer | Board Pack |
| 4.6 months median (23 issues); 3 not escalated (14, 13, 12 months); 26,900 vs 10,000; 42 closed; 2 downgraded | KRI_DETAIL | Not-changed list | | | | Bad news | Queue |
| Backlog extended 3 times; 31 vs 12 months | KRI tiles | Not-changed list | | | | Drawer | Queue |
| 7 emerging; 2 within 12 months; 142 days to 18 Mar 2027 | HORIZON | | Emerging row | | Horizon | | |
| Sign-off: 10 signed off · 1 due · 1 unconfirmed | integrity sign-off checks | | | | | Sign-off status | |
| Decision history (6 records, 11 Mar – 23 Oct 2026) | THRESHOLDS calibration, WAIVER, TENSION_PAIR, ROUTES | | | Decision history | | | |
| Precedents: Starling, Monzo, Metro (mechanism only) | precedents.ts | | | | Enforcement lessons | | Read-across |

## New values (AI Agents only, `agentsData.ts`)

| Value | Ties to |
|---|---|
| 6 agents; 41 checks this week (12 + 6 + 7 + 7 + 3 + 6) | Computed by `totalChecks()` |
| 5 drafts waiting | The 5 queued drafts still at "AI draft" (computed) |
| 0 actions without approval | Product rule: no agent action without a named person |
| Model risk review 30 Sep 2026; 2 of 9 models past validation | "2 of 9" is existing data; the review date is new |
| Tuning test: 4 weeks, 2 × 5,000 accounts; A 94 of 97 / +2,100 (5.4%) / ~3 handlers; B 71 of 97 / +900 (2.3%); C 0 of 97 | 97 savings-pot breaches; 39,000 alerts a month; 63 handlers (≈ 620 alerts each) |
| Activity timeline (8 events, 14–27 Oct 2026) | Existing events and dates |
