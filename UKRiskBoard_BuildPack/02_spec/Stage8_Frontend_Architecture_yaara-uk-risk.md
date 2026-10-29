# Stage 8 Frontend Architecture -- yaara-uk-risk

- **Run:** Yaara Risk & Compliance -- UK Banking, UK Board Risk View (`cro-smf4-board`). Phase 3, stage 5 of 5.
- **Date:** 27 October 2026. **Status:** draft for confirmation; not locked.
- **Inputs read:** `PHASE3_BRIEF.md` (speed mode; existing build facts); `stage-8-frontend-arch.md`; `conventions.md` (sections 3, 5, 7, 10, 16); the product profile (component vocabulary; reference build pattern); the run configuration (`BUILD_TARGET`, `COMPONENT_VOCABULARY`); the methodology card anatomy; Stage 4; Stage 5 (sections 1, 2.4–2.6, 3, 4.4, 7, 9); Stage 6; Stage 7.
- **ID key:** as Stage 7. New here: CMP-n (components), RT-n (routes), ST-n (state slices), TK-n (tech constraints), DS8-n (decisions), S8-OD-n (open decisions).

> **Repo status.** The repo was **not** available in this session. Every file path, component name, prop, type and behaviour of existing code below comes from the brief or the product profile and is marked **`[unverified -- confirm against repo]`** (abbreviated **[UV]** after first use in each table). No existing file contents are assumed. Everything marked **NEW** is proposed by this stage and does not yet exist.

**Domain spine (each component states its segment):** Strategic Objective → RAS Statement → Level 1 Metric → Level 2/3 Indicators and Thresholds → Policy Obligation → Control → Evidence / Data Feed → Accountable Owner → Attestation → Escalation / Reportability Decision.

---

## 0. Gate summary

| Item | Decision |
|---|---|
| Variant | **`v8-board`** (NEW). The stage file implies no other name. Created alongside v6 (live) and v7 (prompt not yet run); neither is changed (DS8-1). Name clash risk with a future v8 is S8-OD-1 |
| Router | `frontend/components/UKBankingAudit/UKBankingControlTrace.tsx` routes by `variant` `[unverified -- confirm against repo]`. Pass 1 adds a `v8-board` branch that renders `BoardRiskApp` (CMP-40) |
| Guard rule | Every negation guard of the form `variant !== "v6"` (and any `!== "v7"`) must also exclude `"v8-board"`, or v8-board silently renders v6 blocks. Implemented as one helper `isBoardVariant(variant)` (TK-1) [UV] |
| Auth | `app/login/page.tsx` and `lib/auth-context.tsx` **not touched**. Persona entry follows the existing CRO (SMF4) → Board View mapping, re-pointed to `v8-board` [UV] |
| Component count | 8 primitives (CMP-1 to 8); 19 data components (CMP-9 to 27, plus the `HorizonLine` and `MappingGapChain` sub-bodies); 7 AI components (CMP-28 to 34); 5 v6 reuses, adapted by props only (CMP-35 to 39, one of them conditional); 1 app shell and 5 screens (CMP-40, CMP-41a to e) |
| Screens → routes | S1, S3, S4 (Layer 1); S2 + four scoped drill pages (Layer 2). All in-variant routing via a typed `ViewState`, drill addressed by item ID (section 2) |
| State | One in-memory store (React context + reducer) seeded from `lib/ukbankingaudit/` data files. **No browser storage** |
| Styling | None set here. Primitives are named for 9C (section 4) |

---

## 1. Component tree

### 1.1 File layout (all NEW unless marked; under `frontend/` [UV])

```
components/UKBankingAudit/
  UKBankingControlTrace.tsx            EXISTING router [UV] -- add v8-board branch + guard helper only
  v8board/                             NEW folder (name per S8-OD-2)
    BoardRiskApp.tsx                   CMP-40 shell + provider
    screens/  BoardRiskViewScreen.tsx  PrincipalRiskDrillScreen.tsx  RestrictionsReportabilityScreen.tsx
              EscalationHealthScreen.tsx  ScopedDrillScreen.tsx
    primitives/ ... (CMP-1..8)
    cards/      ... (CMP-9..27)
    ai/         ... (CMP-28..31)
    state/      boardStore.tsx  selectors.ts  types.ts  seed.ts
lib/ukbankingaudit/
  riskDomainsV4.ts                     EXISTING [UV] -- read only; not edited in pass 1
  precedentCorpus.ts                   EXISTING [UV] -- read only
  boardRiskV8/                         NEW data files (9A/9B fill them)
    firm.ts  cascade.ts  metrics.ts  evidence.ts  registers.ts  forums.ts  units.ts  drafts.ts  audit.ts
    widgetRegistry.ts                  NEW (V-11): widget → screen → source → viewer (section 1.7)
```

### 1.2 Primitives (structural only; styling at 9C)

| CMP | Name | Props (high level) | Used by | Feeding entity |
|---|---|---|---|---|
| CMP-1 | `BoardLayoutGrid` | `band?: ReactNode` (row 0 slot, full width, above all rows; V-1, V-4); `rows: {left, right?, rightStack?, full?}[]` (`rightStack` holds S1 Z2 above Z5, V-1); `stackOrder: ZoneId[]` (S1 phone order: band (Z3), Z1, Z2, Z5, Z4, Z6) | S1, S3, S4 | -- |
| CMP-2 | `CardShell` | `title` (business question), `stateSentence`, `badge?`, `status?`, `owner?`, `actions?`, `precedent?`, `illustrative: boolean`, `integrationDependent?: {feed: string; caveat: string}` (V-11: renders a star beside the title and the caveat "needs the society's [feed] access"), `onOpen(itemRef)` | All cards | E-49 Unit (title_question, status); `widgetRegistry.ts` (source) |
| CMP-3 | `SectionHeader` | `title`, `subtitle?`, `spineSegment` | S2 sections, drills | E-49.spine_path |
| CMP-4 | `BoardHeader` | `firmName`, `screens[]`, `activeScreen`, `viewer`, `periodLabel`, `comparisonMode`, `onComparisonChange`, `evidenceDate`, `nextForum`, `themeToggle` | S1, S3, S4 | E-01 Firm, E-47 ForumMeeting, ST-2 |
| CMP-5 | `StatusToken` | `status: within_appetite / amber / red / unverified / not_assessed`, `reason?`, `flags?` | Every status | E-49.status (section 4.4 precedence) |
| CMP-6 | `DeltaValue` | `value`, `denominator`, `unit`, `delta`, `comparisonLabel`, `newSinceLastBrc` | Every number | E-49 position/denominator/delta fields (HF-2) |
| CMP-7 | `PracticeLabel` | `kind: practice_not_rule / illustrative / unverified_clock / fictional` | Caps, N, triage target, roll-up, seeds | E-02 PracticeSetting.label; E-49.illustrative_flag |
| CMP-8 | `BackToOrigin` | `origin: ViewState`, `highlightRef` | Every drill | ST-2 navigation |

