# Regulatory Intelligence Inbox — User Guide

**Product:** ORI (Operational Risk Intelligence)
**Module:** Regulatory Intelligence Inbox
**Audience:** Compliance, ORM, MLRO, FCC, Internal Audit
**Route:** `/regulatory-intelligence` (mirrors `/IndianBankingAudit?screen=regulatoryIntelligence`)

> This document explains **what every tab, section, card, badge, KPI, and filter means**, **why it exists**, **how the data flows**, and **the abbreviations used across the screen**. It is the canonical "how to read this screen" reference. Pair it with `REG_INTEL_SPEC.md` for engineering / data-shape detail.

---

## 1. What the Inbox Is

The Regulatory Intelligence Inbox is the **single front door** for every regulatory change that affects the bank. It ingests structured + unstructured material from Indian regulators within minutes of publication and turns each item into an **actionable workflow card** with:

- AI-extracted **obligations** (atomic "you must do X" requirements).
- A **CCO-first five-stage workflow** (Acknowledge → Assess → Assign → Implement → Certify).
- A **coverage view** of which obligations are met by existing controls.
- An **AI narrative** with citations into the source document.
- Cross-links to **Obligation Coverage**, **Control Testing**, **Issues Board**, **Evidence Workbench**, **Inspection Readiness**, and **RCSA Workspace**.

### 1.1 Why it exists

| Problem today | What the inbox does |
|---|---|
| Updates arrive via email / PDF forwards | Structured ingest from RBI, FIU-IND, CERT-In, MoF, SEBI, NPCI |
| No accountable first responder | CCO is the default Stage 1 owner; SLA-tracked |
| Updates are "read and forget" | Every alert runs through five governance stages |
| Obligations are buried in PDFs | AI extracts atomic obligations + cites the source paragraph |
| Coverage gaps surface only in audits | Coverage chips show the gap at the obligation level |
| Peer enforcement (RBI press releases on other banks) is informal | First-class "Peer Signal" lane with similarity score |

---

## 2. Personas

| Persona | Role in this screen |
|---|---|
| **CCO** (Chief Compliance Officer) | First responder. Owns Stage 1 (Acknowledge) and Stage 5 (Certify). |
| **Head of ORM** (Operational Risk Management) | Owns Stage 2 (Assess) — maps obligations to controls. |
| **MLRO** (Money Laundering Reporting Officer) | Reviews AML / FIU alerts in particular. |
| **Head of FCC** (Financial Crime Compliance) | Reviews PMLA / KYC / sanctions alerts. |
| **Accountable SM** (Senior Manager) | Named on each alert; ultimately attests at Stage 5. |

---

## 3. Layout — Three Zones

The screen is organised as **Zone A** (top header), **Zone B** (left inbox list), **Zone C** (right detail panel). On mobile, Zone C opens as a bottom sheet.

```
┌───────────────────────────────────────────────────────────┐
│  ZONE A — Filters + KPIs (full width)                     │
├───────────────────────┬───────────────────────────────────┤
│                       │                                   │
│  ZONE B               │  ZONE C                           │
│  Inbox list           │  Alert detail                     │
│  (cards)              │  (C1 → C2 → C3 → C4 → C5)         │
│                       │                                   │
└───────────────────────┴───────────────────────────────────┘
```

Until an alert is selected, Zone B uses **full width**. When an alert is opened, the screen switches to **~46 / ~54** split on desktop; on mobile, Zone C opens as a sheet.

---

## 4. Zone A — Header (Filters + KPIs)

Zone A is one band at the top with **three logical rows**:

### 4.1 Row 1 — Sub-tabs + Filter band

On desktop, sub-tabs (left) and filters (right) share one row. On mobile, sub-tabs stack on top.

#### Sub-tabs

| Tab | Meaning | Filter applied to inbox |
|---|---|---|
| **Active Alerts** | Final, binding regulatory instruments (Circulars, Master Direction amendments, Directions, Operational Circulars). | `instrument_type ≠ DRAFT DIRECTION` and `is_peer_signal = false` |
| **Consultations** | Draft directions / consultation papers open for industry comment. **Not** yet binding. | `instrument_type = DRAFT DIRECTION` |
| **Peer Signals** | Enforcement actions taken by regulators against **other** banks. Informational + self-assessment trigger; does **not** run the 5-stage workflow against your pack. | `is_peer_signal = true` |

