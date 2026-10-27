# UK Board v1 — tie-out table (PROVISIONAL)

Stage 9A/9B mock data is pending (build pack v1). Figures marked **Spec** are fixed in Stages 5–7; figures marked **Provisional** fill gaps the spec leaves open and must be replaced by 9A/9B. All data lives in `data.ts`. Swapping it needs no component changes. Checked by `tieout.test.ts`.

Firm: Fernbridge Building Society (fictional, building society). Demo day 27 October 2026. All people are fictional.

## S1 Board Risk View

| Figure | Value | Where it appears | Source |
|---|---|---|---|
| High-LTV appetite used | 88% (17.6% of 20%) | S1 Z1; S2 credit | Spec |
| Headroom | £96m on £4.0bn plan (2.4 pts) | S1 Z1; tile O1 tooltip; S2 | Spec |
| High-LTV delta | +1.5 pts used (+0.3 pts share) vs Q2 2026 | S1 Z1; scorecard | Provisional |
| High-LTV series | 16.1 → 17.6 over 6 quarters, slope 0.3 | S2 trajectory | Provisional (gives amber Q2 2027, Spec) |
| Threshold cascade | capacity 24 · red 20 · amber 18.5 · op. limit 18 | S1 gauge; S2 | Amber between 17.6 and 20 (TC-2); values Provisional |
| Headlines verified | 10 of 12 · 2 unverified | S1 Z1, band | Spec |
| Scorecard mix | 8 within · 1 amber · 1 red · 2 unverified | S1 Z4, band | Spec |
| Level 1 schedule | 12 of 34 (practice) | S1 Z4 | Spec |
| Members | 1.45m → 1.90m (+31%) | S1 Z2; S2 DG-2 | Spec |
| Qualified handlers | 58 → 63 (+9%) | S1 Z2; S2 DG-2 | Spec |
| Members per handler | 25,000 → 30,160 | S1 Z2; S2 | Spec |
| Queue median age | 19 days against amber 14 | S1 Z2; scorecard row 4 (anchor only) | Spec |
| Queue age delta | +7 days vs Q2 2026 | S1 Z2 | Provisional |
| Alerts cleared within SLA | 81% (31,600 of 39,000) | S1 Z2; S2 | Provisional (spec: "9A sets") |
| Next savings campaign | 08 December 2026 (6 weeks) | S1 Z2; S2 | Spec (date derived) |
| TM coverage | 94.0% (2,256,000 of 2,400,000) | S1 Z5; S2 DG-3 | Spec |
| TM cohorts (TC-3) | same-day 143,323 at 0%; others 2,256,677 at 99.97% | S2 DG-3 | Derived to sum exactly |
| TM runs | 99.9% → 97.1% → 94.0% | S2 DG-3 | Spec ratios; record counts Provisional |
| Attestation timing | month 2 signed 3 hours before run end | S1 Z5; S2 | Spec |
| Sanctions list rule coverage | 1.3% (39 of 3,088); 0 alerts vs 42 a week | Scorecard row 3; S2 | Spec |
| Customer screening coverage (TC-8) | 92% | S2 only | Spec (named distinctly) |
| LCR | 162% vs amber 150%; amber in about 9 weeks | Scorecard row 5; S2 | Spec |
| Wholesale funding | 34% vs 40% ceiling; statutory 50% | Scorecard row 7; tile O3 (statutory line only) | Spec |
| CET1 | 16.8% vs 13.5% | Scorecard row 8 | Provisional |
| Impact tolerance used | 58% (worst of 9 services) | Scorecard row 9 | Provisional |
| Consumer Duty outcomes | 4 of 4 within tolerance | Scorecard row 10 | Provisional |
| Critical vulnerabilities past SLA | 2 of 146 (appetite ≤ 5) | Scorecard row 11 | Provisional |
| EPC E–G share | 7.4% vs 10% | Scorecard row 12 | Provisional |
| NSFR (promotion) | 117% vs amber 115%; 10 → 2 pts above amber | Promotion lane | Spec movement; values Provisional |
| Rotation-out candidate (S6-OD-3) | Critical vulnerabilities past SLA | Promotion lane | Provisional |
| Tension pair | conversion +6.2 vs +5; high-risk 1.1% vs 0.8%; review 27 days overdue | Tile O2; S2 DG-4 | Spec; third bound Provisional |
| First-time-buyer marker | 31% used for 3 quarters; plan 72% (£1.44bn of £2.0bn) | Tile O1 tooltip; S2 | Spec |
| Unmapped initiative | Business current account, Q1 2027, 18,000 accounts | Strip chip; S2 DG-11 | Spec |
| Emerging risks | 7; 2 within 12 months; 1 with no metric | S1 Z6 | Spec |
| Days to 18 March 2027 | 142 | S1 Z6 | Derived from 27 October 2026 |
| Incidents classified in trial | 9 of 31 | S1 Z6 | Provisional |

