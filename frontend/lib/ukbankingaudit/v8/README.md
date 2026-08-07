# UK Banking Audit — v8 data layer

This directory holds the v8 board-pack and MLRO Operational Dashboard overlays.
Read this before putting anything from v8 in front of a client or a regulator.

## What is synthetic vs real

- **SYNTHETIC, seeded, deterministic**: all domain, evidence, history, config-change,
  attestation, risk-acceptance, accountability, and MLRO operational overlay data.
  None of it describes a real firm.
- **REAL, public, posture-tagged**: every record in `precedentCorpus.ts` (same corpus
  rules as v6 — Metro Bank unresolved, unnamed Enforcement Watch firms, etc.).

## Data isolation — do not edit mockDataV2

`mockDataV2.ts` is shared by v2 through v6. **Never edit it for a v8 feature.**

v8 extends the graph via `mockDataV8.ts`, which spreads the prior-version mock
graph and overlays v8-only keys built in `mlroOperationalData.ts` (and related
v8 modules). Same pattern `mockDataV3.ts` already uses on v2 (replace/filter
without mutating the shared base file).

Overlay keys today include: `eddPastDueAppetite`, `amlAlertTiersByWeek`,
`sanctionsScreeningMetrics` (OFSI / lag / hold), `systemHealth`,
`fcTrainingPosture`, `tmInvestigationsSarConversion`.

## Saurabh spreadsheet → what we built

| Sheet ask | Where it landed |
| --- | --- |
| L1/L2/L3 alert investigations vs appetite | Widget 2 — `AlertBacklogVsAppetite` + tier overlay; capacity nested as the “why” |
| No and % of TM alerts → SAR | Same widget; single source `TM_INVESTIGATIONS_SAR_CONVERSION` (moved off Client Risk View) |
| EDD past due vs appetite | Widget 3 — `EDDPipelineStatus`; appetite 5 / red 15; source KYC EDD register |
| SAR timeliness | Widget — `SARTimelinessBand`; face source NCA SAR Online register |
| OFSI freeze / block, list update lag, payments hold | Widget 4 — `SanctionsScreeningPosture` (OFAC only as separate US line) |
| TM / txn screening / name screening outages & DQ | Nested in Widgets 2 and 4; shared `SystemHealth` shape; sources carry “(source to confirm)” |
| FC training % + overdue + high-risk split | `FinancialCrimeTrainingPosture`; **98.4%** from AP-MLRO-2025 Pack §5.1 — not invented |
| Named source on every metric | `OPERATIONAL_WIDGET_SOURCES` + per-submetric `sourceLabel`; “?” printed as “(source to confirm)” |
| Path to Green | Wired on amber/red; multi-action remediate + named risk-accept + gap (`acceptedBy: null`) |
| Two tabs, not three | `MLRO_DASHBOARD_LENSES` — Operational Dashboard / Client Risk View; Fraud is a **widget** |

## KRI ribbon — kept pending decision

`FinancialCrimeKRIStrip` sits above the six widgets and is **not** on Saurabh’s
widget list. Once each widget carries its own metric vs appetite it is largely
duplication — but it remains the only single-glance read of whole FC posture.
**DEFAULT: keep it.** Do not delete without his answer (see Open questions).

## Router guard trap (UKBankingControlTrace.tsx)

When adding a version, every `variant === "v6"` needs a parallel `variant === "v8"`
branch, and every `variant !== "v6"` exclusion needs `&& variant !== "v8"`. Missing
either leaves v8 falling through to the legacy screen.

**Counts after final re-audit (double-quoted screen guards):**

| Pattern | Count |
| --- | --- |
| `variant === "v6"` | **13** |
| `variant === "v8"` | **13** (1:1 counterpart) |
| `variant !== "v6"` | **12** |
| `variant !== "v8"` | **12** (every exclusion includes v8) |

Also: mock selector (~line 676) chooses `mockDataV8` first; `singleParagraph` OR-chain
includes `v8`; `ukTraceRuntime.bindUkTraceMock` maps v8 → v3 UI tokens (one-line
companion outside the v8 tree — required for byte-identical chrome).

## Open questions — recorded, not built

### a) TM tuning / false-positive metric

Saurabh flagged research; no data in the graph. **Proposal:** measure scenario tuning
currency and threshold change history (live scenarios, last calibration, threshold
changes with approver) rather than false-positive count alone — closer to the NatWest
failure (rule switched off for generating too many alerts) already in the precedent
corpus. Note: dormant `components/UKBankingAudit/v8/mlro/SuppressionLedger.tsx` is
essentially this idea, already built and still unwired.

### b) Alert-to-SAR conversion expected range

Shown as informational **3.2%** from one source. Without a benchmark, too low may mean
noise and too high may mean thresholds so tight only obvious cases surface. Left INFO
until he gives a range.

### c) Fraud as filter vs fraud as widget

July review described two tiers × two filters; the spreadsheet reads as fraud being one
widget among six. **Built the widget way.** Flag for confirmation.

### d) Systems health — scattered vs consolidated

