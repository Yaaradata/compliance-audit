# MLRO Operational Dashboard — layout data inventory (v8)

**Purpose:** Exhaustive list of every distinct data point rendered on the MLRO
Operational Dashboard (`lens === "assurance"`) as of this pass. Pass 8 checks the
finished screen against this file line by line. No judgement applied — if it
renders, it is listed.

**Sources walked:**
- `components/UKBankingAudit/v8/screens/MLROWorkspaceV8.tsx`
- `components/UKBankingAudit/v8/screens/_shared.tsx` — FinancialCrimeKRIStrip,
  AlertBacklogVsAppetite, SARTimelinessBand, EDDPipelineStatus,
  SanctionsScreeningPosture, FinancialCrimeTrainingPosture, CapacityVsDemandGauge,
  SystemHealthBlock (nested)
- `components/UKBankingAudit/v8/mlro/FraudLossPanel.tsx`
- `components/UKBankingAudit/v8/PathToGreenStrip.tsx` (when mounted)

**Convention:** Each row = one on-screen datum. Columns: **Label (as rendered)** |
**Value / source expression** | **Owner widget**.

---

## Workspace chrome (MLROWorkspaceV8 — assurance lens)

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Page title (h1) | `persona.label` (`personas` id `smf17`) | Workspace chrome |
| Page subhead | `persona.subhead` | Workspace chrome |
| Lens option — Operational Dashboard | `MLRO_DASHBOARD_LENSES[0].label` (`"Operational Dashboard"`) | Workspace chrome / LensToggle |
| Lens option — Client Risk View | `MLRO_DASHBOARD_LENSES[1].label` (`"Client Risk View"`) | Workspace chrome / LensToggle |
| Active lens id | `lens` state (`"assurance"` \| `"exposure"`) | Workspace chrome |
| Walk-through line | Fixed copy (moved off foot): `title` + info affordance on Zone A `#mlro-panel-kri-strip` | Workspace chrome / Zone A |

---

## 1. FinancialCrimeKRIStrip

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Section title (eyebrow) | Fixed: `Financial Crime KRIs · mapped to F&FC appetite` | FinancialCrimeKRIStrip |
| Posture verdict sentence | `buildMlroPostureVerdict` from Alert / SAR / EDD widget bands (`alertSeries` → `worstBand`, `sarSeries` → `last.band`, `eddItems` → `eddPastDueBand`) | FinancialCrimeKRIStrip |
| Chip title attribute (hover hint) | Fixed: `Click a KRI for definition, bands, trend, and links` | FinancialCrimeKRIStrip |
| Empty state | Fixed: `No FC KRIs attached.` (when `kriList.length === 0`) | FinancialCrimeKRIStrip |
| Per-KRI name | `kri.name` | FinancialCrimeKRIStrip |
| Per-KRI band chip text | `kri.currentBand` (via `bandText`) | FinancialCrimeKRIStrip |
| Per-KRI band tone (border/bg) | `bandBg(kri.currentBand)` | FinancialCrimeKRIStrip |
| Per-KRI current value | `kri.current` | FinancialCrimeKRIStrip |
| Per-KRI unit | `kri.unit` | FinancialCrimeKRIStrip |
| Per-KRI sparkline series | `(kri.series \|\| []).map(p => p.value)` | FinancialCrimeKRIStrip |
| Per-KRI sparkline band | `kri.currentBand` | FinancialCrimeKRIStrip |
| Per-KRI sparkline size | `width={110}` `height={18}` | FinancialCrimeKRIStrip |
| Per-KRI green threshold line | `green ≤{kri.greenBand?.[1]}` | FinancialCrimeKRIStrip |
| Per-KRI amber threshold line | `amber ≤{kri.amberBand?.[1]}` | FinancialCrimeKRIStrip |
| Per-KRI threshold unit suffix | `kri.unit === "%" ? "%" : "ct"` | FinancialCrimeKRIStrip |
| Chip layout | `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))` — N chips, no empty cells | FinancialCrimeKRIStrip |
| KRI set filter (data selection, not a label) | KRIs where linked risk `croCategoryId === 'fraud_financial_crime'` OR risk id `R-FC-AML` / `R-FC-OFSI` / `R-FC-KYC` | FinancialCrimeKRIStrip / workspace |

---