### 1.3 Data components (each maps to Stage 6 cards and a Stage 7 drill signature)

| CMP | Name | Renders (cards) | Props (high level) | Feeding Stage 5 entity / unit | Drill sig |
|---|---|---|---|---|---|
| CMP-9 | `IntegrityBadge` | Four-dot badge; T2-15, T2-16, T2-17 (inline), T2-18 states | `snapshot: IntegritySnapshot`, `expanded`, `onExpand`, `onOpenEvidence(unitId)`; glyph per pass/fail (not colour alone) | **E-50** IntegritySnapshot (owner/feed/attestation/mapping checks, overall, caveat_status) | DG-3 |
| CMP-10 | `HeadroomGauge` | T2-1 compact (S1) and full (S2-a) | `set`, `actual`, `projection?`, `range?`, `stress?`, `unit`, `gbp?`, `mode: compact / full`, `gradientId` (unique, TK-4). **V-7:** `mode: compact` renders actual against the amber and red bands only and ignores `projection` (the projection is a text line, "early warning, not a prediction"); `mode: full` renders the `projection` marker labelled "projection". The word "forecast" is not used in props, labels or copy | E-49 position fields; E-08 ThresholdSet; K-1, K-2, K-3 | DG-1 |
| CMP-11 | `StrategyStrip` + `ObjectiveTile` | Tiles O1–O4; T2-2 marker, T2-3 chip, T2-6 inline state, T2-8 line | `objectives: ObjectiveTileVM[]` (`objectiveId`, `objective` (noun phrase), `status`, `badge` (collapsed), `inlineState` (one line), `action` (one); `tooltip: {headroomGbp?, trajectory?, marker?}` (V-6: off the face, also shown in DG-1); no position or value field, because every S1 value has one owner zone (V-5); `statutoryLine?` for O3); `firmType` (T2-8 render gate) | E-03, E-06, E-49 (units for T2-1, -2, -3, -6, -8); E-01.firm_type | DG-1, DG-4 |
| CMP-12 | `HeadlineBlock` | S1-Z1 headline + integrity line ("10 of 12 verified") | `headlineUnitId`, `verifiedCount`, `headlineCount` | E-49 (T2-1); K-16 summary over E-50 | DG-1 |
| CMP-13 | `CapacityCard` | T2-5 | `unit`, `series: {members, handlers}` (K-13), `slaCleared` (K-14), `queueAge` (K-15), `campaignDate`, `options: ['restore_capacity','pace_growth']` | E-49 (T2-5); E-17 capacity series; E-04 PlanInitiative; E-35 (empty search) | DG-2 |
| CMP-14 | `DualSeriesChart` | DG-2 body; T2-36 backlog vs committed (DG-10) | `seriesA`, `seriesB`, `markers[]`, `gradientId` | E-17 MetricObservation series | DG-2, DG-10 |
| CMP-15 | `RasScorecard` + `ScorecardRow` | T2-12 (12 rows ranked), T2-4 marker, promotion lane | `rows: ScorecardRowVM[]` (each with `unitId`, status, value+denominator, badge, markers, `shownAbove?: ZoneId` (V-5: when set, the row renders status + badge + "shown above" anchor and no value)), `visibleRows: 4` (V-8: boxed, internal scroll; the first 4 rows are the urgent set), `summaryLine` ("8 of 12 within appetite · 12 of 34 Level 1 metrics", practice; fixed beneath the box), `promotion?` (beneath the box), `capLabel` ("12 of 34", practice) | E-07 Metric (headline_flag), E-49, E-50; K-5, K-8, K-9 | DG-5 |
| CMP-16 | `DefensibilityCard` | T2-14 with T2-17 inline | `unit`, `snapshot`, `runs[]`, `cohorts[]`, `precedentId` | E-49 (T2-14, T2-17); E-18, E-19, E-21; E-45 | DG-3 |
| CMP-17 | `LineageChain` | S2-b lineage; DG-3 | `path: SpineRef[]`, `runs: ReconciliationRun[3]`, `cohorts`, `attestations[]`, `ruledOut: string[]`, `underlyingRag` | E-49.spine_path; E-13, E-18, E-19, E-21 | DG-3 |
| CMP-18 | `ThresholdCascade` | S2-a; T2-20 hook | `thresholdSet`, `rationale`, `calibrationVersion`, `flags` | E-08 ThresholdSet | DG-1 |
| CMP-19 | `ContributorList` | S2 contributors (DG-5); leading-indicator tree (S2-c, T2-21) | `parentMetricId`, `children: {metricId, status, value, denominator}[]`, `rollupRule`, `focusedChildId`, `onFocus(childId)` | E-07 (L2/3), E-09 `rollup`, E-10 MetricPair | DG-5 |
| CMP-20 | `TensionPairTable` | T2-6 (S2-e), T2-7 waiver | `pair: GuardrailPair`, `partnerValues`, `floorRows[]` (render as breach), `keying: KeyingBlock`, `waiver?` | **E-34** GuardrailPair; E-35, E-36; D1 keying block | DG-4 |
| CMP-21 | `PopulationTestCard` + `PopulationFunnel` | T2-27 (S3-Z1) and DG-6 drill | `clauseId`, `inScope`, `tested`, `breachesAccounts`, `breachesCustomers`, `byRoute[]`, `untested[]`, `monthsSinceZero`, `flagContrast` (label required) | **E-28** RestrictionClause, **E-29** PopulationTestRun; K-19, K-20, K-21 | DG-6 |
| CMP-22 | `ClauseEvidenceList` | T2-28 (S3-Z2) and DG-7 | `restrictionId`, `period`, `clauses: {clauseId, verdict: supported/partly/not_supported, runsPresent, monthsInPeriod}[]`, `dueDate` | E-27, E-28, E-29, E-21 (prior), E-22 (s166 milestones); C-20 | DG-7 |
| CMP-23 | `ReportabilityLedger` + `LedgerEventGroupHeader` + `RouteRow` | T2-29 (S3-Z3); T2-30 slot | `events: ReportableEvent[]`, `routesByEvent`, `viewer` (scope check), `onOpenRoute(routeId)`, `visibleRows: 4` (V-9: boxed region, internal scroll). Route rows render on the face under a **non-clickable** event group header (which carries "1 of 4 routes decided" for event 2); one click on a `RouteRow` opens RT-6 | **E-37, E-38, E-39, E-40**; K-22 to K-25 | DG-8 |
| CMP-24 | `RouteCasePanel` | DG-8 body | `routeId`, `case: ArtefactVersion`, `rule: RuleLibraryEntry` (verification_status), `elapsed`, `triageTarget`, `options[]` (no default), `decisionHistory: RouteDecision[]`, `canRecord: boolean` (SMF16 only) | E-38, E-39, E-40, E-54 | DG-8 |
| CMP-25 | `AwarenessGapBlock` | T2-30 | `eventId`, `signals: {date, kind, plainLabel}[]`, `loggedAwareness`, `gapDays` | E-37.linked_record_refs; C-22; K-25. **Unmounted** unless `viewer ∈ {cro, deciding_smf}` (O-9, HF-9) | DG-8 |
| CMP-26 | `ExceptionFeed` + `OverrideLog` + `ManifestDiff` | T2-34/T2-35 (S4-Z1, Z2); DG-9 | `manifestVersions: PackManifest[]`, `items: PackItem[]`, `overrides: PackOverride[]`, `routingRules`, `qualifiedCount`, `includedCount` | **E-41, E-42, E-43, E-48**; K-29, K-30 | DG-9 |
| CMP-27 | `GovernanceKriTile` | T2-36, T2-37, T2-38 (S4-Z3); `variant: backlog / latency / effectiveness` selects the DG-10 body | `unitId`, `variant`, `headline`, `kpi` (with n), `minN`, `series?`, `pairs?` | E-49; E-22, E-23, E-17; K-26 to K-28, K-31; C-28 to C-30 | DG-10 |
| -- | `HorizonLine` (inside CMP-11 family file) | T2-13 (S1-Z6); T2-31, T2-26 counts | `emergingRisks[]`, `unmappedInHorizon`, `counts` | E-33, E-09 `emerging_metric`; K-34 | DG-11 |
| -- | `MappingGapChain` (inside CMP-17 file) | DG-11 body | `path: SpineRef[]` with `missing: true` links | E-09 CascadeLink; C-11 | DG-11 |

