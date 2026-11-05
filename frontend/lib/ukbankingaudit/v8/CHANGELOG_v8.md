# UK Banking Audit v8 changelog

v8 was rebuilt as an exact copy of v7 (as updated 26 Oct 2026), then changed in 13 passes. The numbers in brackets are the CRO feedback checklist items each change answers.

## Pass 1: Rebuild v8 from current v7
- Replaced the August v8 copy with current v7, and added v8 to the select_region dropdown. v7 stays the default.

## Pass 2: Configuration and data
- `config.ts`: taxonomy, firm rule, category rule, severity labels, cadence, committees (1, 2).
- `data/`: 50 risk appetite metrics, 78 controls with tests, 10 incidents with control links, rating snapshots, 13 paths to green, sourced horizon items (6, 7, 8, 9, 11, 13).
- `dateRefresh.ts`: moved v8 dates to the 5 Nov 2026 reporting clock on copies of shared data, and removed "RED UNTIL 18-JUL".
- Widened the enforcement queue window from 12 to 18 months, so Barclays and Nationwide stay listed with their true ages.

## Pass 3: Rating engine
- `engine.ts`: metric status, control effectiveness, incident re-rating, category rating, firm posture under 3 rules, trend, material items (2, 3, 5, 9, 11, 12).

## Pass 4: Firm banner and category tiles
- Banner shows colour, trend, rule, driving categories and assurance gap (2, 3).
- Tiles show trend arrow, one-line reason, counters and path to green chip. Titles come from config (1, 3, 4, 5, 7).
- Removed W/W labels and +5 / 0 / -2 scores (4).

## Pass 5: Summary strips and change lists
- Added Risk at a Glance and Red Spotlight (6, 7, 9, 10, 12).
- What Changed shows only material moves, one line each, with an evidence link and provenance icon (12).
- What Has Not Changed shows target date, Overdue badge and committee decision (8).

## Pass 6: Horizon Scanning
- Renamed Regulatory Landscape, and added All, Regulatory, Industry events and Emerging risks tabs (13).
- Moved Green Without Evidence out of the panel (13).

## Pass 7: Risk Appetite and Path to Green
- Added the Risk Appetite tab with actual values against limit and tolerance (6).
- Added the Path to Green drawer: first line, second line challenge, committee decision, Overdue badge (7, 8).
- `riskStore.ts`: saves update every screen and the Reasonable Steps Trail (8).

## Pass 8: Category drill-down
- Replaced tier and lens toggles with one page: residual rating, risk appetite, control effectiveness, testing and evidence, trend, incidents (14).
- Collapsed remediation behind a Path to Green summary (16).

## Pass 9: Controls & Incidents
- Added the tab: effectiveness by category, what moved, controls, overdue tests, evidence gaps, incidents (9, 10).
- Linking an incident as Failed re-rates the control and updates the Board View (11).

## Pass 10: Reasonable Steps
- Added RSS trend, owned metrics, expandable owned controls and incidents on owned controls (3, 7, 11).
- Appetite breaches capture through the Path to Green drawer (7, 8).
- Enforcement read-across feeds Horizon Scanning (13).

## Pass 11: RCSA Coverage
- Moved Coverage Map to Reference as RCSA Coverage, with refresh note and Major gaps tracker (15).
- Added mapped control test status to the obligation drawer (15).

## Pass 12: Summary, caps and report
- Added the top-line summary with cited ids. It uses a deterministic template because v8 has no LLM path and makes no outbound calls (12).
- Capped Board View lists at 5 with a route to the rest (12).
- Added the CRO Report route, print CSS and Download PDF (17).
- Later cut to 5 pages. The metric register stays on the Risk Appetite tab and the gaps tracker on RCSA Coverage (17).

## Pass 13: Final QA
- Fixed two hook-order bugs and 16 components defined during render.
- Removed client-facing copy that named an individual, and copy that referred to competitors.
- Reworded remaining "w/w" text (4).
- Seven untyped screens carried from v7 keep `@ts-nocheck`, each with a stated ESLint exception. Typing them was out of scope.