## 2. AlertBacklogVsAppetite

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Eyebrow | Fixed: `AML Programme Posture · Primary widget` | AlertBacklogVsAppetite |
| Title | Fixed: `L1 / L2 / L3 alert backlog vs. appetite` | AlertBacklogVsAppetite |
| Narrative line | Fixed (≤12 words): `Backlog concentrates in L2.` | AlertBacklogVsAppetite |
| Widget status badge label | `OUT OF APPETITE` \| `APPROACHING` \| `WITHIN` · `{appetiteMetric?.current}` + optional `%` if metric includes `%` | AlertBacklogVsAppetite |
| Widget status badge tone | `widgetBand` = `last.worstBand` from tier overlay | AlertBacklogVsAppetite |
| Card band tone | `bandBg(widgetBand)` | AlertBacklogVsAppetite |
| compact prop | Optional; tighter padding + `StatTile` size `sm`; auto-fit grids (no viewport-width assumption) | AlertBacklogVsAppetite |
| Stat tiles | Four `StatTile`s — delta rendered beside the number | AlertBacklogVsAppetite |
| Stat label — Backlog (current) | Fixed: `Backlog (current)` | AlertBacklogVsAppetite |
| Stat value — Backlog (current) | `last.openBacklog` (`toLocaleString("en-GB")`) | AlertBacklogVsAppetite |
| Stat delta — Backlog | `{+/-}{backlogDelta}` vs 13 weeks ago (`last.openBacklog - first.openBacklog`) | AlertBacklogVsAppetite |
| Stat label — SLA breaches (this wk) | Fixed: `SLA breaches (this wk)` | AlertBacklogVsAppetite |
| Stat value — SLA breaches | `last.slaBreaches` | AlertBacklogVsAppetite |
| Stat delta — SLA breaches | `vs. {first.slaBreaches} 13 wks ago` | AlertBacklogVsAppetite |
| Stat label — Generated (this wk) | Fixed: `Generated (this wk)` | AlertBacklogVsAppetite |
| Stat value — Generated | `last.generated` | AlertBacklogVsAppetite |
| Stat sub — dispositioned | `vs. dispositioned {last.dispositioned}` (beside number via StatTile delta) | AlertBacklogVsAppetite |
| Stat label — Appetite breach | Fixed: `Appetite breach` | AlertBacklogVsAppetite |
| Stat value — Appetite breach | `{appetiteMetric.currentBand.toUpperCase()} {appetiteMetric.current}%` if `breachEvents[0]` else `—` | AlertBacklogVsAppetite |
| Stat sub — breach transition | `breach {fromBand}→{toBand}` from `appetiteMetric.breachEvents[0]` else `—` | AlertBacklogVsAppetite |
| Tier section heading | Fixed: `Investigation tiers · backlog vs appetite` | AlertBacklogVsAppetite |
| Per-tier id · label | `{tier.id} · {tier.label}` (L1/L2/L3) | AlertBacklogVsAppetite |
| Per-tier SLA line | `{tier.slaLabel} · {tier.slaBreaches} SLA breaches this wk` | AlertBacklogVsAppetite |
| Per-tier backlog value | `tier.backlog` | AlertBacklogVsAppetite |
| Per-tier band badge | `tier.band.toUpperCase()` | AlertBacklogVsAppetite |
| Per-tier band tone | `bandBg(tier.band)` | AlertBacklogVsAppetite |
| Per-tier appetite bar fill | `(tier.backlog / scale) * 100` where `scale = max(backlog, appetite) * 1.3` | AlertBacklogVsAppetite |
| Per-tier appetite tick | `(tier.appetite / scale) * 100` | AlertBacklogVsAppetite |
| Per-tier appetite caption | `appetite {tier.appetite}` | AlertBacklogVsAppetite |
| Per-tier OVER/WITHIN chip | `OVER` if `tier.backlog > tier.appetite` else `WITHIN` | AlertBacklogVsAppetite |
| Per-tier source line | `tier.sourceLabel` | AlertBacklogVsAppetite |
| Tier sum note | `Tier backlogs sum to programme backlog {last.openBacklog}` | AlertBacklogVsAppetite |
| Collapsible — Trends · 13 weeks (summary) | `{+/-}{backlogDelta} vs 13 wks` — collapsed by default | AlertBacklogVsAppetite / CollapsibleSection |
| Collapsible — Alerts converted to SARs (summary) | `{sar.count} · {sar.pct}%` — collapsed by default | AlertBacklogVsAppetite / CollapsibleSection |
| Collapsible — Capacity vs demand (summary) | `gap {+/-}{capacityGap}/wk` — collapsed by default | AlertBacklogVsAppetite / CollapsibleSection |
| Collapsible — TM system health (summary) | `{outagesForWindow(TM, last_3_months).length} outage(s)` — collapsed by default | AlertBacklogVsAppetite / CollapsibleSection |
| Spark label — Open backlog · 13 wk | Fixed: `Open backlog · 13 wk` | AlertBacklogVsAppetite |
| Spark trend cue — backlog | `↗ {tiered.length} weeks` | AlertBacklogVsAppetite |
| Spark series — backlog | `tiered.map(p => p.openBacklog)` | AlertBacklogVsAppetite |
| Spark band — backlog | `widgetBand` | AlertBacklogVsAppetite |
| Spark label — SLA breaches · 13 wk | Fixed: `SLA breaches · 13 wk` | AlertBacklogVsAppetite |
| Spark trend cue — SLA | Fixed: `↗ accelerating` | AlertBacklogVsAppetite |
| Spark series — SLA | `tiered.map(p => p.slaBreaches)` | AlertBacklogVsAppetite |
| Spark band — SLA | `widgetBand` | AlertBacklogVsAppetite |
| SAR conversion section label | Fixed: `Alert → SAR conversion` | AlertBacklogVsAppetite |
| SAR conversion metric label | `sar.label` (`TM_INVESTIGATIONS_SAR_CONVERSION.label`) | AlertBacklogVsAppetite |
| SAR conversion status chip | Fixed: `Informational` | AlertBacklogVsAppetite |
| SAR conversion count | `sar.count` + unit label `SARs` | AlertBacklogVsAppetite |
| SAR conversion pct | `sar.pct` + `%` | AlertBacklogVsAppetite |
| SAR conversion denominator | `of {sar.investigations} investigations` | AlertBacklogVsAppetite |
| SAR conversion source | `sar.sourceLabel` | AlertBacklogVsAppetite |
| Widget face source | `OPERATIONAL_WIDGET_SOURCES.alertBacklog` | AlertBacklogVsAppetite |
| Drill cue | Fixed: `Drill into AML.01.05.02 (MLRO Reporting) Per-Requirement Attestation View →` | AlertBacklogVsAppetite |
| Path to Green (conditional) | Mounted when `widgetBand` is `red` \| `amber`; `entityRef="TM Alerts Closed in SLA"` → see PathToGreenStrip fields below | AlertBacklogVsAppetite |