### 1.4 Intelligence / AI components (every one carries the AI marker)

The LiSN-family intelligence set (Executive Pulse, AI Risk Spike Monitor, Floating AI Day Generator) is **not** used: wide AI bars and live rails are removed for this persona (R-5, R-10, DS7-4).

| CMP | Name | Props | Feeding entity | Rules |
|---|---|---|---|---|
| CMP-28 | `AiExecutiveBand` | `screen: 'board' / 'restrictions' / 'escalation'`; `sections: {critical, dueBeforeBrc, holdingSteady}` (each `{text, counts, linkTo: ViewState}`; labels "What's critical / What's due before the BRC / What's holding steady", V-2), `aiLine`, `sourceNote` | Aggregates over E-49 + E-50 + E-42 (S1, S4); E-28, E-29 (S3). No E-38 route data (V-3) | Row 0 on S1, S3 and S4 (V-1, V-4); thin, one line high (CL-004); links are peer nav or in-screen zone links, not drills; adds no figures; **never** carries reportability counts or route decisions (V-3) |
| CMP-29 | `AiMarker` | `reason: string` (one line, required) | E-51.reason_one_line | On every AI element; none on statuses or KPIs (Stage 5 section 8.4) |
| CMP-30 | `DraftActionCard` | `draft: DraftAction`, `gate?: HumanGateDecision`, `onAccept`, `onEditAccept(text)`, `onReject(reasonCode)`, `canGate: boolean`, `optionsLocked` | **E-51**, **E-52**, E-54 | Verbs from enum only (`prepare / propose / draft / send_to_owner`); no file/notify/submit control exists in the component (HF-8) |
| CMP-31 | `AuditTrailInline` | `objectRef`, `entries: AuditLogEntry[]`, `collapsed` | **E-53** | Plain-language rows; IDs and hashes in tooltip only (DS7-2) |
| CMP-32 | `SendToOwnerConfirm` | `targetRole`, `auditRef`, `deepLink?: 'crsa_cockpit' / 'mlro_workspace'` | E-51.target_role; O-7 | Deep links only for SMF16/SMF17 (OD-7) |
| CMP-33 | `CanTellCannotTell` | `canTell`, `cannotTell`, `tier3HookIds[]` → renders "Extension: committee minutes (next module)" teaser | E-49 can_tell / cannot_tell | Teaser only; never a working card (R-12) |
| CMP-34 | `ProcessGapBlock` | `gapType`, `receivingOwnerRole`, `draft: DraftAction` | E-49 + E-51 (PG-1 to PG-7) | Stage 7 section 3 |

### 1.5 v6 reuse (adapted by props only; v6 behaviour unchanged)

| CMP | v6 component [UV] | Use in v8-board | Required adaptation (prop-level; confirm the prop exists) | Feeding entity |
|---|---|---|---|---|
| CMP-35 | `DomainDrillPanel` | Host shell for S2 (one page per principal risk), sections a–i in spine order | **Lens toggle not rendered.** Preferred: an existing prop to hide the toggle. If none exists, add an optional prop (for example `hideLensToggle?: boolean`, default `false`) so v6 is unaffected; or wrap and render only its body. Do not fork. Choice is S8-OD-3 | E-05 PrincipalRisk; domain key from `riskDomainsV4.ts` + board-layer "capital" key (S5-OD-1) |
| CMP-36 | `precedentCorpus` (data, `lib/ukbankingaudit/precedentCorpus.ts`) + its panel | Precedent line on cards (CMP-2 `precedent`) and S2 section g | Read by ID; posture tag always shown. No edits to the corpus | **E-45** Precedent |
| CMP-37 | `ScreeningDenominator` (dormant) | T2-15 drill in S2-b | Wire for the first time; feed it the T2-15 unit. Confirm its props accept list-entry and rule-record counts (TC-8 labels) | E-49 (T2-15); E-12; C-8 |
| CMP-38 | `OperationalAssuranceVerdict` (dormant) | T2-23 drill in S2-b | Wire for the first time; feed control rating vs latest test | E-12, E-20; C-41 |
| CMP-39 | `SuppressionLedger` (dormant) | **Candidate** host for the T2-35 override log inside CMP-26 | Face label must read "Override log"; the word "suppressed" must not render (X-4). If the component hard-codes that label, do not reuse it; build `OverrideLog` instead (S8-OD-4) | E-43 PackOverride |
| -- | `DispositionDispersion`, `CadenceFeasibility` (dormant) | **Not used** (X-7) | -- | -- |
| -- | CRSA Cycle Cockpit; MLRO Workspace | Deep-link targets only (CMP-32) | Link to the existing route/variant; no change | -- |