The count badge on each tab equals the number of records of that kind currently in the dataset (before filters). The colour band under the badge is brand-aligned: **navy** (alerts), **sky** (consultations), **amber** (peer).

#### Filters (right side of the row)

| Filter | Values | Why |
|---|---|---|
| **Period** | All time · Last 7d · Last 30d · Last 90d · Last 12m · Custom | Filters by `publication_date`. Custom shows a From / To date row below. |
| **Source** | All Sources · RBI · FIU-IND · CERT-In · MoF / Gazette · SEBI · NPCI | Regulator that issued the item. |
| **Stage** | All Stages · Acknowledge · Assess · Assign · Implement · Certify · Closed | Where the alert sits in the five-stage workflow. |
| **Penalty only** (toggle) | On / Off | Show only items with a non-empty `penalty_exposure[]` **plus** all peer signals (peer signals always imply realised penalty on another bank). |

### 4.2 Row 2 — KPI strip (four tiles)

Each tile is a button. Clicking it applies a **KPI drill-down filter** that overrides the sub-tab and works across **all** lanes (Active Alerts + Consultations + Peer). Clicking the active tile again clears the filter. The active tile shows a white ring.

| # | Tile | What it counts (live, from `alerts[]`) | What clicking it does |
|---|---|---|---|
| 1 | **In Flight** (navy) | All alerts where `stage ≠ closed`. The book of work currently being managed. | Shows every in-flight alert across all lanes. |
| 2 | **Pending CCO Ack** (amber when > 0, green when 0) | Alerts at `stage = acknowledge`. Pulses when > 0. SLA: Tier 1 = 4h. | Shows only alerts awaiting your acknowledgement. |
| 3 | **Effective ≤ 30 Days** (red when > 0, green when 0) | Alerts with `0 ≤ days_to_effective ≤ 30`. The "compliance window closing" view. | Shows the urgent runway. |
| 4 | **Uncovered Obligations** (red when > 0, green when 0) | Alerts where `uncovered_count > 0`. The P0 governance item. | Shows alerts with at least one obligation no control claims. |

The numbers on the tiles match exactly what the filter shows, because they are computed from the same alerts collection via `computeKpiSummary()`.

### 4.3 Help tips (the `?` glyphs)

Hovering / focusing the `?` next to a label reveals a short definition. The copy lives in `regIntelHelpCopy.ts` and covers materiality, HITL, coverage, governance track, AI citations, and source hash.

---

## 5. Zone B — Inbox List

A scrollable list of **alert cards**, sorted by urgency. The header line shows the count (e.g. `5 alerts`) and the active sort label (`Sorted by urgency`). When a search term is present, it shows `5 of 11 alerts · matching 'kyc'`.

### 5.1 Sort order (`sortInboxAlerts`)

1. **Emergency** governance track
2. **Expedited** governance track
3. **Peer signals** (by materiality, descending)
4. **Standard** / **advisory**
5. **Drafts** (last)

Within each tier: by `days_to_effective` ascending (non-null first), then `materiality_score` descending, then `publication_date` descending.

### 5.2 Card variants

There are **three card variants** in Zone B. The variant is chosen automatically based on the alert's flags.

#### 5.2.1 Standard Alert Card

The default card for binding regulatory instruments.

```
┌────────────────────────────────────────────────────────┐
│ ▌ RBI CIRCULAR                       EXPEDITED   ?     │
│ ▌ Liberalised Remittance Scheme (LRS) …    VERIFIED ✓  │
│ ▌ RBI/2026-27/14 · Published 12 May 2026               │
│ ▌                                                      │
│ ▌  ╭──╮   ⏱ 18d to effective    FEMA s.11(3)           │
│ ▌  │81│   ●●○○○                                        │
│ ▌  ╰──╯   ACKNOWLEDGE — STAGE 1 OF 5                   │
└────────────────────────────────────────────────────────┘
```