### 2a. CapacityVsDemandGauge (nested inside AlertBacklogVsAppetite)

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Eyebrow (nested) | Fixed: `Why the backlog · capacity vs demand` | CapacityVsDemandGauge |
| Title (nested) | Fixed: `Demand exceeds fixed disposition capacity` | CapacityVsDemandGauge |
| Gap badge | `GAP {+/-}{gap}/wk` where `gap = last.demand - last.capacity` | CapacityVsDemandGauge |
| Gap badge tone | `red` if `gap > 0` else `green` | CapacityVsDemandGauge |
| Chart — capacity series | `series[i].capacity` (SVG path) | CapacityVsDemandGauge |
| Chart — demand series | `series[i].demand` (SVG path) | CapacityVsDemandGauge |
| Chart — last capacity marker | `last.capacity` | CapacityVsDemandGauge |
| Chart — last demand marker | `last.demand` | CapacityVsDemandGauge |
| Legend — Capacity (FTE-equivalent) | Fixed label + value `last.capacity` | CapacityVsDemandGauge |
| Legend — Demand (alerts/wk) | Fixed label + value `last.demand` | CapacityVsDemandGauge |
| Narrative % rise | `~{round(((last.demand - series[0].demand) / series[0].demand) * 100)}%` | CapacityVsDemandGauge |
| Narrative causal chain | Fixed: gap from week 8 → backlog → AML-C002 → AML.01.05.02 | CapacityVsDemandGauge |
| Empty state | Fixed: `No capacity series.` | CapacityVsDemandGauge |