### 1.6 Screen components

| CMP | Screen | Composes | Spine |
|---|---|---|---|
| CMP-40 | `BoardRiskApp` (shell) | `BoardStoreProvider`, CMP-4, viewer switch, theme toggle, `ViewRouter` (section 2), presenter "Reset demo data" | Whole spine |
| CMP-41a | `BoardRiskViewScreen` (S1) | CMP-1; row 0 band: Z3 CMP-28; row 1: Z1 CMP-12 + CMP-10 (compact) + CMP-11 \| right stack Z2 CMP-13 above Z5 CMP-16; row 2: Z4 CMP-15 (boxed); row 3: Z6 `HorizonLine`; CMP-9 on every unit (V-1) | Objective → RAS → L1 → feed → owner → attestation |
| CMP-41b | `PrincipalRiskDrillScreen` (S2) | CMP-35 host; a CMP-10 full + CMP-18 + CMP-19; b CMP-17 + CMP-37 + CMP-38; c CMP-19 (indicator mode); d owners block; e CMP-20; f domain blocks + Fraud filter (fin crime only); g CMP-36; h CMP-33; i CMP-30 + CMP-31 | Full spine |
| CMP-41c | `RestrictionsReportabilityScreen` (S3) | Row 0 band Z0 CMP-28 (V-4); Z1 CMP-21; Z2 CMP-22; Z3 CMP-23 boxed (+ CMP-25 scoped) | Obligation → control → evidence → attestation → reportability |
| CMP-41d | `EscalationHealthScreen` (S4) | Row 0 band Z0 CMP-28 (V-4); Z1 headline (CMP-2 over T2-34 + T2-35); Z2 CMP-26; Z3 3× CMP-27; footer counts | L2 → escalation |
| CMP-41e | `ScopedDrillScreen` | One component, four bodies by `kind`: `clause` (DG-6/DG-7), `route` (DG-8, CMP-24), `manifest` (DG-9, CMP-26 diff), `kri` (DG-10, CMP-27 body); always with CMP-3, CMP-8, CMP-30, CMP-31, CMP-33 | Per kind |

**Card coverage check:** every Stage 6 card maps to a named component: T2-1 (CMP-10/11/12), T2-2/3/6/8 (CMP-11), T2-4/12 (CMP-15), T2-5 (CMP-13), T2-13/26/31 (`HorizonLine`), T2-14/17 (CMP-16, CMP-9), T2-15 (CMP-9, CMP-37), T2-16/18 (CMP-9), T2-27 (CMP-21), T2-28 (CMP-22), T2-29 (CMP-23/24), T2-30 (CMP-25), T2-34/35 (CMP-26), T2-36/37/38 (CMP-27); drill cards T2-7 (CMP-20), T2-20 (CMP-18), T2-21 (CMP-19), T2-23 (CMP-38), T2-32/33 (CMP-17, CMP-36), T2-9/10/11/24/42/22/39/40 (S2-f domain blocks and CMP-27 drill, rendered with CMP-2 + CMP-6).

**Label fixes (V-10):** CMP-9 attestation dot failure label for T2-17 is "Attestation precedes a completed run" (never "Attested without evidence"); CMP-27 `variant: effectiveness` tile title is "Which closed actions have not moved their metric?"; CMP-28 has no "Cannot defend" section.

### 1.7 Widget registry (NEW, V-11)

File: `lib/ukbankingaudit/boardRiskV8/widgetRegistry.ts` [UV path]. One entry per rendered widget; `CardShell` reads `integrationDependent` from it, and Stage 11 checks every mounted widget has an entry (CL-014, CL-021).

```ts
type WidgetSource = 'd1_register' | 'bank_feed' | 'derived';
interface WidgetRegistryEntry {
  widgetId: string;                       // e.g. 's1.z2.capacity'
  component: string;                      // CMP name
  screen: 'S1' | 'S2' | 'S3' | 'S4' | 'drill';
  zone: string;                           // 'Z0'..'Z6' or drill kind
  cardIds: string[];                      // T2-n (never rendered on a face)
  source: WidgetSource;
  integrationDependent?: { feed: string; caveat: string }; // set when source = 'bank_feed'
  viewers: Viewer[];                      // who may see it (T2-30: ['cro', 'smf16'])
}
```

| Widget | Screen / zone | Source | `integrationDependent.feed` | Viewers |
|---|---|---|---|---|
| `AiExecutiveBand` | S1-Z3, S3-Z0, S4-Z0 | derived | -- | all |
| `HeadlineBlock` + `HeadroomGauge` (T2-1) | S1-Z1 | d1_register + metric series | -- | all |
| `StrategyStrip` (O1–O4) | S1-Z1 | d1_register | -- | all |
| `CapacityCard` (T2-5) | S1-Z2 | bank_feed | "HR capacity and alert queue" | all |
| `DefensibilityCard` (T2-14) | S1-Z5 | bank_feed | "transaction monitoring reconciliation" | all |
| `RasScorecard` rows on bank feeds (rows 2, 3, 4 and any other bank-fed row) | S1-Z4 | bank_feed (per row) | per row, e.g. "sanctions screening reconciliation" (T2-15) | all |
| `RasScorecard` other rows | S1-Z4 | d1_register | -- | all |
| `HorizonLine` (T2-13) | S1-Z6 | d1_register | -- | all |
| `PopulationTestCard` (T2-27) | S3-Z1 | bank_feed | "account-opening population" | all |
| `ClauseEvidenceList` (T2-28) | S3-Z2 | d1_register | -- | all |
| `ReportabilityLedger` (T2-29) | S3-Z3 | d1_register | -- | all (SAR status only above SMF17) |
| `AwarenessGapBlock` (T2-30) | S3-Z3 | d1_register | -- | cro, smf16 (deciding SMF) |
| `ExceptionFeed` + `OverrideLog` (T2-34, T2-35) | S4-Z1, Z2 | d1_register | -- | all |
| `GovernanceKriTile` ×3 (T2-36 to T2-38) | S4-Z3 | d1_register | -- | all |