| Element | Meaning |
|---|---|
| Coloured **left stripe** | Source colour (RBI navy, FIU purple, CERT-In red, MoF green, SEBI orange, NPCI blue) or **PEER amber**. |
| **Source / instrument chip** | E.g. `RBI CIRCULAR`, `FIU-IND DIRECTION`. Built from `source + instrument_type`. |
| **Governance track pill** | `EMERGENCY` (red), `EXPEDITED` (amber), `STANDARD` (grey), `ADVISORY` (blue). See §9 for cut-offs. |
| **VERIFIED / PENDING VERIFICATION** | Set from `source_verified`. VERIFIED = source ingest pipeline confirmed publisher hash matches. |
| **Instrument name** | Plain-English title. |
| **Instrument ref** | Canonical regulator reference (e.g. `RBI/2026-27/14 A.P.(DIR Series) Circular No. 03`). |
| **Materiality ring** | 0–100 score. **Red ≥ 80**, **amber ≥ 60**, **green < 60**. Drives sort tie-breaker. |
| **Countdown chip** | See §6. |
| **Stage dots** | 5 dots, filled through the current stage in the source colour. |
| **Penalty chips** | Right-aligned. Statutes you face if non-compliant (e.g. `FEMA s.11(3)`, `PMLA s.13`). |
| **Unread dot** | Small blue dot bottom-right. Cleared on open. |

#### 5.2.2 Draft / Consultation Card

```
┌────────────────────────────────────────────────────────┐
│ ▌ RBI DRAFT DIRECTION             CONSULTATION OPEN    │
│ ▌ Draft Disclosure Framework — Climate…   VERIFIED ✓   │
│ ▌ RBI/Draft/2026-27/02 · Published 15 Mar 2026         │
│ ▌                                                      │
│ ▌  ╭──╮   📢 32d to consultation close                  │
│ ▌  │72│                                                │
│ ▌  ╰──╯                                                │
│ ▌  Response status: No response drafted                │
└────────────────────────────────────────────────────────┘
```

Differences from a Standard card: sky-blue chip strip, **CONSULTATION OPEN** flag, **consultation countdown** instead of effective-date countdown, **no stage dots** (drafts do not run the 5-stage workflow), response-status line.

#### 5.2.3 Peer Signal Card

```
┌────────────────────────────────────────────────────────┐
│ ▌ 👁 PEER ENFORCEMENT SIGNAL   SELF-ASSESSMENT RECOMMENDED │
│ ▌ RBI ₹38.60 lakh penalty on IDFC First …  VERIFIED ✓  │
│ ▌ RBI Press Release: 2025-2026/134 · Detected …        │
│ ▌                                                      │
│ ▌  ╭──╮   ⚠ Awaiting self-assessment                   │
│ ▌  │78│                                                │
│ ▌  ╰──╯                                                │
└────────────────────────────────────────────────────────┘
```

Amber stripe, binoculars icon, **SELF-ASSESSMENT RECOMMENDED** chip. The 5-stage workflow does **not** run; the action is to run a self-assessment in the **RCSA Workspace** and mark the signal reviewed.

### 5.3 Keyboard

`↑` / `↓` to move focus between cards, `Enter` / `Space` to open, `Esc` to clear selection.

### 5.4 Empty state

If the filter combination yields zero alerts, an illustration appears with a **Clear All Filters** action. If a search term has zero matches, a separate **Clear Search** action appears.

---

## 6. Countdown chips

The pill that sits under the materiality ring on every card and at the top of Zone C.

| Variant | Source state | Tone | Copy |
|---|---|---|---|
| **Effective ≤ 7d** | Binding instrument, days_to_effective 1–7 | Rose | `Xd to effective` (urgent flag) |
| **Effective 8–21d** | Binding instrument | Amber | `Xd to effective` |
| **Effective > 21d** | Binding instrument | Green | `Xd to effective` |
| **Passed** | Days_to_effective ≤ 0 | Grey | `Effective passed` |
| **Consultation** | Draft direction | Blue | `Xd to consultation close` |
| **Peer** | Peer signal | Amber | `Awaiting self-assessment` |
| **No schedule** | No effective date and not a draft | Grey | `No schedule` |

---

## 7. Zone C — Alert Detail

Opens when a card is selected. Five vertically stacked sections.

### 7.1 C1 — Header

| Element | Meaning |
|---|---|
| **Source chip + domain pill + penalty chips** | Same vocabulary as the inbox card; in larger size. |
| **Stage badge** (top-right) | Current stage as a labelled pill: `PENDING ACKNOWLEDGEMENT` (amber), `UNDER ASSESSMENT` (blue), `ASSIGNING ACTIONS` (indigo), `IMPLEMENTATION` (teal), `CERTIFY` (green), `CERTIFIED CLOSED` (grey). |
| **Instrument name** | Large heading. |
| **Source-hash line** | `Instrument ref · Published <date> · As-of <today> · State hash 0x….` Hover the hash for the integrity-tooltip explaining what it is and why it matters for audit trail. |
| **WorkflowStepper** | Five circles with connectors: Acknowledge → Assess → Assign → Implement → Certify. The current step pulses; completed steps are filled in the source colour with a tick. Closed alerts show all five as completed. |
| **Countdown banner** | Below the stepper: effective-date countdown (with `URGENT` flag at ≤ 7d), consultation-close countdown, or peer self-assessment prompt. |