### 2b. SystemHealthBlock — TM (nested inside AlertBacklogVsAppetite)

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Section eyebrow | Fixed: `Systems & data health` | SystemHealthBlock (TM) |
| System name | `health.systemName` (`TM_SYSTEM_HEALTH`) | SystemHealthBlock (TM) |
| Coverage gap blurb | Fixed: `Coverage gap when the system is down — nothing screened for the outage duration.` | SystemHealthBlock (TM) |
| Band badge | `systemHealthWorstBand(health).toUpperCase()` | SystemHealthBlock (TM) |
| Window label | `w.label` (`Last month` / `Last 3 months`) | SystemHealthBlock (TM) |
| Window date range | `{w.from} → {w.to}` | SystemHealthBlock (TM) |
| Outages section heading | Fixed: `Outages` | SystemHealthBlock (TM) |
| Outages empty | Fixed: `No outages in this window.` | SystemHealthBlock (TM) |
| Per-outage duration | `{round(durationMinutes/60*10)/10}h outage` | SystemHealthBlock (TM) |
| Per-outage items unscored | `{alertsOrItemsMissed} items unscored` | SystemHealthBlock (TM) |
| Per-outage backfill chip | `Backfilled` \| `Not backfilled` | SystemHealthBlock (TM) |
| Per-outage time range | `{start} → {end}` (UTC formatting) | SystemHealthBlock (TM) |
| Per-outage logger · escalation | `{loggedBy} · {escalationRef}` | SystemHealthBlock (TM) |
| DQ section heading | Fixed: `Data quality issues` | SystemHealthBlock (TM) |
| DQ empty | Fixed: `No data-quality issues in this window.` | SystemHealthBlock (TM) |
| Per-DQ id | `dq.id` | SystemHealthBlock (TM) |
| Per-DQ status chip | `dq.status` (`open` \| `mitigated` \| `closed`) | SystemHealthBlock (TM) |
| Per-DQ detected date | `dq.detectedDate` | SystemHealthBlock (TM) |
| Per-DQ description | `dq.description` | SystemHealthBlock (TM) |
| Per-DQ impact | `dq.impact` | SystemHealthBlock (TM) |
| Source line | `health.sourceLabel` | SystemHealthBlock (TM) |
| Path to Green (conditional) | When band amber/red; `entityRef={health.pathToGreenRef}` (`tm-system-health`) | SystemHealthBlock (TM) |

---

## 3. SARTimelinessBand

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Eyebrow | Fixed: `SAR timeliness · POCA s.330 window (30 days)` | SARTimelinessBand |
| Title | Fixed: `% of SARs filed within statutory window` | SARTimelinessBand |
| Band badge | `last.band.toUpperCase()` | SARTimelinessBand |
| Card band tone | `bandBg(last.band)` | SARTimelinessBand |
| Headline % | `last.pctOnTime.toFixed(1)` + `%` | SARTimelinessBand |
| Headline context | `of {last.filed} filings this week` | SARTimelinessBand |
| Collapsible — 13-week trend (summary) | Current `%` — collapsed by default when `density="compact"` | SARTimelinessBand / CollapsibleSection |
| Sparkline series | `series.map(p => p.pctOnTime)` (inside 13-week trend when compact) | SARTimelinessBand |
| Sparkline band | `last.band` | SARTimelinessBand |
| Filed (period) | Sum of `p.filed` across series (inside 13-week trend when compact) | SARTimelinessBand |
| Within window | Sum of `p.withinWindow` across series (inside 13-week trend when compact) | SARTimelinessBand |
| Submission channel | Fixed: `Submission: NCA SAR Online` (inside 13-week trend when compact) | SARTimelinessBand |
| Face source | `OPERATIONAL_WIDGET_SOURCES.sarTimeliness` | SARTimelinessBand |
| Drill cue | Fixed: `Drill into AML.01.07.01 (FCA Annual FC Report / FIU regime) →` | SARTimelinessBand |
| Path to Green (conditional) | When `last.band` red\|amber; `entityRef="sar-timeliness"` | SARTimelinessBand |

---

## 4. EDDPipelineStatus

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Eyebrow | Fixed: `EDD pipeline · MLR 2017 Reg 28 / Reg 35` | EDDPipelineStatus |
| Title | Fixed: `High-risk customer reviews` | EDDPipelineStatus |
| Status badge | `{pastDue} PAST DUE` | EDDPipelineStatus |
| Badge / card tone | `eddPastDueBand(pastDue, EDD_PAST_DUE_APPETITE)` | EDDPipelineStatus |
| Stat label — Past due | Fixed: `Past due` | EDDPipelineStatus |
| Stat value — Past due | `counts.past_due \|\| 0` | EDDPipelineStatus |
| Past-due appetite bar fill | `(pastDue / appetiteScale) * 100` | EDDPipelineStatus |
| Past-due appetite tick | `(appetite / appetiteScale) * 100` | EDDPipelineStatus |
| Past-due appetite caption | `appetite {EDD_PAST_DUE_APPETITE.appetite}` | EDDPipelineStatus |
| Past-due OVER/WITHIN | `OVER` if `pastDue > appetite` else `WITHIN` | EDDPipelineStatus |
| Stat label — In progress | Fixed: `In progress` | EDDPipelineStatus |
| Stat value — In progress | `counts.in_progress \|\| 0` | EDDPipelineStatus |
| Stat label — Awaiting MLRO | Fixed: `Awaiting MLRO` | EDDPipelineStatus |
| Stat value — Awaiting MLRO | `counts.awaiting_decision \|\| 0` | EDDPipelineStatus |
| Red-item list (all red-band; LR-002) | All `it.band === "red"` rows in a fixed-height scroll box (~4 lines visible); no silent truncate | EDDPipelineStatus |
| Collapsible — Red-band cases (summary) | `{redItems.length} red` — collapsed by default when `density="compact"` | EDDPipelineStatus / CollapsibleSection |
| Red-item notes | `it.notes` | EDDPipelineStatus |
| Red-item days open | `{it.daysOpen}d` | EDDPipelineStatus |
| Face source | `EDD_PAST_DUE_APPETITE.sourceLabel` | EDDPipelineStatus |
| Drill cue | Fixed: `Drill into AML.01.05.02 attestation (capacity is the why) →` | EDDPipelineStatus |
| Path to Green (conditional) | When band red\|amber; `entityRef="EDD Completed on Time"` | EDDPipelineStatus |

