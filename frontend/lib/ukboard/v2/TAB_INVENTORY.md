# UK Board v2 — tabbed redesign, Pass 0 inventory

## 1. Status counts (recomputed from the data by `headlineCounts()`)

| Status | Measures | Count |
|---|---|---|
| Within appetite | High-LTV lending, LCR*, NSFR*, wholesale funding, CET1, service disruption, Consumer Duty outcomes, low-EPC lending | 8 (*2 heading for amber) |
| Amber | Alert queue age | 1 |
| Red | Customer restriction | 1 |
| Unconfirmed | Monitoring coverage, sanctions list cover | 2 |
| **Total** | | **12** — ties |

## 2. Every current v2 figure → new tab

| Figure | Overview | Growth & Appetite | Board Decisions | Regulatory | Accountability | AI Agents / drawer |
|---|---|---|---|---|---|---|
| Posture: 8 within (2 heading amber) · 1 amber · 1 red · 2 unconfirmed · 3 decisions | Banner | Summary tiles (counts) | | | | |
| £96m headroom; 88% high-LTV appetite used; amber by Q2 2027; +1.5 pts | Mortgages card | Measure row (17.6% vs red 20%) | | | | Drawer |
| 2 of 3 limits broken; customers transacting before checks | Savings card | Trade-offs register | | | | |
| Members +31%, handlers +9% | Savings card trend | Growth vs capacity chart | | | | |
| NSFR 117% vs amber 115%, −8 pts, amber next quarter | Funding card; change list | Measure row | | | | Appetite Watch finding |
| LCR 162% vs amber 150%, −6 pts, ~9 weeks | Change list | Measure row | | | | |
| Monitoring coverage 94.0% (2.4m records), −3.1 pts; same-day 0% | Member protection card; change list | Measure row | | | Sign-off status (unconfirmed example) | Drawer |
| Sanctions 1.3% (39 of 3,088) | Not-changed list | Measure row | | | | |
| Queue 19 days (amber 14), 12 → 19 | For your decision #1; change list | Measure row; capacity stat | Decision 1 | | | |
| 30,160 members per handler (was 25,000); 81% alerts within target (31,600 of 39,000) | | Capacity stats | Decision 1 support | | | Tuning lab base (39,000) |
| Restriction 112 of 9,400; 104 customers incl. 3 exited; +41; 24,000 not checked; routes 97/9/6; flag 1,208; 1 of 4 clauses; sign-off 12 days (08 Nov) | For your decision #2; change list | Measure row | Decision 2 | Restriction health | | Tuning lab (97 savings pot) |
| Reporting: 2 events; 0 of 3 and 1 of 4 decided; day 1 / day 13; 2,300 customers; Helen Ward 23 Oct | | | Decision 2 | Reporting clocks | | Reporting Clock agent |
| Awareness gap 54 days | | | | Reporting clocks (CRO only) | | |
| Vulnerable-customer exceptions 16.9 / 15.8 / 14.2; amber 3 quarters; removed at Executive Risk Committee 14 Oct, no reason; red projected Q1 2027 | For your decision #3; not-changed list | | Decision 3 | | Items removed | Board Pack agent |
| 12 of 13 in the board pack | | | | | Items removed | Board Pack agent |
| 4.6 months median (n = 23); 3 not escalated; 26,900 vs 10,000; 42 closed; 2 downgraded | Not-changed list (3 not escalated) | | | | Is bad news reaching us? | |
| Customer-check backlog: extended 3 times; 31 vs 12 months | Not-changed list | | | | | Drawer |
| 7 emerging; 2 within 12 months; AI impersonation fraud not measured; 142 days to 18 Mar 2027 | | Emerging row | | Horizon | | |
| 2 of 9 financial-crime models past validation date | | | | | | Board controls (model oversight) |
| Precedents: Starling, Monzo, Metro (mechanism only) | | | | Enforcement lessons | | Read-across agent |
| Calibration and decision records (6, listed in section 3) | | | Decision history | | | |
| Sign-off dates per owner (from the integrity records) | | | | Owner cards; sign-off buckets | | |
| Wholesale 34%, CET1 16.8%, service disruption 58%, Consumer Duty 4 of 4, low-EPC 7.4% | | Collapsed greens | | | | |
| Critical vulnerabilities 2 of 146 (rotated out) | | | | | | Drawer only |

## 3. Decision history (existing records only)

| Date | Forum | Decision | Outcome now |
|---|---|---|---|
| 11 Mar 2026 | Risk Committee | High-LTV appetite thresholds approved (version 3) | Within; amber by Q2 2027 |
| 11 Mar 2026 | Board | Wholesale funding ceiling approved | Within (34% vs 40%) |
| 06 Apr 2026 | Risk Committee | Temporary 25% high-LTV limit for 6 months | Expired 06 Oct; register not updated |
| 14 Apr 2026 | Risk Committee | Savings onboarding trade-off agreed | Outside terms: 2 of 3 limits broken |
| 22 Apr 2026 | Board | Capital plan approved (CET1 limit 13.5%) | Within (16.8%) |
| 23 Oct 2026 | Head of Compliance | Mortgage rate error reportable to the FCA | Decided |

## 4. New data (AI Agents tab only, in `agentsData.ts`)

Agent roster, statuses, autonomy levels, weekly check counts, activity timeline, model-oversight review date (30 Sep 2026), and the tuning-lab test (two groups of 5,000; options A/B/C). Ties: 97 savings-pot breaches, 39,000 alerts a month, 63 handlers (39,000 ÷ 63 ≈ 620 alerts per handler, so +2,100 ≈ 3 handlers).