### 7.2 C2 — Composition Strip

Three blocks side-by-side. **Different layout** for binding alerts vs. drafts vs. peer signals.

#### 7.2.1 Standard variant (binding alerts)

| Block | Numbers | Meaning |
|---|---|---|
| **Atomic obligations extracted** | `obligations_total` (large) · `obligations_approved · obligations_pending_hitl` (small) | How many obligations the AI extracted, how many ORM has approved, and how many still need HITL review. Includes the **Materiality** score and a row of clickable obligation-ID chips that scroll to the matching row in C3. |
| **Coverage Gap** | `uncovered` (large) · `uncovered · partial · covered` (small) | Of the obligations, how many have no control claiming coverage. The stacked bar visualises the split. **Red = uncovered, amber = partial, green = covered.** |
| **Preventive actions raised** | `pas_created` (large) · `open · closed` (small) | How many PAs have been raised for this alert. If 0, copy reads `No PAs yet — create in Stage 3`; if > 0, a button deep-links to the **Issues Board**. |

#### 7.2.2 Draft variant

| Block | Meaning |
|---|---|
| **Atomic obligations extracted** | Always `0` with copy `No binding obligations yet — obligations will be extracted only after the final direction is issued.` |
| **Consultation Response Status** | `No response drafted` and the deadline (e.g. `Deadline 15 Jun 2026 · 32 days left`). |
| **Response** | `Draft Response` button (placeholder for now). |

#### 7.2.3 Peer Signal variant

| Block | Meaning |
|---|---|
| **Similarity Analysis** | `ORI AI detected X% structural similarity with: <alert-id>`. The link button selects the similar in-flight alert. Recommended action: run a self-assessment. |

### 7.3 C3 — Obligation HITL (Human-in-the-Loop) rows

Expandable list of every AI-extracted obligation for the alert. Each row shows:

| Field | Meaning |
|---|---|
| Obligation **ID** | E.g. `OBL-RBI-LRS-072-A`. |
| **Coverage chip** | `UNCOVERED` (red) · `PARTIAL` (amber) · `COVERED` (green) · `UNKNOWN` (grey). |
| **HITL status badge** | `PENDING` · `APPROVED` · `REJECTED`. |
| **Confidence** | AI confidence 0–100. Green ≥ 85, amber ≥ 70, rose < 70. |
| **Linked controls** | The control IDs that claim coverage (e.g. `AML-C004`). |
| **CES** badge | Control Effectiveness Score 0–100. Green ≥ 80, amber ≥ 60, rose < 60. |
| **Cited paragraph** | The source paragraph the AI quoted, with a click-to-open link to the **Source Document Drawer** anchored at that paragraph. |
| Approve / Reject buttons | Move the obligation through HITL. Approving all pending obligations unlocks the Stage 2 → Stage 3 button. |

### 7.4 C4 — AI Narrative

A short paragraph the AI wrote about this alert, with **inline citation chips** that look like `§Para 4` superscripts. Click a chip to jump to the matching obligation row (or open the source document anchored at that para).

| Element | Meaning |
|---|---|
| **Narrative body** | Editable textarea. The `narrativeEdited` flag tracks unsaved edits. |
| **Citation chips** | Built from `[Pack §…]` markers in the text. Map to obligations by `cited_paragraph` (fallback: index order). |
| **AI · N CITATIONS** footer chip | Count of citations rendered. |
| **Model id** | E.g. `narrative-generator-v4.1`. Provenance for audit. |

### 7.5 C5 — Action Bar

The CTA is **stage-aware**. Only the relevant buttons render.

| Current stage | Primary action | Secondary action |
|---|---|---|
| `acknowledge` | **Acknowledge & Classify** → moves to `assess` and notifies Head of ORM | Mark as Advisory Only |
| `assess` | **Approve Obligation Set** (disabled while pending-HITL > 0) → moves to `assign` | Request More Information |
| `assign` | **Create Preventive Actions** → creates `uncovered + partial` PAs, moves to `implement` | View in Issues Board |
| `implement` | **Check Control Test Result** (deep-link to Control Testing for the relevant control) + **View Evidence Workbench** | `Mark Implementation Complete` link → moves to `certify` |
| `certify` | **Sign & Certify Closure** → moves to `closed`, records timestamp, logs to SAES | Open Inspection Pack |
| `closed` | Read-only — shows `Certified by … on <datetime>` and `View Full Audit Trail` | — |
| `DRAFT DIRECTION` (any stage) | **Submit Consultation Response** | Mark as Monitored |
| Peer signal (non-closed) | **Run Self-Assessment** (deep-link to RCSA Workspace) | Mark as Reviewed |
| Any | **View Source Document** | — |