---

## 5. SanctionsScreeningPosture

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Eyebrow | Fixed: `Sanctions posture · OFSI / OFAC / UN / EU` | SanctionsScreeningPosture |
| Title | Fixed: `Screening & reporting` | SanctionsScreeningPosture |
| Posture badge | `postureBand.toUpperCase()` (`m.postureBand`) | SanctionsScreeningPosture |
| Card band tone | `bandBg(postureBand)` | SanctionsScreeningPosture |
| Face StatTile — Payments hold time | `hold.averageHoldHours` hrs + appetite bar vs `hold.appetiteHours` | SanctionsScreeningPosture |
| Face StatTile — OFSI reporting breaches | `(freeze.breachCount + ofsiBlock.breachCount)` vs appetite `0` | SanctionsScreeningPosture |
| Face StatTile — List update lag | Worst `u.lagHours` + appetite bar vs that list's `appetiteHours` | SanctionsScreeningPosture |
| Collapsible — Screening volumes (summary) | `p.screenedThisPeriod` — collapsed by default | SanctionsScreeningPosture / CollapsibleSection |
| Collapsible — OFSI freeze reports (summary) | On-time ratio `onTime/total` (or submitted/due) | SanctionsScreeningPosture / CollapsibleSection |
| Collapsible — OFSI block reports (summary) | `{due} due · {submitted} submitted` | SanctionsScreeningPosture / CollapsibleSection |
| Collapsible — US OFAC · separate jurisdiction (summary) | `{dueThisPeriod} due` — title kept exact | SanctionsScreeningPosture / CollapsibleSection |
| Collapsible — List update detail (summary) | `{worstLagHours}h` | SanctionsScreeningPosture / CollapsibleSection |
| Collapsible — Screening systems health (summary) | Combined txn+name outage count (last_3_months); blocks stay separate | SanctionsScreeningPosture / CollapsibleSection |
| Posture narrative | `m.postureNarrative` (inside Screening volumes when expanded) | SanctionsScreeningPosture |
| Hold — section label | Fixed: `Payments hold time` | SanctionsScreeningPosture |
| Hold — audience line | Fixed: `Sanctions · Consumer Duty` | SanctionsScreeningPosture |
| Hold — band badge | `hold.band.toUpperCase()` | SanctionsScreeningPosture |
| Hold — value | `hold.averageHoldHours` + `hours` | SanctionsScreeningPosture |
| Hold — subcounts | `{holdsThisPeriod} holds · {truePositives} TP · {blockedTransactions} blocked · {screenedThisPeriod} payments screened` | SanctionsScreeningPosture |
| Hold — appetite bar | value `averageHoldHours`, appetite `appetiteHours`, OVER/WITHIN | SanctionsScreeningPosture |
| Hold — source | `hold.sourceLabel` | SanctionsScreeningPosture |
| Payments screened label | Fixed: `Payments screened` | SanctionsScreeningPosture |
| Payments screened value | `p.screenedThisPeriod` | SanctionsScreeningPosture |
| Payments screened sub | `{holdsThisPeriod} holds · {truePositives} TP · {blockedTransactions} blocked` | SanctionsScreeningPosture |
| Customers screened label | Fixed: `Customers screened` | SanctionsScreeningPosture |
| Customers screened value | `c.screenedAtOnboarding` | SanctionsScreeningPosture |
| Customers screened sub | `{truePositives} TP · {falsePositives} FP · {screenedOnListUpdate} on list update` | SanctionsScreeningPosture |
| OFSI freeze — section label | Fixed: `OFSI freeze report timeliness` | SanctionsScreeningPosture |
| OFSI freeze — submitted line | `{submitted}/{dueThisPeriod} submitted · last {lastSubmitted}` | SanctionsScreeningPosture |
| OFSI freeze — breach badge | `{breachCount} BREACH` | SanctionsScreeningPosture |
| OFSI freeze — breach value | `freeze.breachCount` | SanctionsScreeningPosture |
| OFSI freeze — appetite caption | `breaches · appetite {freeze.appetite}` | SanctionsScreeningPosture |
| OFSI freeze — appetite bar | value breachCount, appetite 0 | SanctionsScreeningPosture |
| OFSI freeze — per-report id | `rep.id` | SanctionsScreeningPosture |
| OFSI freeze — per-report lateness | `{daysLate}d late` \| `on time` | SanctionsScreeningPosture |
| OFSI freeze — source | `freeze.sourceLabel` | SanctionsScreeningPosture |
| OFSI block — section label | Fixed: `OFSI block reports` | SanctionsScreeningPosture |
| OFSI block — submitted line | `UK reporting obligation · {submitted}/{dueThisPeriod} submitted · last {lastSubmitted}` | SanctionsScreeningPosture |
| OFSI block — breach badge | `{breachCount} BREACH` | SanctionsScreeningPosture |
| OFSI block — breach value | `ofsiBlock.breachCount` | SanctionsScreeningPosture |
| OFSI block — appetite caption | `breaches · appetite {ofsiBlock.appetite}` | SanctionsScreeningPosture |
| OFSI block — appetite bar | value / appetite | SanctionsScreeningPosture |
| OFSI block — source | `ofsiBlock.sourceLabel` | SanctionsScreeningPosture |
| OFAC US — jurisdiction label | `{ofacUs.jurisdictionLabel} blocking reports` | SanctionsScreeningPosture |
| OFAC US — due · breaches | `{dueThisPeriod} due · {breachCount} breaches` | SanctionsScreeningPosture |
| OFAC US — last submitted | `last {lastSubmitted}` | SanctionsScreeningPosture |
| OFAC US — source | `ofacUs.sourceLabel` | SanctionsScreeningPosture |
| List lag — section heading | Fixed: `List update lag · publication → bank ingestion` | SanctionsScreeningPosture |
| Per-list name | `u.listName` | SanctionsScreeningPosture |
| Per-list regulator · timestamps | `{regulator} · pub {publishedAt} → in {ingestedAt}` | SanctionsScreeningPosture |
| Per-list lag hours | `u.lagHours` + `h` | SanctionsScreeningPosture |
| Per-list band badge | `u.band.toUpperCase()` | SanctionsScreeningPosture |
| Per-list appetite bar | value `lagHours`, appetite `appetiteHours` | SanctionsScreeningPosture |
| Per-list source | `u.sourceLabel` | SanctionsScreeningPosture |
| Non-compliance waivers label | Fixed: `Non-compliance waivers:` | SanctionsScreeningPosture |
| Non-compliance waivers value | `{r.nonComplianceWaivers.open} open` | SanctionsScreeningPosture |
| Face source | `OPERATIONAL_WIDGET_SOURCES.sanctions` | SanctionsScreeningPosture |
| Path to Green (conditional) | When postureBand red\|amber; `entityRef="SCTN.01.01.01"` | SanctionsScreeningPosture |