Exact feed names are 9A's to confirm; the bank-fed set is fixed by 9C V-11.

---

## 2. Route table

### 2.1 Variant entry (existing router) [UV]

| Step | Behaviour |
|---|---|
| Persona CRO (SMF4) → Board View | Resolves `variant = "v8-board"` (where the existing mapping sets the variant; location unverified) |
| `UKBankingControlTrace.tsx` | `if (variant === "v8-board") return <BoardRiskApp …/>` placed **before** any v6/v7 branch. All negation guards rewritten as `!isLegacyV6(variant)`-style helpers that exclude `"v8-board"` (TK-1) |
| BRC chair (SMF10) | OD-3: a fourth persona entry. Pending user confirmation, implemented **inside** v8-board as a viewer switch ("Viewing as BRC chair (preview)"), not as a new auth persona (DS8-3) |
| `app/select_region/page.tsx` | No auth gate [UV]; v8-board must not rely on it for scoping. Visibility scope is enforced in the store selectors (O-9) |

### 2.2 In-variant routes

The variant routes with a typed `ViewState` held in the store (DS8-4). Optional URL sync via a `view` query parameter is S8-OD-5; the ID-addressing rule holds either way.

| RT | Screen | `ViewState` | Layer | Entered from |
|---|---|---|---|---|
| RT-1 **(default for CRO)** | S1 Board Risk View | `{screen: 'board'}` | 1 | Variant load; header nav; Back |
| RT-2 | S2 Principal-risk drill | `{screen: 'risk', principalRiskId, focusUnitId}` | 2 | Any S1 tile, row, card, badge "Open evidence" |
| RT-3 | S3 Restrictions and reportability | `{screen: 'restrictions'}` | 1 | Header nav; S1 band (row 0) "What's critical"; S1 scorecard row 1 |
| RT-4 | S4 Escalation health | `{screen: 'escalation'}` (sets viewer to `brc_chair_preview` when entered by the CRO) | 1 | Header nav; S1 band (row 0) "What's due before the BRC" |
| RT-5 | Clause evidence (DG-6 / DG-7) | `{screen: 'drill', kind: 'clause', clauseId, restrictionId}` | 2 | S3-Z1, S3-Z2 |
| RT-6 | Reportability case (DG-8) | `{screen: 'drill', kind: 'route', eventId, routeId}` | 2 | S3-Z3 route row |
| RT-7 | Pack manifest (DG-9) | `{screen: 'drill', kind: 'manifest', manifestId, itemId}` | 2 | S4-Z1, S4-Z2 |
| RT-8 | KRI drill (DG-10) | `{screen: 'drill', kind: 'kri', unitId}` | 2 | S4-Z3 tiles |
| -- | Deep links | CRSA Cockpit (SMF16), MLRO Workspace (SMF17) via the existing variant routing [UV] | -- | CMP-32 |

Every `ViewState` also carries `origin: {screen, highlightRef, scrollKey}` for CMP-8.

### 2.3 Drill addressing rule (the "all cells → one drill" bug)

