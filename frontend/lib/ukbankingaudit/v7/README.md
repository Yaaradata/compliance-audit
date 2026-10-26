# UK Banking Audit — v7 data layer

This directory holds the v7 board-pack and MLRO Operational Dashboard overlays.
Read this before putting anything from v7 in front of a client or a regulator.

## What is synthetic vs real

- **SYNTHETIC, seeded, deterministic**: all domain, evidence, history, config-change,
  attestation, risk-acceptance, accountability, and MLRO operational overlay data.
  None of it describes a real firm.
- **REAL, public, posture-tagged**: every record in `precedentCorpus.ts` (same corpus
  rules as v6 — Metro Bank unresolved, unnamed Enforcement Watch firms, etc.).

## Data isolation — do not edit mockDataV2

`mockDataV2.ts` is shared by v2 through v6. **Never edit it for a v7 feature.**

v7 extends the graph via `mockDataV7.ts`, which spreads `mockDataV6` and overlays
v7-only keys built in `mlroOperationalData.ts` (and related v7 modules). Same
pattern `mockDataV3.ts` already uses on v2 (replace/filter without mutating the
shared base file).

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

When adding a version, every `variant === "v6"` needs a parallel `variant === "v7"`
branch, and every `variant !== "v6"` exclusion needs `&& variant !== "v7"`. Missing
either leaves v7 falling through to the legacy screen.

**Counts after final re-audit (double-quoted screen guards):**

| Pattern | Count |
| --- | --- |
| `variant === "v6"` | **13** |
| `variant === "v7"` | **13** (1:1 counterpart) |
| `variant !== "v6"` | **12** |
| `variant !== "v7"` | **12** (every exclusion includes v7) |

Also: mock selector (~line 676) chooses `mockDataV7` first; `singleParagraph` OR-chain
includes `v7`; `ukTraceRuntime.bindUkTraceMock` maps v7 → v3 UI tokens (one-line
companion outside the v7 tree — required for byte-identical chrome).

## Saurabh-driven changes → where they landed

| Saurabh comment / ask | v7 change |
| --- | --- |
| Ownership is a fact, not a lens | Ownership lens removed; `DomainOwnershipHeaderLine` on every domain drill header (`DomainDrillPanel`) |
| Tier the lenses (strategic / operational) | Tier selector on `DomainDrillPanel`: Strategic = Exposure; Operational = Assurance / Momentum / Defensibility; Both = all four |
| “Board challenge” is the wrong label | Renamed to **Regulatory Landscape** (`RegulatoryLandscapePanel` / `RegulatoryLandscapeCard`); two headings + “Not yet assessed”; muted RAG; filters to the open domain |
| SMF17 label for demo credibility | Persona: **Head of Financial Crime (SMF17)**; nav: **Financial Crime Workspace** (`mockDataV7` overlay; ids stay `smf17` / `mlroWorkspace`) |
| Exit candidates must be division-tagged | `ExitCandidateCluster.division`; Saurabh fincrime tags; legacy-pre-2022-kyc **deleted** (contribs renormalised to 100); division filter on Exposure lens |
| Geographic concentration (Malaysia / cards) | Seeded placeholder on `FraudLossPanel` expanded state; `(source to confirm)` honesty label |
| Outbound network must be impossible | `noOutbound.test.ts` repointed to scan **v7** dirs (was wrongly still scanning v6) |

## Open items — recorded, **not** to be built

### a) Renaming Exposure / Momentum / Defensibility

Blocked on terminology research; Saurabh is sending reference material. Names must be
tested against all nine domains, not just financial crime.

### b) Fraud geography placement — Operational Dashboard or Client Risk View

Saurabh framed jurisdiction × product as inherent exposure. Temporary home:
`FraudLossPanel` expanded. Decide with him before Client Risk View work.

### c) Client Risk View internals

Saurabh has sequenced this next. Do not restructure that tab until he does.

### d) KRI strip EDD past due **11** vs EDD widget **5**

`KRI-FC-017` current = 11 (shared `mockDataV2` kris). EDD pipeline widget counts
`eddPipelineItems` with `status === "past_due"` = **5**. Two sources for one metric
on one screen. Reconcile before this goes in front of a bank. **Do not silently
change either number in this pass.**

### e) Five `v7/mlro/` components built and wired to nothing

`SuppressionLedger`, `DispositionDispersion`, `ScreeningDenominator`,
`CadenceFeasibility`, `OperationalAssuranceVerdict` — exported from `mlro/index.ts`,
not mounted in `MLROWorkspaceV7`.

### Earlier open items (still parked)

- TM tuning / false-positive metric (research); SuppressionLedger is the dormant seed
- Alert-to-SAR conversion expected range (3.2% INFO until benchmark)
- Fraud as filter vs widget — built as widget; confirm
- Systems health scattered vs consolidated
- Whether “Client Risk View” should also rename the CRO Exposure lens firm-wide
- KRI ribbon retain/remove — keep until he answers

## Guardrails (inherited / enforced)

Same structural bans as v6 where applicable: `copy.ts`, ESLint overstated prose,
`typeContracts.test-d.ts`, `noOutbound.test.ts` (**scans v7 components + lib**),
dispositions actorId rules, Path-to-Green provenance (`system` = STATED / `email` =
INFERRED) via one `PathToGreenStrip`.

## Tests

`lib/ukbankingaudit/v7/*.test.ts` plus `mlroOperational.test.ts` for overlay contracts
(two tabs, tier sums, face sources, appetites, multi-action / risk-accept PTG, 98.4%
training lock to the pack narrative). Exposure tests also lock division tags, five
fincrime clusters, no legacy id, contributions sum 100.

## MLRO Operational Dashboard — layout (final)

Layout-only multipass. **No data files changed.** Isolation boundary:
`components/UKBankingAudit/v7/**` + `lib/ukbankingaudit/v7/MLRO_LAYOUT_INVENTORY.md`
(+ README). Note: `UKBankingControlTrace.tsx` also carries `previousScreen` for
attestation back-navigation (outside the v7 tree).

### Zone / column assignment (`MLROWorkspaceV7`)

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

### Shared primitives (v7 only)

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

Artifacts: `frontend/.verify-mlro-v7/verify-final-{1280,1440,1920}.png` (local only).