### 5a. SystemHealthBlock — Transaction screening (nested)

Same field template as §2b, with `health = TXN_SCREENING_SYSTEM_HEALTH` (`systemName`, outages, DQ, `sourceLabel`, `pathToGreenRef` = `txn-screening-system-health`).

### 5b. SystemHealthBlock — Name screening (nested)

Same field template as §2b, with `health = NAME_SCREENING_SYSTEM_HEALTH` (`pathToGreenRef` = `name-screening-system-health`).

---

## 6. FinancialCrimeTrainingPosture

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Eyebrow | Fixed: `Financial crime training · CO-AML-12 / CO-FRD-01 / CO-ABC-03 / CO-PTE-03` | FinancialCrimeTrainingPosture |
| Title | Fixed: `Programme completion & overdue` | FinancialCrimeTrainingPosture |
| Narrative | Fixed prose + `{p.narrativeSource}` + `{p.highRisk.advancedTrainingBenchmarkPct}%` (inside Derivation & claims when compact) | FinancialCrimeTrainingPosture |
| Widget band badge | `fcTrainingWidgetBand(p).toUpperCase()` | FinancialCrimeTrainingPosture |
| Card band tone | `bandBg(band)` | FinancialCrimeTrainingPosture |
| Collapsible — Derivation & claims (summary) | `p.narrativeSource` — collapsed by default when `density="compact"` | FinancialCrimeTrainingPosture / CollapsibleSection |
| Stat label — Staff trained (firm-wide) | Fixed: `Staff trained (firm-wide)` | FinancialCrimeTrainingPosture |
| Stat value — trained % | `p.trainedPct` + `%` | FinancialCrimeTrainingPosture |
| Stat sub — trained counts | `{trainedCount} of {populationInScope} · target {programmeTargetPct}%` + optional `(configurable)` | FinancialCrimeTrainingPosture |
| Completion bar fill | `(trainedPct / 105) * 100` (inside Derivation & claims when compact) | FinancialCrimeTrainingPosture |
| Completion bar tick | `(programmeTargetPct / 105) * 100` (inside Derivation & claims when compact) | FinancialCrimeTrainingPosture |
| Completion target caption | `target {programmeTargetPct}%` (inside Derivation & claims when compact) | FinancialCrimeTrainingPosture |
| Completion WITHIN/UNDER | `WITHIN` if `trainedPct >= programmeTargetPct` else `UNDER` (inside Derivation & claims when compact) | FinancialCrimeTrainingPosture |
| Stat label — Overdue | Fixed: `Overdue` | FinancialCrimeTrainingPosture |
| Stat value — overdue % | `p.overduePct` + `%` | FinancialCrimeTrainingPosture |
| Stat sub — overdue | `{overdueCount} people · appetite {overdueAppetitePct}%` + optional `(configurable)` | FinancialCrimeTrainingPosture |
| Overdue band tone | `fcTrainingOverdueBand(...)` | FinancialCrimeTrainingPosture |
| Overdue appetite bar | value overduePct, appetite overdueAppetitePct | FinancialCrimeTrainingPosture |
| Stat label — High-risk roles overdue | Fixed: `High-risk roles overdue` | FinancialCrimeTrainingPosture |
| Stat value — high-risk overdue count | `p.highRisk.overdueCount` | FinancialCrimeTrainingPosture |
| Stat sub — high-risk split | `{highRisk.overduePct}% of {highRisk.population} high-risk · {otherRoles.overdueCount} other-role overdue` | FinancialCrimeTrainingPosture |
| High-risk band tone | `fcTrainingOverdueBand(highRisk.overduePct, ...)` | FinancialCrimeTrainingPosture |
| High-risk appetite bar | value highRisk.overduePct, appetite overdueAppetitePct | FinancialCrimeTrainingPosture |
| High-risk benchmark note | `Advanced training benchmark {advancedTrainingBenchmarkPct}% ({racmRef})` (inside Derivation & claims when compact) | FinancialCrimeTrainingPosture |
| Linked GSR refs | `Linked: {linkedGsrRefs.join(" · ")}` (inside Derivation & claims when compact) | FinancialCrimeTrainingPosture |
| Face source | `p.sourceLabel` | FinancialCrimeTrainingPosture |
| Path to Green (conditional) | When band red\|amber; `entityRef={p.pathToGreenRef}` (`AML.01.12.01`) | FinancialCrimeTrainingPosture |