- Every clickable item passes **its own** ID from its view-model (`row.unitId`, `route.routeId`, `clause.clauseId`, `item.itemId`). No drill target is a module-level constant or a default ID.
- Resolution: `selectUnit(state, id)` returns the unit or `undefined`; `undefined` renders "Evidence not available for this period" (never a different item's drill).
- 9C / Stage 11 test: click every scorecard row, every route row and every feed item; each drill headline must match the clicked item's state sentence.

### 2.4 Viewer switch and reset rule

| On viewer switch (CRO ↔ BRC chair preview; SMF16 if S7-OD-1 b) | Action |
|---|---|
| Reset | `view` → that viewer's default (CRO → RT-1; chair → RT-4); expanded badges; scroll; comparison mode → default; Fraud filter off; open edit buffers discarded |
| Keep | `session` slice: gates, draft statuses, artefact versions, audit entries (DS7-6) |
| Re-evaluate | All `visibility_scope` selectors. CMP-25 (T2-30) is **unmounted** for the chair; SAR routes reduce to status |
| Implementation | Viewer is part of the React `key` on the screen subtree (`key={viewer}`), so effects and local state remount cleanly (TK-6) |
| Firm-type switch (presenter) | Re-derives units from seed for the new `firm_type`; T2-8 units removed; returns to RT-1 |

---

## 3. State and data shape

### 3.1 Store layout (in memory only)

`BoardStoreProvider` (React context + `useReducer`) holds one tree. **No `localStorage`, `sessionStorage`, IndexedDB or cookies** for any state; a reload returns to seed (TK-7).

| ST | Slice | Contents | Source | Mutable in session? |
|---|---|---|---|---|
| ST-1 | `config` | `firm` (E-01, incl. `firm_type`, `min_cohort_size`, `dual_regulated`), `practiceSettings` (E-02, with `practice_not_rule`), `demoToday` (27 October 2026), `comparisonDefaults` (O-13) | `boardRiskV8/firm.ts` | Presenter only (firm type) |
| ST-2 | `ui` | `viewer`, `view: ViewState`, `comparisonMode: 'qoq' / 'vs_last_erc'`, `expandedBadges`, `fraudFilter`, `theme` | Defaults | Yes (reset on viewer switch) |
| ST-3 | `cascade` | E-03 objectives, E-04 plan initiatives, E-05 principal risks, E-06 RAS, E-07 metrics, E-08 threshold sets, E-09 links, E-10 pairs, E-11 obligations, E-12 controls, E-13 feeds, E-14 persons `[fictional]`, E-15 ownership, E-16 MRM | `cascade.ts`, domain keys read from `riskDomainsV4.ts` [UV] | No (S-side read-only; P-side keyed outside the demo) |
| ST-4 | `evidence` | E-17 observations (series), E-18 runs, E-19 cohort results, E-20 tests, E-21 attestations, E-22 issues, E-23 findings, E-24 incidents, E-27/28/29 restriction, clauses, test runs (counts only; `breach_record_refs` absent from the board store), E-33 emerging risks | `metrics.ts`, `evidence.ts` | No |
| ST-5 | `registers` (D1) | E-34 pairs, E-35 decisions, E-36 waiver conditions, E-37 events, E-38 routes, E-39 route decisions (append-only array), E-40 rule library, E-41 manifests (versioned), E-42 items, E-43 overrides, E-44 read-across, **E-45 precedents (from `precedentCorpus.ts` [UV], by ID)**; every entry carries the keying block | `registers.ts`, `precedentCorpus.ts` | Append-only (decisions, manifest versions) |
| ST-6 | `forums` | E-46 forums, E-47 meetings (last ERC 14 October 2026; next BRC mid-December 2026 `[illustrative]`), E-48 routing rules | `forums.ts` | No |
| ST-7 | **`units`** (seeded) | `byId: Record<UnitId, Unit>` (E-49) with `card_id`, `spine_path`, status, position/denominator, trajectory, can/cannot tell, `visibility_scope`, `illustrative_flag`; `byCard: Record<CardId, UnitId[]>`; `snapshots: Record<UnitId, IntegritySnapshot>` (E-50) | `units.ts` (9A/9B) | Status no; `caveat_status` yes (via gate) |
| ST-8 | **`comparison`** | Per unit: `comparisonAsOf`, `priorValue`, `delta`, `newSinceLastBrc`, `vsLastErc` (values for the switch); per run-based unit: previous run ref | `units.ts` | No |
| ST-9 | **`evidencePacks`** | `byUnitId: Record<UnitId, EvidencePack>`: the DG-specific payload (section 3.3) so each drill resolves from the unit's own ID | `units.ts` / `evidence.ts` | No |
| ST-10 | `session` | `drafts: Record<DraftId, DraftAction>` (E-51, seeded), `gates: HumanGateDecision[]` (E-52), `artefacts: Record<ArtefactId, ArtefactVersion[]>` (E-54), `audit: AuditLogEntry[]` (E-53, append-only; seeded with prior entries) | `drafts.ts`, `audit.ts` | Yes: reducer actions only |

### 3.2 Reducer actions (the only writes)

| Action | Effect | Guard |
|---|---|---|
| `GATE_ACCEPT {draftId, actor}` | Draft status → `accepted`; push E-52; push E-53; side effects by `draft_type` (caveat → `snapshot.caveat_status = accepted`, status unchanged; decision paper → E-35 `status = proposed`; ledger draft → E-37 entry `case_prepared`) | `actor` must be a named Person whose role holds this gate (Stage 7 HG table) |
| `GATE_EDIT_ACCEPT {draftId, actor, text}` | New E-54 version with `parent_artifact_id`; then as accept | Same |
| `GATE_REJECT {draftId, actor, reasonCode}` | Status → `rejected`; E-52; E-53 | `reasonCode` required |
| `SEND_TO_OWNER {draftId, actor}` | Status → `sent_to_owner`; E-53 | Draft must be accepted first |
| `RECORD_ROUTE_DECISION {routeId, smfActor, decision, rationale, dissent?}` | Append E-39 row (supersedes chain); E-53 | **Only when `viewer === 'smf16'`** (S7-OD-1 b); no action creator exists in CRO or chair UI |
| `MANIFEST_NEW_VERSION {manifestId, change, actor}` | Append E-41 version (draft) | Removal requires approver + reason code |
| `SET_VIEW`, `SET_VIEWER`, `SET_COMPARISON`, `TOGGLE_BADGE`, `SET_FRAUD_FILTER`, `SET_FIRM_TYPE` | UI only | `SET_VIEWER` triggers the reset in 2.4 |
| `RESET_DEMO` | Re-seed ST-7 to ST-10 from data files | Presenter control |

There is deliberately **no** action for: changing a threshold, a status, a metric value, an awareness date, or anything named file / notify / submit (HF-4, HF-8, ER-10).

### 3.3 Key types (abbreviated; full field lists are Stage 5 sections 2.4–2.6)

```ts
type Status = 'within_appetite' | 'amber' | 'red' | 'unverified' | 'not_assessed';
type Viewer = 'cro' | 'brc_chair_preview' | 'smf16';            // smf16 only if S7-OD-1 (b)
type ActionVerb = 'prepare' | 'propose' | 'draft' | 'send_to_owner'; // closed enum (HF-8)
type VisibilityScope = 'all_board' | 'cro_and_deciding_smf' | 'smf17_restricted' | 'owning_smf_private';

interface SpineRef { objectType: string; objectId: string; plainLabel: string; missing?: boolean }

interface Unit {                    // E-49
  unitId: string; cardId: string;   // cardId (T2-n) never rendered on a face (X-5)
  unitType: 'position' | 'breach' | 'chain_break' | 'tension_collision' | 'reportability_case';
  titleQuestion: string; stateSentence: string;
  spinePath: SpineRef[]; spineUpperUnresolved: boolean;
  status: Status; underlyingRag?: 'within_appetite' | 'amber' | 'red'; // drill only
  position?: { value: number; appetite?: number; headroom?: number; unit: string; gbp?: number;
               denominatorValue: number; denominatorLabel: string };   // required for any position (ER-11)
  trajectory?: { windowPoints: number; projectedCrossing?: string; label: 'early warning, not a prediction' };
  ownerRole: string; ownerPersonId?: string; routedExecRoles: string[];
  suppressible: boolean; canTell?: string; cannotTell?: string; tier3HookIds: string[];
  precedentId?: string; visibilityScope: VisibilityScope; illustrative: true;
  draftIds: string[];
}

type EvidencePack =                 // ST-9, discriminated by drill signature
  | { sig: 'DG-1'; thresholdSetId: string; planVersions: string[]; constraintLadder: {name: string; projectedBind: string}[] }
  | { sig: 'DG-2'; seriesIds: [string, string]; queueAgeSeriesId: string; campaignDate: string; decisionSearch: [] }
  | { sig: 'DG-3'; feedId: string; runIds: string[]; cohortResultIds: string[]; attestationIds: string[]; ruledOut: string[]; readAcrossIds: string[] }
  | { sig: 'DG-4'; pairId: string; floorRowBoundIds: string[]; waiverDecisionId?: string }
  | { sig: 'DG-5'; parentMetricId: string; childMetricIds: string[]; rollupRule: 'worst_of' }
  | { sig: 'DG-6'; clauseId: string; testRunId: string; byRoute: {route: string; accounts: number}[]; untested: {route: string; count: number}[]; flagContrast: string }
  | { sig: 'DG-7'; restrictionId: string; period: string; clauseVerdicts: {clauseId: string; verdict: 'supported'|'partly'|'not_supported'}[] }
  | { sig: 'DG-8'; eventId: string; routeIds: string[]; earliestSignals?: {date: string; plainLabel: string}[] }
  | { sig: 'DG-9'; manifestId: string; versionIds: string[]; itemId: string; routingRuleId: string; overrideId?: string }
  | { sig: 'DG-10'; kriVariant: 'backlog' | 'latency' | 'effectiveness'; seriesIds: string[]; n?: number }
  | { sig: 'DG-11'; path: SpineRef[] };
```

Selectors (`selectors.ts`): `selectUnit`, `selectUnitsForCard`, `selectSnapshot`, `selectVisible(viewer)` (applies `visibility_scope`; drops T2-30 for the chair), `selectHeadlineSet` (cap from ST-1, labelled practice), `selectVerifiedCount`, `selectRoutesDecided(eventId)` (K-23), `selectDraftsForUnit`, `selectAuditFor(objectRef)`. Statuses are **read** from seeded units (computed upstream by 9A/9B per Stage 5 section 4.4), never recomputed in components (DS8-6).

---

## 4. Shared primitives vs governed styling

| Primitive (named for 9C) | Structural role only | Governed at 9C (not set here) |
|---|---|---|
| `BoardLayoutGrid` (CMP-1) | Two-thirds / one-third rows; full-width rows; phone stack order | Breakpoints, gutters (16px side gutter at phone width per platform rule), spacing scale |
| `CardShell` (CMP-2) | Slot order from the card anatomy: title (with the V-11 integration star when `integrationDependent` is set) → state → position/headroom → honesty line (badge + as-of; V-11 access caveat beside it) → owner → action → precedent | Radius, elevation, padding, density |
| `SectionHeader` (CMP-3) | Title + spine segment caption | Type scale |
| `StatusToken` (CMP-5) | Distinct token per status incl. **Unverified** with its own glyph and word; never a RAG fill | Colours, glyph set (OD-1 governance gap) |
| `IntegrityBadge` dots (CMP-9) | Four dots, fixed order, text label + accessible name, pass/fail by glyph | Colours, size, focus ring |
| `AiMarker` (CMP-29) | Sparkle + "AI draft" text | Icon, accent (purple #bc6cd3 is a candidate only if the brand dark theme is chosen; lime kept off status) |
| `DeltaValue` (CMP-6), `PracticeLabel` (CMP-7) | Adjacency of value, denominator, delta, label | Typography, colour of deltas |
| Theme | Light-first with dark toggle; tokens via the existing theme mechanism [UV] | **OD-1 open**: conservative low-chroma default vs brand dark (#1c1c1c / #2a2a2a / #3a3a3a–#4a4a4a / #bc6cd3 / #dcfc84 / white) |

---

## 5. Reference-component match

| Item | Instruction |
|---|---|
| Reference | **Match the existing UK Banking Audit v6 variant's structure exactly** (`components/UKBankingAudit/`, routed by `UKBankingControlTrace.tsx`) [UV]: same app shell, same variant-routing pattern, same data-file location (`lib/ukbankingaudit/`), same component conventions. Stage 10 turns this into "study v6 and match its pattern" for Cursor |
| Not the reference | `HeadOfCreditCardsDashboard` (LiSN family). Its Executive Pulse, AI Risk Spike Monitor and Floating AI Day Generator are **not** imported (R-5, R-10). Only the light/dark toggle convention carries over |
| Deliberate departures from v6 | No lens toggle (X-1, DS-5); no nine-domain grid (X-2); Fraud as a filter (X-3); "Override log" label (X-4) |

---

## 6. Tech constraints

| TK | Constraint |
|---|---|
| TK-0 | **Build target:** Cursor React/TSX inside the existing `Yaaradata/compliance-audit` frontend (`frontend/{app,components,lib}`) [UV]; multi-file (section 1.1). Framework and router version, TypeScript config and installed chart library to be confirmed against `package.json` [UV]. Add **no new dependencies** in pass 1; if no chart library exists, the gauge and series are plain SVG |
| TK-1 | **Variant guards:** add `const BOARD_VARIANTS = ['v8-board'] as const` and a helper; replace every `variant !== "v6"` (and `!== "v7"`) negation in the router and in any shared component with a check that also excludes `"v8-board"`. Grep the whole `components/UKBankingAudit/` tree and `lib/ukbankingaudit/` for `variant` comparisons in pass 1 and list each changed line in the pass report [UV] |
| TK-2 | **Pass discipline:** pass 1 creates v8-board (router branch + guards + shell + S1 skeleton + store + seed stubs) and changes nothing else; v6 and v7 render identically before and after. Later passes change only v8-board files. One pass at a time |
| TK-3 | **Single global `@keyframes` source:** one stylesheet (or the existing global CSS [UV]) holds all keyframes; components never inject `<style>` with keyframes |
| TK-4 | **Unique SVG IDs:** every gradient, clipPath and marker ID derives from `useId()` + component name (CMP-10, CMP-14 especially); no hard-coded `id="gradient"` |
| TK-5 | **Timers:** none planned (DS7-4). Any `setTimeout` (for example a confirmation toast) is cleared in the effect cleanup and on viewer switch |
| TK-6 | **Persona/viewer reset:** screen subtree keyed by `viewer`; no module-level mutable state; no stale closures over `viewer` in callbacks (read from the store at call time) |
| TK-7 | **No browser storage:** no `localStorage`, `sessionStorage`, IndexedDB or cookies for v8-board state. Do not touch `lib/auth-context.tsx` even if it uses storage [UV] |
| TK-8 | **Do not touch auth:** `app/login/page.tsx`, `lib/auth-context.tsx` unchanged |
| TK-9 | **Visibility by unmount:** scoped elements (T2-30, SAR detail) are not rendered at all for out-of-scope viewers; no CSS hiding, no placeholder (HF-9, DS-17) |
| TK-10 | **Closed verbs in code:** `ActionVerb` is a closed union; button labels derive from it. A lint-style check in Stage 11: grep v8-board for "File", "Notify", "Submit", "Complete now", "Approve and send" (must return none). The same check greps for "forecast", "Cannot defend" and "Attested without evidence" (must return none; V-7, V-10) |
| TK-11 | **No internal codes on faces:** `cardId`, entity codes, feed codes (TM-04), event codes and S-codes render only inside drills' reference fields or tooltips (X-5) |
| TK-12 | **Data files:** new board data lives in `lib/ukbankingaudit/boardRiskV8/` [UV path]; `riskDomainsV4.ts` and `precedentCorpus.ts` are imported read-only. The board-layer "capital" key (S5-OD-1) is defined in the new files, not added to `riskDomainsV4.ts` |

---

## 7. Decisions taken in this stage

| # | Decision | Basis |
|---|---|---|
| DS8-1 | Variant name `v8-board`; v6 and v7 untouched | Coordinator; Cursor convention |
| DS8-2 | One guard helper replaces scattered `!== "v6"` checks | Brief build fact |
| DS8-3 | BRC chair is a viewer switch inside v8-board, not a new auth persona, pending OD-3 | Auth files untouched; one persona per screen still holds |
| DS8-4 | In-variant routing by typed `ViewState` in the store | Unknown router setup [UV]; ID-addressed drills |
| DS8-5 | S2 hosted by `DomainDrillPanel` with the toggle not rendered, adapted by an optional prop only if needed | Brief; DS-5 |
| DS8-6 | Statuses and integrity are seeded (computed by 9A/9B to Stage 5 section 4.4), not computed in components | Keeps the demo deterministic and tie-outs fixed |
| DS8-7 | One `ScopedDrillScreen` with four bodies; DG signatures live in distinct body components | Distinct drills without duplicate shells |
| DS8-8 | No LiSN intelligence components | R-5, R-10, DS7-4 |

## 8. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| **S8-OD-1** | Variant name `v8-board` may collide with a future numeric v8 | Keep `v8-board` (string is distinct); confirm with the user and against any existing variant union type [UV] |
| S8-OD-2 | Folder name `v8board/` vs the repo's existing per-variant convention | Match whatever v6 uses [UV] |
| **S8-OD-3** | `DomainDrillPanel` lens-toggle suppression: existing prop, new optional prop, or wrap-and-render-body | Use an existing prop if present; else add `hideLensToggle?: boolean` (default false). Needs a repo read before pass 1 |
| S8-OD-4 | Reuse `SuppressionLedger` for the override log only if its visible label is configurable | Otherwise build `OverrideLog` (X-4) |
| S8-OD-5 | Sync `ViewState` to a URL query parameter (shareable deep links) or keep in memory only | Memory only for the demo; query param later |
| S8-OD-6 | Chart approach: existing chart library [UV] vs plain SVG | Plain SVG unless a library is already installed |
| S8-OD-7 | Whether the variant union / persona mapping lives in a types file outside the router [UV] | Find it in pass 1; list it in the pass report |
| Carried | OD-1 (theme, Unverified token), OD-3, OD-5, OD-7, S5-OD-1 (capital key), S5-OD-14 (repo alignment of entity names), S7-OD-1 to S7-OD-4 | Unchanged |

## 9. Definition-of-done check

| Criterion | Status |
|---|---|
| Every Stage 6 card maps to a named, reusable component | Met (section 1.6 coverage check) |
| Every component states its feeding entity or unit | Met (tables 1.2–1.5) |
| Drill routes by item ID; persona-switch reset specified | Met (sections 2.3, 2.4) |
| No styling values set | Met (section 4 names primitives only; palette quoted only as the open OD-1 option) |
| Tech constraints pre-empt the bug classes | Met: TK-1 guards, TK-3 keyframes, TK-4 SVG IDs, TK-5 timers, TK-6 reset, TK-7 storage |
| Repo details marked unverified | Met: all existing paths, props and behaviours carry [UV] |

*End of Stage 8. Not locked. Feeds: 9A/9B (ST-7 to ST-10 shapes; EvidencePack per DG), 9C (CMP names for rule mapping; Unverified token gap), Stage 10 (pass plan TK-2, file layout, guard rule, reference match).*

---

## Revision 27 October 2026 — 9C fixes applied

Source: `Stage9C_Build_Quality_Filter_v1.md` section 5. No figures changed.

| V | What changed in this file |
|---|---|
| V-1 | CMP-1 gains a row 0 `band` slot and a `rightStack`; S1 phone order now band, Z1, Z2, Z5, Z4, Z6; CMP-41a composition re-laid (band row 0; Z2 above Z5 in the right column) |
| V-2 | CMP-28 sections renamed to `{critical, dueBeforeBrc, holdingSteady}` with the C-suite labels; `cannotDefend` removed |
| V-3 | CMP-28 no longer aggregates E-38 route data and never renders reportability counts or route decisions; RT-3 / RT-4 entry points updated |
| V-4 | CMP-28 takes a `screen` prop and mounts as row 0 on S3 (CMP-41c) and S4 (CMP-41d) |
| V-5 | `ObjectiveTileVM` has no value field; `ScorecardRowVM.shownAbove` renders status + badge + "shown above" anchor with no value |
| V-6 | `ObjectiveTileVM` reduced to objective, status, collapsed badge, one inline state, one action; headroom £, trajectory and marker moved to `tooltip` |
| V-7 | CMP-10 prop `forecast` renamed `projection` everywhere; compact mode renders no projection marker; full mode labels it "projection"; TK-10 greps for "forecast" |
| V-8 | CMP-15 boxed at `visibleRows: 4` with internal scroll, fixed `summaryLine`, promotion lane beneath |
| V-9 | CMP-23 renders route rows on the face under a non-clickable `LedgerEventGroupHeader`, boxed at `visibleRows: 4`; one click on a route row opens RT-6 |
| V-10 | Label fixes noted for CMP-9 (T2-17 dot), CMP-27 (tile 3 title) and CMP-28; TK-10 greps for the old labels |
| V-11 | CMP-2 prop `integrationDependent: {feed, caveat}` (star + caveat); new `boardRiskV8/widgetRegistry.ts` with type and entries (section 1.7) |