Confetti / celebration animation fires on `Sign & Certify Closure`.

### 7.6 Zone C header (above C1)

A thin strip with:

- **Metrics** button — opens the **CCO Metrics Drawer** (see §11).
- **Close** (X) button — clears the alert selection and returns the inbox to full width.

---

## 8. Source Document Drawer

Reachable from `View Source Document` (C5) and from any citation chip / cited-paragraph link.

| Field | Meaning |
|---|---|
| **Title** | Authority emblem (RBI / FIU-IND / …) + instrument ref + a `VERIFIED` line bound to the sync state for that source. |
| **Body** | Two tabs: **Original Text** (regulator's prose split into paragraph blocks with anchor IDs) and **Key Provisions** (bulleted summary from `key_provisions[]`). |
| **Highlight** | When opened from a citation, scrolls to the cited paragraph and highlights it. |
| **External link** | "Open on regulator's site" → `source_url`. |

---

## 9. Governance Track — the cut-offs

`governance_track` controls colour-coding and inbox sort tier.

| Track | Trigger | UI colour | Effect |
|---|---|---|---|
| **EMERGENCY** | Effective ≤ 14d **and** at least one uncovered obligation | Red | Top of the inbox, pager-style. |
| **EXPEDITED** | Effective 15–60d **and** at least one uncovered obligation | Amber | Second in the inbox. |
| **STANDARD** | Effective > 60d, or no uncovered obligation | Grey | Default sort tier. |
| **ADVISORY** | Drafts / consultations | Blue | Lowest tier; drafts sort last. |

---

## 10. Escalation Tiers

Every alert has `escalation_tier` 1–4. This drives **who is on the page** and **SLA**:

| Tier | Owner emphasis | Acknowledge SLA |
|---|---|---|
| **Tier 1** | CCO must ack within 4 hours; copies CRO / CEO | 4h |
| **Tier 2** | CCO + Head of ORM | 24h |
| **Tier 3** | Head of ORM | 72h |
| **Tier 4** | Head of FCC / MLRO desk | 7d |

---

## 11. CCO Metrics Drawer

A slide-over panel triggered by the **Metrics** button in Zone C. Six sections:

| Section | What it shows | Source |
|---|---|---|
| **MTTA** (Mean Time to Acknowledge) | Gauge with target < 4h + 8-week sparkline | `kpiSummary.mtta_hours` |
| **MTTC** (Mean Time to Certify) | Gauge with target < 30d + 8-week sparkline | `kpiSummary.mttc_days` |
| **Obligation coverage (all in-flight)** | Donut + legend across all in-flight obligations: Uncovered / Partial / Covered | Derived from `alerts[].obligations[].coverage_status` |
| **Pending HITL** | Total pending-HITL obligations + how many alerts they span | Derived from `obligations_pending_hitl` |
| **Active sources (inbox)** | Per-regulator count bars | Derived from `alerts[].source` |
| **Top stuck stages** | Per-stage count bars | Derived from `alerts[].stage` |
| **Penalty exposure** | Aggregate count of penalty-statute codes + peer-enforcement count | Derived from `alerts[].penalty_exposure[]` + `is_peer_signal` |

Closes on `Esc` (before clearing alert selection) and on backdrop click.

---

## 12. Data Sources (Indian regulators in scope)

The inbox ingests structured publication streams from each regulator + one peer-signal feed. Each source has a brand colour used everywhere (stripes, chips, charts).

| Code | Full name | Scope | Brand hex |
|---|---|---|---|
| **RBI** | Reserve Bank of India | Master Directions + amendments, Circulars, Draft Directions, Press Releases (peer enforcement) | `#1F4E79` (navy) |
| **FIU-IND** | Financial Intelligence Unit — India | AML / CFT guidance, STR/CTR procedural directions | `#7B2D8B` (purple) |
| **CERT-IN** | Indian Computer Emergency Response Team | Cyber incident reporting directions, technical advisories | `#C0392B` (red) |
| **MoF** | Ministry of Finance / Gazette of India | PMLA rules, FEMA notifications, gazette items | `#2C7A2C` (green) |
| **SEBI** | Securities and Exchange Board of India | Broker-dealer / DP rules (bank's capital-markets arm) | `#E8700A` (orange) |
| **NPCI** | National Payments Corporation of India | UPI / IMPS / e-mandate operational circulars | `#006FB4` (NPCI blue) |
| **IBA** | Indian Banks' Association | Industry guidance (placeholder; not heavily populated) | `#5D5D5D` (grey) |
| **PEER** | Peer enforcement signal (not a regulator per se) | RBI / SEBI / FIU enforcement actions against **other** banks, surfaced as informational | `#B7580A` (amber-orange) |

### 12.1 Sync state

A per-source `SyncSourceState` tracks `last_synced_at`, `status` (`fresh` / `stale` / `syncing` / `error`) and `records_pulled_today`. This drives:

- The **VERIFIED / PENDING VERIFICATION** badge on each card (from `source_verified`).
- The "last synced" line in the Source Document Drawer.
- A possible inbox-level sync strip (toggleable per build).

### 12.2 Instrument types

| Code | Meaning |
|---|---|
| `MASTER DIRECTION AMENDMENT` | Update to a published RBI Master Direction. |
| `CIRCULAR` | Binding circular. |
| `OPERATIONAL CIRCULAR` | Operational ops circular (NPCI / RBI ops). |
| `GUIDANCE NOTE` | Non-binding clarification. |
| `DIRECTION` | Final binding direction. |
| `DRAFT DIRECTION` | Draft for industry consultation. |
| `PEER ENFORCEMENT SIGNAL` | Enforcement action against another bank. |

---

## 13. The Five-Stage Workflow

| # | Stage | UI label | Owner | What happens here |
|---|---|---|---|---|
| 1 | `acknowledge` | **PENDING ACKNOWLEDGEMENT** | CCO | Open, read, classify, set governance track. SLA per tier. |
| 2 | `assess` | **UNDER ASSESSMENT** | Head of ORM | HITL on every obligation. Map controls to obligations; set coverage_status. CCO reviews. |
| 3 | `assign` | **ASSIGNING ACTIONS** | Head of ORM / SM | Convert uncovered + partial obligations into **Preventive Actions (PAs)**. Set SM accountability. |
| 4 | `implement` | **IMPLEMENTATION** | 1LoD + 2LoD | 1LoD updates controls; 2LoD tests them. Cross-link to Control Testing + Evidence Workbench. |
| 5 | `certify` | **CERTIFY** | CCO + SM | CCO signs off; SM attests; pack updated; recorded in SAES. |
| — | `closed` | **CERTIFIED CLOSED** | — | Archived, audit trail only. |

Peer signals do **not** advance this workflow on the bank's own pack.

---

## 14. Coverage Chips (per obligation)

| Chip | Meaning | Trigger |
|---|---|---|
| **UNCOVERED** | No active control claims this obligation | `linked_controls.length === 0` |
| **PARTIAL** | A control exists but its CES is below the threshold (typically < 80) | `linked_controls.length ≥ 1` and `linked_control_ces < 80` |
| **COVERED** | At least one control with CES ≥ 80 | `linked_controls.length ≥ 1` and `linked_control_ces ≥ 80` |
| **UNKNOWN** | Mapping not yet classified | Pre-HITL placeholder |

---

## 15. HITL (Human-in-the-Loop)

Every AI extraction must be reviewed by a human before it can drive workflow.

| HITL status | Meaning |
|---|---|
| `pending` | AI extracted the obligation but no human has reviewed yet. Blocks Stage 2 → Stage 3 advance. |
| `approved` | ORM analyst confirmed the obligation is correctly extracted. |
| `rejected` | ORM analyst rejected the extraction (e.g. duplicate, false positive). |

---

## 16. AI Citation Format

`[Pack §X.Y]` markers in the narrative render as `§X.Y` superscript chips. Mapping:

1. Look up `cited_paragraph` exact-match across obligations.
2. Fall back to index order — `§1` = first obligation, `§2` = second, etc.

Each chip is clickable: it expands the matched obligation row, or opens the Source Document Drawer anchored at the paragraph.

---

## 17. Cross-navigation (deep links out)

From the inbox you can jump to other ORI screens, with context preserved in query string:

| Destination | Trigger | Query |
|---|---|---|
| `/obligation-coverage` | Obligation-ID chip click | `?obligation=<id>` or `?instrument=<ref>` |
| `/control-testing` | "Check Control Test Result" at `implement` stage | `?control=<ctrlId>` (prefers a partial-coverage obligation's first linked control) |
| `/issues-board` | "View in Issues Board" at `assign` stage | — |
| `/issues-board?filter=pa` | "View PAs in Issues Board" from C2 | `?filter=pa` |
| `/evidence-workbench` | "View Evidence Workbench" at `implement` | — |
| `/inspection-readiness` | "Open Inspection Pack" at `certify` | — |
| `/rcsa-workspace` | "Run Self-Assessment" on peer signals | — |

---

## 18. Toasts (transient confirmations)

The action bar fires success / info toasts via `RegIntelToastProvider`:

| Action | Toast |
|---|---|
| Acknowledge | "Acknowledged — advanced to Assess stage" |
| Approve Obligation Set | "Obligation set approved — advanced to Assign stage" |
| Create Preventive Actions | "N PAs created — advanced to Implement stage" |
| Mark Implementation Complete | "Implementation marked complete — advance to Certify." |
| Sign & Certify Closure | "Certified. SAES record updated for <SM>." |
| Submit Consultation Response | "Consultation response saved." |
| Mark Peer Signal Reviewed | "Peer signal marked as reviewed." |

---

## 19. Glossary — Every Abbreviation on the Screen

| Term | Expansion | Meaning in context |
|---|---|---|
| **AFI** | Annual Financial Inspection | RBI's annual on-site supervisory inspection. Inspection pack rolls up evidence for AFI. |
| **AML** | Anti-Money Laundering | Domain tag. |
| **AP (DIR)** | Authorised Person (Directives) | RBI Foreign Exchange Dept series used in LRS / FEMA circulars. |
| **BRMC** | Board Risk Management Committee | Board sub-committee that receives the certified pack. |
| **CCO** | Chief Compliance Officer | First responder; owns Stage 1 + Stage 5. |
| **CDD** | Customer Due Diligence | KYC sub-process. |
| **CES** | Control Effectiveness Score | 0–100 score on each linked control. ≥80 green, ≥60 amber, <60 rose. |
| **CERT-In** | Indian Computer Emergency Response Team | Cyber regulator under MeitY. |
| **CFT** | Combating the Financing of Terrorism | Twinned with AML. |
| **CISO** | Chief Information Security Officer | Often the accountable SM for CERT-In items. |
| **CRO** | Chief Risk Officer | Often accountable SM for risk-modelling / climate items. |
| **CTR** | Cash Transaction Report | FIU-IND reporting product. |
| **DP** | Depository Participant | SEBI-regulated function of the bank. |
| **ESG** | Environmental, Social, Governance | Domain tag for climate-disclosure items. |
| **FATF** | Financial Action Task Force | International AML body referenced in FIU items. |
| **FCC** | Financial Crime Compliance | Function reviewing AML / sanctions alerts. |
| **FEMA** | Foreign Exchange Management Act, 1999 | Statute under which LRS / NRI items sit. Penalty exposure chips often cite FEMA sections. |
| **FIU-IND** | Financial Intelligence Unit — India | AML regulator; receives STR / CTR. |
| **HITL** | Human-in-the-Loop | Mandatory human review of every AI extraction. |
| **HNI** | High Net-worth Individual | KYC-refresh cadence cohort. |
| **IBA** | Indian Banks' Association | Industry body. |
| **IMPS** | Immediate Payment Service | NPCI rail. |
| **ISSB-S2** | IFRS Sustainability Disclosure Standard 2 | Climate-disclosure baseline RBI mirrors. |
| **KYC** | Know Your Customer | RBI Master Direction domain. |
| **LRS** | Liberalised Remittance Scheme | RBI scheme allowing residents to remit USD up to a cap. |
| **MeitY** | Ministry of Electronics and IT | Parent of CERT-In. |
| **MLRO** | Money Laundering Reporting Officer | Persona on AML alerts. |
| **MoF** | Ministry of Finance | Gazette / PMLA rule publisher. |
| **MTTA** | Mean Time to Acknowledge | KPI in metrics drawer (target < 4h). |
| **MTTC** | Mean Time to Certify | KPI in metrics drawer (target < 30d). |
| **NBFC** | Non-Banking Financial Company | Phase-in scope on disclosure items. |
| **NPCI** | National Payments Corporation of India | UPI / IMPS / e-mandate regulator. |
| **NRE** | Non-Resident External (account) | KYC-refresh cadence cohort. |
| **NRI** | Non-Resident Indian | Customer cohort for LRS / NRE / NRO. |
| **OBL-…** | Obligation ID | Each AI-extracted obligation. |
| **ORI** | Operational Risk Intelligence | This product. |
| **ORM** | Operational Risk Management | Function that owns Stage 2 (Assess). |
| **PA** | Preventive Action | Issue created in Stage 3 to close a coverage gap. |
| **PMLA** | Prevention of Money Laundering Act, 2002 | Statute behind FIU directions. Penalty exposure chips often cite PMLA sections. |
| **PoC** | Point of Contact | E.g. CERT-In PoC change intimation. |
| **R-Return** | LRS Daily R-Return | XBRL daily report by Authorised Dealer banks. |
| **RAG** | Red / Amber / Green | Status colour scheme. |
| **RBI** | Reserve Bank of India | Primary regulator. |
| **RCSA** | Risk and Control Self-Assessment | Workspace used for peer-signal self-assessment. |
| **RE** | Regulated Entity | RBI's term for banks / NBFCs / UCBs. |
| **SAES** | Senior Accountability Evidence Store | Ledger of CCO + SM attestations on certifications. |
| **SEBI** | Securities and Exchange Board of India | Capital-markets regulator. |
| **SLA** | Service Level Agreement | Time-bound expectation per tier (e.g. 4h ack on Tier 1). |
| **SM** | Senior Manager | Accountable individual named on each alert. |
| **SMCR** | Senior Managers and Certification Regime | UK-pattern accountability framework that informs the Indian SM concept. |
| **STR** | Suspicious Transaction Report | FIU-IND reporting product. |
| **TCFD** | Task Force on Climate-related Financial Disclosures | Climate-disclosure baseline. |
| **UCB** | Urban Co-operative Bank | Phase-in scope on disclosure items. |
| **UPI** | Unified Payments Interface | NPCI rail. |
| **XBRL** | Extensible Business Reporting Language | Format for regulatory filings (e.g. R-Return). |
| **1LoD / 2LoD / 3LoD** | First / Second / Third Line of Defence | Business / risk-function / audit owner split. |

---

## 20. Quick Reference — Reading a Card in 5 Seconds

1. **Left stripe colour** → Regulator (RBI navy, FIU purple, CERT-In red, MoF green, SEBI orange, NPCI blue, **peer amber**).
2. **Top-right pill** → Governance track (`EMERGENCY` / `EXPEDITED` / `STANDARD` / `ADVISORY` / `CONSULTATION OPEN` / `SELF-ASSESSMENT RECOMMENDED`).
3. **Materiality ring** → 0–100 number tells you "how big a deal is this".
4. **Countdown chip** → How much time you have.
5. **Stage dots** → How far through the 5-stage workflow you are.
6. **Penalty chips** → What statute hits you if you miss it.

If all six look angry (red stripe, EMERGENCY, ring ≥ 80, ≤ 7d, Stage 1, penalty chips visible), it's the most urgent thing on your desk.

---

## 21. Key Files (for engineers)

| Concern | File |
|---|---|
| Mock data | `frontend/lib/IndianBankingAudit/regIntelMockData.ts` |
| Filters + KPI compute | `frontend/components/IndianBankingAudit/screens/regIntel/regIntelFilters.ts` |
| Inbox shell | `frontend/components/IndianBankingAudit/screens/RegulatoryIntelligenceInbox.tsx` |
| Zone A (filters + KPIs) | `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneA.tsx` |
| Zone B (list + cards) | `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneB.tsx` |
| Zone C (detail) | `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneC.tsx` |
| Zone C middle (obligations + narrative) | `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneCMiddle.tsx` |
| Zone C action bar | `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelZoneCActionBar.tsx` |
| Metrics drawer | `frontend/components/IndianBankingAudit/screens/regIntel/RegIntelCCOMetricsDrawer.tsx` |
| Source-document drawer | `frontend/components/IndianBankingAudit/screens/regIntel/SourceDocumentDrawer.tsx` |
| Cross-nav routes | `frontend/components/IndianBankingAudit/screens/regIntel/regIntelPaths.ts` |
| Engineering spec | `frontend/components/IndianBankingAudit/REG_INTEL_SPEC.md` |

---

*Document maintained alongside the screen. When you change the UI, update the relevant section here.*