---

## 7. FraudLossPanel

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Eyebrow | Fixed: `Fraud risk` | FraudLossPanel |
| Collapsed — Confirmed net loss (12mo) label | Fixed: `Confirmed net loss (12mo)` | FraudLossPanel |
| Collapsed — Confirmed net loss value | `formatGBP(posture.totalConfirmedNetLossGBP)` | FraudLossPanel |
| Collapsed — APP reimbursement (PSR) label | Fixed: `APP reimbursement (PSR)` | FraudLossPanel |
| Collapsed — APP reimbursement value | `formatGBP(posture.appReimbursementExposureGBP)` | FraudLossPanel |
| Collapsed — Types trending up w/w label | Fixed: `Types trending up w/w` | FraudLossPanel |
| Collapsed — Types trending up value | `{risingCount} of {posture.rows.length}` | FraudLossPanel |
| Face source | `posture.sourceLabel` | FraudLossPanel |
| Expand chevron | Fixed glyph `▾` (rotates when open) | FraudLossPanel |
| aria-expanded / aria-controls | `open` / `panelId` from `useId` | FraudLossPanel |
| Path to Green (conditional) | When status `AMBER` (`fraudStatusFromPosture`); `entityRef="fraud:app"` | FraudLossPanel |
| Expanded claim line text | `FRAUD · {total} confirmed net loss (12mo) · APP reimbursement exposure {app}` | FraudLossPanel |
| Expanded claim derivation | Fixed: `RULE` | FraudLossPanel |
| Expanded claim evidenceRef | Fixed: `FRAUD-TOTAL-NET-LOSS-12MO` | FraudLossPanel |
| Table header — Type | Fixed | FraudLossPanel |
| Table header — Confirmed net loss | Fixed | FraudLossPanel |
| Table header — Volume | Fixed | FraudLossPanel |
| Table header — Trend | Fixed | FraudLossPanel |
| Table header — APP apportionment | Fixed | FraudLossPanel |
| Per-row type label | `row.label` | FraudLossPanel |
| Per-row claim ref | `FRAUD-{ROW_ID}-ROW` | FraudLossPanel |
| Per-row RULE marker | Solid dot; title `RULE · matched deterministically` | FraudLossPanel |
| Per-row confirmed net loss | `formatGBP(row.confirmedNetLossGBP)` | FraudLossPanel |
| Per-row volume | `row.volume.toLocaleString()` | FraudLossPanel |
| Per-row trend | `TrendBadge`: `flat` \| `↗ +N% w/w` \| `↘ N% w/w` from `row.trendWoW` | FraudLossPanel |
| Per-row APP apportionment | `formatGBP(row.appApportionmentGBP)` or `—` | FraudLossPanel |
| Expanded footnote | Fixed: APP reimbursement mandatory under PSR since Oct 2024… | FraudLossPanel |
| Derived status (not printed as chip; drives PTG) | `AMBER` if majority of rows `trendWoW > 0` else `GREEN` | FraudLossPanel |