**Built (default):** TM health inside Widget 2; transaction screening and name screening
(kept separate) inside Widget 4. **Not built:** one consolidated “Systems & Data Health”
widget. Sheet2’s “Financial Crime Analytics/Technology” line to the MLRO argues for
consolidation — revisit before promoting a peer widget.

### e) “Client Risk View” on the CRO board

MLRO Exposure tab was renamed Client Risk View. Whether that label should also replace
the Exposure lens name on the CRO board needs testing against Credit, Cyber and Climate
before adopting firm-wide.

### KRI ribbon retain/remove

See above — keep until Saurabh answers.

## Guardrails (inherited / enforced)

Same structural bans as v6 where applicable: `copy.ts`, ESLint overstated prose,
`typeContracts.test-d.ts`, `noOutbound.test.ts`, dispositions actorId rules, Path-to-Green
provenance (`system` = STATED / `email` = INFERRED) via one `PathToGreenStrip`.

## Tests

`lib/ukbankingaudit/v8/*.test.ts` plus `mlroOperational.test.ts` for overlay contracts
(two tabs, tier sums, face sources, appetites, multi-action / risk-accept PTG, 98.4%
training lock to the pack narrative).

## MLRO Operational Dashboard — layout (final)

Layout-only multipass. **No data files changed.** Isolation boundary:
`components/UKBankingAudit/v8/**` + `lib/ukbankingaudit/v8/MLRO_LAYOUT_INVENTORY.md`
(+ README). Note: `UKBankingControlTrace.tsx` also carries `previousScreen` for
attestation back-navigation (outside the v8 tree).

### Zone / column assignment (`MLROWorkspaceV8`)

| Region | Layout | Contents | Why |
| --- | --- | --- | --- |
| **A** | Full width | `FinancialCrimeKRIStrip` (`#mlro-panel-kri-strip`); walk-through **i** on the eyebrow | Single-glance FC posture; chips hard-right (`justify-between`) |
| **Ops (lg+)** | `lg:grid-cols-12` **7 / 5**, `items-start`, each column `flex flex-col gap-4` (no stretch) | **Left (7):** TM Alert (`#mlro-panel-alert-backlog`) → Sanctions (`#mlro-panel-sanctions`) → Fraud (`#mlro-panel-fraud`). **Right (5):** SAR+EDD (`#mlro-panel-sar-edd`) → Training (`#mlro-panel-fc-training`) | Balance by content stacking, not forced equal heights. Fraud last in the wide column (shortest; ragged foot OK) |
| **Ops (< lg)** | Single column via `contents` + `order-*` | TM → SAR → EDD → Sanctions → Training → Fraud | Reading order for narrow viewports |

Client Risk View (`lens === "exposure"`) is unchanged.

### Collapsed by default (and why)

| Widget | Collapsed / open | Why |
| --- | --- | --- |
| Alert backlog | **Trends · 13 weeks open by default**; Alerts→SARs, Capacity vs demand, TM system health collapsed | Direction of travel is the card’s argument |
| SAR timeliness | 13-week trend collapsed | Face = % on time |
| EDD pipeline | Red-band cases collapsed | Face = past due / in progress / awaiting MLRO |
| Sanctions | Six sections collapsed (2-across pairings) | Face = hold / OFSI breaches / list lag **3-up** |
| Training | Derivation & claims (summary `AP-MLRO-2025 · Pack 5.1`) | Face = three **tight** stacked tiles |
| Fraud | Own expand grammar (collapsed by default) | Face = three headline GBP / trend tiles |

Path to Green mounts inside `WidgetCardFooter` when band is amber or red.

### Shared primitives (v8 only)

| Primitive | Role |
| --- | --- |
| `CollapsibleSection` | Collapse row; summary while collapsed; wraps (no ellipsis); `openClassName` / `defaultOpen` |
| `StatTile` | Label + value + delta beside number; appetite; sizes `lg` / `sm` / `xs` / `tight` |
| `WidgetShell` / `WidgetCardFooter` | Card frame + flush Path-to-Green footer |

### Measured verify — 1920×1080, default collapse (Playwright)

| Metric | Value | Target |
| --- | --- | --- |
| Left column (TM → Sanctions → Fraud) | **1238.8px** | — |
| Right column (SAR+EDD → Training) | **918.8px** | — |
| Column Δ | **320px** | ~≤ 300px (slightly over) |
| Cards with internal gap > 24px (last content → bottom / body→footer) | **0** | 0 |
| Dashboard content span (h1 → ops foot) | **1412px** | — |
| Viewport multiples | **1.31×** | ≤ 2.00× |
| Primary micro-copy lines (tiers → collapses) | **1** | ≤ 1 |
| Investigation-tiers section label / duplicated L# headings | **absent** | absent |
| Inventory parity (all collapsibles expanded) | **0 missing** | 0 |
| Horizontal overflow @ 1280 / 1440 / 1920 | **none** | none |
| Collapsed summary wrap @ those widths | **none** | none |

Artifacts: `frontend/.verify-mlro-v8/verify-final-{1280,1440,1920}.png` (local only).