## S3 Restrictions and reportability (TC-4 to TC-7)

| Figure | Value | Where it appears | Source |
|---|---|---|---|
| Population unit (TC-5) | Account openings | S3 Z1; DG-6 | Resolved |
| In scope / tested / untested | 33,400 / 9,400 / 24,000 partner channel | S3 Z1, band; DG-6 | Spec |
| Breaches | 112 accounts, 104 customers, 3 previously exited (subset) | S1 band; scorecard row 1; S3; DG-6; ledger facts | Spec |
| Breach routes (TC-5) | savings pot 97 · group migration 9 · manual override 6 | S3 Z1; DG-6 | 97 Spec; 9 and 6 Provisional |
| Flag contrast | fired 1,208 times, 100% blocked | S3 Z1 (labelled contrast); DG-6 | Spec |
| Months since zero-breach month | 4 | S3 Z1; DG-6 | Spec |
| Latest / previous run | 25 October 2026 (September population) / 71 of 9,050 | S3; DG-6 | Provisional (inside Q3 period, TC-5) |
| Attestation | Q3 2026, due 08 November 2026 (12 days); 3 of 4 clauses supported | S3 Z2, band; DG-7 | Spec (date derived) |
| TC-4 | Unowned clause R-05.2 and the 1 untested clause belong to the s166 remediation, not R-03 | S2 regulatory | Resolved |
| Event 1 | Restriction breach, awareness 26 October 2026, day 1, 0 of 3 routes decided | S3 Z3; DG-8 | Provisional dates |
| Event 2 (TC-6) | Mortgage reversion-rate error, 2,300 customers, awareness 14 October 2026, day 13, 1 of 4 decided | S3 Z3; DG-8 | Spec |
| SMF16 decision (TC-7) | SUP 15.3 decided 23 October 2026 (day 9) by Helen Ward [fictional] | S3 Z3; DG-8 | Spec date; day recomputed |
| Awareness gap | 21 August → 14 October 2026 = 54 days | S3 Z3 header (CRO only); DG-8 | Spec |
| S4 footer | 2 events; 1 of 7 routes decided | S4 footer | Derived |

## S4 Escalation health (TC-9, TC-10)

| Figure | Value | Where it appears | Source |
|---|---|---|---|
| Qualifying items (TC-10) | 13 qualify; 12 in locked v2; 1 removed at ERC 14 October 2026, no reason | S1 band; S4 Z1, Z2, band; DG-9 | Spec |
| Removed item = persistent amber | Vulnerable-customer exceptions, 14.2 → 15.8 → 16.9 (amber 14, red 18) | S4 Z1; DG-9 | Spec |
| Red projection | Q1 2027 (2 quarters), using Q4 2025 point 13.9 | S4 Z1 | Q4 2025 point Provisional |
| CDD refresh backlog (TC-9) | 41,000–44,000 total customers; 31 vs 12 months; extended 3 times | S4 tile 1; DG-10 | Spec |
| Overdue CDD reviews (TC-9) | 26,900 vs 10,000 target; 42 actions closed | S4 tile 3; DG-10; S2 contributors | Spec |
| Escalation latency | median 4.6 months, n = 23; 3 unescalated > 12 months | S4 tile 2; DG-10 | Spec |
| Self-identification (TC-10 window) | 15 of 24 (2026 to date incl. October) | DG-10 | Window Resolved; 15 Provisional |
| Manifest versions | v1 draft 07 October · v2 locked 15 October · v3 on restore | S4; DG-9 | Provisional dates |

## Practice, not rule

12-headline cap · 2-quarter persistence · routing rules · worst-of roll-up · 24-hour triage target · 6-point trajectory window, minimum 4 · 99.95% reconciliation tolerance · 75% impact-tolerance amber. All are labelled as firm practice on screen.