---

## PathToGreenStrip (mounted by widgets above)

When a strip is mounted for an `entityRef`, the following plan fields can render
(from `getPathToGreen(entityRef)` via `PathToGreenStrip`):

| Label (as rendered) | Value / source expression | Owner |
| --- | --- | --- |
| Strip title / entity | Plan `entityRef` / header copy in PathToGreenStrip | PathToGreenStrip |
| Current RAG | `path.currentRag` (`RED` / `AMBER`) | PathToGreenStrip |
| Progress % | `path.progressPct` (`{n}% to target`) | PathToGreenStrip |
| Progress track fill | `path.progressPct` toward GREEN target marker | PathToGreenStrip |
| Owner | `path.owner` | PathToGreenStrip |
| Start date | `path.startDate` | PathToGreenStrip |
| Target date | `path.targetDate` | PathToGreenStrip |
| Escalation | `ESCALATION_LABEL[path.escalation]` | PathToGreenStrip |
| Disposition | `path.disposition` (`remediate` \| `risk-accept`) | PathToGreenStrip |
| Combined expected effect | `path.combinedExpectedEffect` | PathToGreenStrip |
| Appetite line | `path.appetiteLine` | PathToGreenStrip |
| Per-action description | `action.description` | PathToGreenStrip |
| Per-action owner | `action.owner` | PathToGreenStrip |
| Per-action target date | `action.targetDate` | PathToGreenStrip |
| Per-action status | `ACTION_STATUS_LABEL[action.status]` | PathToGreenStrip |
| Per-action expected effect | `action.expectedEffect` | PathToGreenStrip |
| Risk-accept accepter | `path.riskAccept.acceptedBy` (null → gap UI) | PathToGreenStrip |
| Risk-accept date | `path.riskAccept.acceptedDate` | PathToGreenStrip |
| Risk-accept rationale | `path.riskAccept.rationale` | PathToGreenStrip |
| Risk-accept review date | `path.riskAccept.reviewDate` | PathToGreenStrip |
| Last update text | `path.lastUpdate.text` | PathToGreenStrip |
| Last update at | `path.lastUpdate.at` | PathToGreenStrip |
| Last update provenance badge | `path.lastUpdate.source` (`system` \| `email`) | PathToGreenStrip |

**Entity refs mounted from this dashboard:**
- `TM Alerts Closed in SLA` (AlertBacklogVsAppetite)
- `tm-system-health` (TM SystemHealthBlock)
- `sar-timeliness` (SARTimelinessBand)
- `EDD Completed on Time` (EDDPipelineStatus)
- `SCTN.01.01.01` (SanctionsScreeningPosture)
- `txn-screening-system-health` / `name-screening-system-health` (nested SystemHealthBlocks)
- `AML.01.12.01` (FinancialCrimeTrainingPosture)
- `fraud:app` (FraudLossPanel)

---

## End of inventory

Pass 8 must reconcile the live Operational Dashboard against every row above.
Do not drop nested CapacityVsDemandGauge, SystemHealthBlock, or PathToGreenStrip
fields when reconciling.
