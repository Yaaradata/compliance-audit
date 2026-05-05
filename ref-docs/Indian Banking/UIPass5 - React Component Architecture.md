# React Component Architecture — IndianBankingAudit Pass 5

*Pass 5 — Frontend Component Architecture (Pre-JSX) for an AI-Driven Risk, Compliance & Audit Platform — Mid-Sized Indian Private Sector Bank*
*Authored by: Senior React + Tailwind Frontend Architect | Enterprise BFSI Prototype Engineer | Cut-off: April 2026*

> This document converts UI Pass 4 (UX Blueprint) into a frontend component architecture that a single engineer can implement in **one** `IndianBankingAuditApp.jsx` file with **one** `mockIndianBankingAuditData.js` data file. **No JSX. No JS. No mock data values.** Just the component tree, component responsibilities, state model, mock-data schema, screen-to-component mapping, drill-down/drawer behaviour, and implementation notes.

---

## 1. Component Tree

### 1.1 Top-level hierarchy (root → leaves)

```
App
└── AppShell
    ├── TopBar
    │   ├── BankContextLabel                        (static "MSPB — India")
    │   ├── PersonaSwitcher                         (cro / compliance / audit / operations)
    │   ├── TimeTravelControl                       (live / asOf)
    │   ├── GlobalFilterBar                         (process / risk-domain / time / status)
    │   ├── SourceSystemHealthBadge                 (aggregate; click → sourceLineage)
    │   ├── InspectionReadinessIndicator            (ARS aggregate)
    │   ├── EvidenceFreshnessIndicator              (EIFS aggregate)
    │   ├── AIReviewQueueIndicator                  (pending count)
    │   └── UserIdentityChip
    │
    ├── MainNavigation                              (left rail)
    │   ├── NavGroup-RiskPosture
    │   ├── NavGroup-InspectionPacks
    │   ├── NavGroup-ObligationsAndControls
    │   ├── NavGroup-Processes                      (P1)
    │   ├── NavGroup-TestingAndEvidence
    │   ├── NavGroup-IssuesAndRemediation
    │   ├── NavGroup-AIInsights
    │   ├── NavGroup-Accountability                 (P1)
    │   ├── NavGroup-SourceLineage
    │   ├── NavGroup-ReportingClocks                (Wave 2 partial)
    │   ├── NavGroup-UPIFraud (disabled)            (Wave 2)
    │   ├── NavGroup-ITGRCA (disabled)              (Wave 2)
    │   ├── NavGroup-Vendor (disabled)              (Wave 3)
    │   ├── NavGroup-Complaints (disabled)          (Wave 3)
    │   └── NavGroup-RegulatoryChangeInbox (disabled) (Wave 3)
    │
    ├── ScreenContainer                             (renders ActiveScreen by activeScreen)
    │   ├── ScreenHeader                            (title + breadcrumb + screen-local filters)
    │   │   └── DrillDownBreadcrumb                 (chain of clicked entities)
    │   │
    │   └── ActiveScreen   (one of:)
    │       ├── ExecutiveRiskPostureCockpit         (S-01; landing for cro)
    │       ├── WhatChangedThisWeek                 (S-02)
    │       ├── InspectionReadinessView             (S-03)
    │       ├── ObligationCoverageMap               (S-04; landing for compliance)
    │       ├── ControlUniverse                     (S-05)
    │       ├── ControlDrillDown                    (S-06)
    │       ├── ProcessHealthView                   (S-07; landing for operations)
    │       ├── EvidenceWorkbench                   (S-08)
    │       ├── PopulationTestingConsole            (S-09; landing for audit)
    │       ├── IssueRemediationBoard               (S-10)
    │       ├── AIInsightsReviewQueue               (S-11)
    │       ├── SeniorAccountabilityLedger          (S-12)
    │       ├── WorkpaperAuditPackBuilder           (S-13)
    │       └── SourceLineagePage                   (N-09; page-level extension of D-01)
    │
    ├── DetailDrawer                                (universal slide-in; right edge)
    │   ├── DrawerHeader                            (entity-id + status badges + close)
    │   ├── DrillDownBreadcrumb                     (in-drawer chain)
    │   └── DrawerBody (one of:)
    │       ├── RiskDetailContent
    │       ├── ObligationDetailContent
    │       ├── ControlDetailContent
    │       ├── ProcessDetailContent
    │       ├── ProcessExecutionDetailContent
    │       ├── StepExecutionDetailContent
    │       ├── ControlInstanceDetailContent
    │       ├── EvidenceDetailContent
    │       ├── SourceRecordDetailContent
    │       ├── CorrelationRecordDetailContent
    │       ├── IssueDetailContent
    │       ├── RemediationActionDetailContent
    │       ├── SeniorManagerDetailContent
    │       ├── DecisionEventDetailContent
    │       ├── AttestationEventDetailContent
    │       ├── TestExecutionDetailContent
    │       ├── WorkpaperDetailContent
    │       ├── AuditPackDetailContent
    │       ├── AIInsightDetailContent
    │       ├── ReportingClockDetailContent
    │       └── ReportingSubmissionDetailContent
    │
    └── EvidenceChainDrawer                         (specialised drawer; renders lineage spine)
        ├── DrawerHeader                            (anchor entity)
        ├── SourceLineageTimeline                   (Reg → Obl → Risk → CTRL → CI → EVD → SR → CR)
        ├── EvidenceProvenancePanel                 (hash, retention class, retrieval ts, readiness flags)
        ├── AuditTrailPanel                         (audit_trail events; system_time + valid_time)
        └── DrawerActionBar                         (open evidence | open SR | add to workpaper | add to pack | raise issue | mark for re-fetch | copy lineage)
```

### 1.2 Screen-internal sub-trees (zones inside each ActiveScreen)

```
ExecutiveRiskPostureCockpit (S-01)
├── ScreenHeader
├── KPIStrip                                        (5 KPIs: RES / ARS / CES / SAES / RTS-top3)
├── RiskDomainHeatmap                               (9 tiles)
├── WhatChangedStrip                                (delta cards row, links to S-02)
├── IssueWatchlistTable                             (top-5 issues, RBI MRA flag)
├── ReportingClockStrip                             (at-risk only)
├── InspectionReadinessSnapshot                     (ARS by lens, links to S-03)
├── SeniorAccountabilitySnapshot                    (cards, link to S-12)
└── AIInsightPanel                                  (max 3 high-confidence insights)

WhatChangedThisWeek (S-02)
├── ScreenHeader
├── DeltaBoardColumn — NewIssues
├── DeltaBoardColumn — CESMovements
├── DeltaBoardColumn — AIInsights
├── DeltaBoardColumn — KRIBandChanges
├── DeltaBoardColumn — ReportingBreaches
└── NarrativePanel                                  (auto-drafted weekly narrative)

InspectionReadinessView (S-03)
├── ScreenHeader
├── InspectionLensTabs                              (RBI AFI / RBS-SPARC / FIU / CSITE / Statutory / Concurrent / IA / Board)
├── ReadinessRingCard                               (ARS for selected lens)
├── ReadinessInputsCard                             (Evidence/Source/Correlation/Population/Workpaper)
├── ReadinessGapTable                               (8 gap categories)
├── PackCompositionTree                             (OBL → CTRL → EVD nodes)
├── AIInsightPanel                                  (gap-finder)
└── ScreenActionBar                                 (Refresh / AssignGaps / Export-disabled-until-green)

ObligationCoverageMap (S-04)
├── ScreenHeader
├── RegulatorGroupFilter
├── ObligationListTable                             (rows = OBL with coverage bar, EIFS chip, AI-003 chip)
├── ObligationDrillInPanel                          (right; linked controls + clocks + SM + issues)
├── RegulatoryChangeTimeline                        (bottom strip)
└── ScreenActionBar

ControlUniverse (S-05)
├── ScreenHeader
├── FacetFilterRail
├── DistributionSnapshotCard                        (CES distribution + OCS aggregate)
├── ControlTable                                    (DataTable with ControlHealthTile rows)
└── BulkActionBar                                   (run pop test / add to workpaper / export)

ControlDrillDown (S-06)
├── ScreenHeader (control_id + version + accountable SM)
├── ControlTabBar                                   (Overview/Population/Evidence/Issues/AI/Lineage)
├── Tab-Overview
│   ├── CESBreakdownCard
│   ├── OutcomeSplitDonut
│   ├── TrendSparkline
│   ├── LinkedObligationStrip
│   ├── LinkedRiskChips
│   └── ReportingClockStrip                         (if applicable)
├── Tab-Population
│   └── PopulationGrid (DataTable; row → DetailDrawer for ControlInstance)
├── Tab-Evidence
│   └── EvidenceWorkbenchEmbed                      (filtered to this control)
├── Tab-Issues
│   └── IssueMiniBoard                              (linked Issues)
├── Tab-AIInsights
│   └── AIInsightsList                              (HITL inline)
├── Tab-Lineage
│   └── SourceLineageTimeline                       (control-anchored)
└── ScreenActionBar                                 (Run pop test / Raise Issue / Add to Workpaper / Open in Pack)

ProcessHealthView (S-07)
├── ScreenHeader
├── ProcessSelector
├── VariantConformanceMap                           (heatmap)
├── StepLatencyFunnel
├── DriftClusterCards                               (AI-002 clusters)
└── LinkedFailingControlsStrip

EvidenceWorkbench (S-08)
├── ScreenHeader
├── EvidenceStatusStrip                             (counts per status)
├── EvidenceTable                                   (DataTable + EvidenceCompletenessRing per row)
├── StaleEvidenceAlertCard
├── OrphanQueueMiniCard
└── ScreenActionBar                                 (Mark for re-fetch / Add to Workpaper / Raise EvidenceGap Issue)

PopulationTestingConsole (S-09)
├── ScreenHeader
├── ControlTestSelector                             (control + test_type)
├── TestRunnerPanel                                 (population query / pass predicate / sampling rationale / as-of)
├── TestResultsPanel
│   ├── PopulationTestSummaryCard
│   └── OutcomeBadgeStrip
├── ExceptionClusterTable
├── AIInsightPanel                                  (Tier-3 suggest population predicate)
├── TestExecutionHistoryStrip
└── WorkpaperAssemblyBar                            (→ S-13)

IssueRemediationBoard (S-10)
├── ScreenHeader
├── ClusterSwimlanes                                (RootCauseClusters; AI-010)
├── IssueTable                                      (DataTable)
├── IssueDetailRightPanel                           (sub-tabs: Timeline / Linked / Remediation / Retest)
└── BulkActionBar                                   (escalate / reassign / attach to AuditPack)

AIInsightsReviewQueue (S-11)
├── ScreenHeader
├── SignalClassStrip                                (counts per class)
├── AIInsightsListTable
├── AIInsightDetailRightPanel                       (Source/Output/Rationale/Recommendation/Decision)
├── ModelStrip                                      (Model + MRR snapshot)
└── BulkActionBar                                   (bulk accept high-confidence / bulk reject / escalate)

SeniorAccountabilityLedger (S-12)
├── ScreenHeader
├── SMRoleFilter
├── SMGrid                                          (SeniorAccountabilityCard tiles)
├── SMDetailRightPanel                              (Scope/OpenIssues/Decisions/Attestations/Reasonable-oversight evidence)
├── DecisionAttestationTimeline                     (bottom; 90 days)
└── ScreenActionBar                                 (Open Attestation / Escalate Gap)

WorkpaperAuditPackBuilder (S-13)
├── ModeToggle                                      (Workpaper / AuditPack)
├── ScreenHeader (scope, tester, reviewer)
├── DocumentOutlinePanel                            (left; required sections)
├── EditingArea                                     (centre; AI-drafted + tester edits + cited evidence)
├── LinkedEntitiesPanel                             (right; controls/obligations/issues/evidence)
├── ReadinessFlagsStrip                             (RBI AFI / PMLA / Statutory / Concurrent)
└── ExportBar                                       (Validate readiness / Export PDF/CSV/JSON — demo-only)

SourceLineagePage (N-09; extension of D-01)
├── ScreenHeader
├── SourceSystemHealthGrid                          (per Wave-1 system)
├── OrphanQueueTable
├── CorrelationWarningTable
├── SchemaVersionTimeline
└── ScreenActionBar
```

### 1.3 Cross-cutting overlay tree

```
GlobalOverlays (mounted at AppShell root, always available)
├── DetailDrawer                                    (entityType-routed)
├── EvidenceChainDrawer                             (specialised; lineage view)
├── ToastStack                                      (demo-only, ephemeral)
└── DemoGuidedTourOverlay                           (when demoState.guidedModeEnabled)
```

---

## 2. Component Responsibilities

### 2.1 Application shell components

| Component | Purpose | Props | State consumed | State updated | Child components |
|---|---|---|---|---|---|
| **App** | Single mount point; instantiates global state with `useState`; initialises `mockData`; renders AppShell | `mockData` (passed down) | none (root) | bootstraps `activePersona`, `activeScreen`, `drawerState`, `timeTravelState`, `filters`, `demoState`, `interactionState` | `AppShell` |
| **AppShell** | Layout frame: TopBar + MainNavigation + ScreenContainer + Drawers; persona-driven default screen | `mockData`, `state*`, `setState*` | all global | none directly | `TopBar`, `MainNavigation`, `ScreenContainer`, `DetailDrawer`, `EvidenceChainDrawer`, `ToastStack` |
| **TopBar** | Persistent global controls and indicators | `state*`, `setState*` | `activePersona`, `timeTravelState`, `filters`, derived `arsAggregate`, `eifsAggregate`, `pendingAIInsightCount`, `sourceSystemHealth` | persona / time-travel / filters | `BankContextLabel`, `PersonaSwitcher`, `TimeTravelControl`, `GlobalFilterBar`, `SourceSystemHealthBadge`, `InspectionReadinessIndicator`, `EvidenceFreshnessIndicator`, `AIReviewQueueIndicator`, `UserIdentityChip` |
| **PersonaSwitcher** | Switch active persona; updates default screen if user is on a non-pinned screen | `activePersona`, `setActivePersona`, `setActiveScreen`, `pinnedScreen` | `activePersona` | `activePersona`, `activeScreen` (only when pinned=false) | tabs / dropdown |
| **TimeTravelControl** | Toggle live / as-of; pick `asOfDate`; flag late-arriving + historical-projection | `timeTravelState`, `setTimeTravelState` | `timeTravelState` | `timeTravelState` | date picker |
| **GlobalFilterBar** | Persistent filter chips applied across screens | `filters`, `setFilters` | `filters` | `filters` | `FilterChips` |
| **MainNavigation** | Left rail nav; persona-aware highlight; disabled items for Wave 2 / 3 | `activePersona`, `activeScreen`, `setActiveScreen` | `activePersona`, `activeScreen` | `activeScreen` | `NavGroup` items |
| **ScreenContainer** | Routes to one of 14 ActiveScreen components based on `activeScreen` | all state, `mockData` | `activeScreen`, `interactionState.activeTabByScreen` | screen-local state via callbacks | `ScreenHeader` + ActiveScreen |
| **ScreenHeader** | Title, breadcrumb, screen-local filters | `activeScreen`, `interactionState`, `selectedEntity`, `drillPath` | `interactionState`, `drillPath` | `interactionState` | `DrillDownBreadcrumb`, `FilterChips` |
| **DrillDownBreadcrumb** | Renders the `drillPath` chain; click any node revisits | `drillPath`, `onSelectEntity` | `drillPath` | `selectedEntity`, `drawerState`, `drillPath` (truncates) | text + chevrons |
| **DetailDrawer** | Universal entity-routed slide-in; renders correct DetailContent by `entityType`; closes on ESC / click-outside | see §6.1 | `drawerState` | `drawerState`, `selectedEntity`, may push to `drillPath` | `DrawerHeader`, `DrillDownBreadcrumb`, one of 21 DetailContent components, `DrawerActionBar` |
| **EvidenceChainDrawer** | Specialised lineage view; renders `SourceLineageTimeline` + provenance + audit trail | see §6.2 | `drawerState` (mode = `evidenceChain`) | `drawerState`, may push entities to `selectedEntity` | `SourceLineageTimeline`, `EvidenceProvenancePanel`, `AuditTrailPanel`, `DrawerActionBar` |

### 2.2 Shared UI components

| Component | Purpose | Props | State consumed | State updated | Child components |
|---|---|---|---|---|---|
| **MetricCard** | Generic KPI tile (label + value + delta + optional sparkline + click target) | `label`, `value`, `delta`, `unit`, `trendData?`, `onClick?`, `severity?` | none | calls `onClick` | `TrendSparkline?`, badge |
| **StatusBadge** | One badge for status / outcome / readiness (resolves colour from §5.2 of Pass 4) | `kind`, `value`, `label?`, `tooltip?` | none | none | — |
| **OutcomeBadge** | Specific badge for ControlInstance outcome (Pass / Fail / DataGap / EvidenceGap / NeedsReview / NA / BPO-Pending) | `outcome`, `reason?` | none | none | — |
| **TrendSparkline** | Tiny inline trend; div-based (no external lib) | `points`, `height?`, `width?` | none | none | — |
| **RiskDomainHeatmap** | 9-domain grid (R-CR/OP/CO/CD/TC/FC/TP/FR/MR); inherent + residual + RES + trend | `risks`, `riskDomains`, `onSelectDomain` | none | calls `onSelectDomain` | tiles |
| **ControlHealthTile** | Compact one-control card (CES + outcome split + last-fired) | `control`, `controlInstancesSummary`, `onClick` | none | calls `onClick` | `OutcomeBadge`, `EvidenceCompletenessRing` |
| **CESBreakdownCard** | CES decomposed: OperatingRate × 0.40 + CatchRate × 0.40 + EvidenceCompleteness × 0.20 | `control`, `breakdown`, `onSegmentHover?` | none | none | progress segments |
| **ObligationCoverageBar** | Coverage strength bar per OBL with EIFS chip and AI-003 chip | `obligation`, `coverageStrength`, `linkedControlsSummary`, `onClick` | none | calls `onClick` | `StatusBadge` |
| **EvidenceCompletenessRing** | Ring for EvidenceCompleteness (Complete / Partial / Missing / Late / Invalid Hash / Orphaned counts) | `breakdown`, `size?` | none | none | div-based ring |
| **SourceLineageTimeline** | Horizontal lineage Reg → Obl → Risk → CTRL → CI → EVD → SR → CR; nodes clickable | `chain`, `onSelectNode` | none | `selectedEntity`, `drawerState` | nodes + edges |
| **ProcessStepTimeline** | Step-by-step PE timeline with actor / system / latency / variants | `processExecution`, `stepExecutions`, `onSelectStep` | none | calls `onSelectStep` | step cards |
| **PopulationTestSummaryCard** | Pop / Tested / Exception / DataGap / EvidenceGap counts | `testExecution` | none | none | `OutcomeBadge` strip |
| **ExceptionClusterTable** | Exceptions grouped by RootCauseCluster | `exceptions`, `clusters`, `onSelectException` | `interactionState.expandedRows` | `interactionState`, `selectedEntity` | `DataTable`, expand caret |
| **WorkpaperStatusCard** | Workpaper readiness + section completion + sign-off state | `workpaper`, `onClick` | none | calls `onClick` | `StatusBadge` |
| **AuditPackReadinessCard** | AuditPack readiness with gap list per inspection lens | `auditPack`, `onSelectGap` | none | calls `onSelectGap` | progress + gap chips |
| **AIInsightCard** | Insight with model_version + confidence + threshold + cited evidence + recommendation + risk-if-wrong + accept/reject/escalate | `aiInsight`, `model`, `mrr`, `onAccept`, `onReject`, `onEscalate`, `onOverride`, `onCiteEvidence` | none | demo-state updates (`aiInsight.human_approval_status`) | `StatusBadge`, `HumanReviewQueueItem` |
| **HumanReviewQueueItem** | Compact AI insight row in queue | `aiInsight`, `onClick` | none | calls `onClick` | confidence vs threshold mini-visual |
| **SeniorAccountabilityCard** | SM card: SAES ring + role + scope counts + last attestation | `seniorManager`, `metrics`, `onClick` | none | calls `onClick` | `EvidenceCompletenessRing` (re-used as SAES ring) |
| **ReportingClockBadge** | Clock badge with countdown + status (within / at-risk / breached) | `reportingClock`, `latestSubmission`, `onClick` | none | calls `onClick` | countdown |
| **SourceSystemHealthBadge** | Single source-system badge; hover for last ingestion + lag | `sourceSystem`, `health`, `onClick` | none | calls `onClick` | tooltip |
| **EmptyState** | Standard empty-state with title + reason + suggested action | `title`, `reason`, `action?` | none | calls action | — |
| **AlertBanner** | Top-of-screen alert (Red / Amber / Info) with action | `severity`, `message`, `action?`, `onAction?` | none | calls `onAction` | — |
| **SectionCard** | Generic card wrapper with title + optional action area | `title`, `children`, `action?` | none | none | children |
| **DataTable** | Generic table: columns spec, rows, sort, page, expand, multi-select; row click → drawer | `columns`, `rows`, `sortKey`, `setSortKey`, `pagination`, `onRowClick`, `selectable?` | `interactionState.sortStateByTable`, `paginationStateByTable`, `selectedRows`, `expandedRows` | `interactionState` | header / rows |
| **FilterChips** | Reusable chip strip with multi-select; emits change | `chips`, `selected`, `onChange` | none | calls `onChange` | chips |
| **RightPanel** | Right-side detail panel within a screen (not drawer); used in S-04 / S-10 / S-11 / S-12 / D-01 | `title`, `children`, `onClose?`, `width?` | `interactionState.rightPanelOpen` | `interactionState` | children |
| **TimelinePanel** | Vertical timeline (decisions / attestations / audit trail) | `events`, `onSelectEvent?` | none | calls `onSelectEvent` | event rows |
| **EvidenceProvenancePanel** | Hash + retention class + readiness flags + retrieval ts + chain-of-custody | `evidenceRecord`, `sourceRecord`, `correlationRecord` | none | none | rows + badges |
| **AuditTrailPanel** | Renders `audit_trail_event[]` for an entity (system_time + valid_time per Pass 3 §12) | `events` | none | none | event rows |

### 2.3 Screen components

> All ActiveScreen components consume `mockData`, `state*`, `setState*` from props; none owns persistent state outside `interactionState.activeTabByScreen` etc.

| Component | Purpose | Props | State consumed | State updated | Child components |
|---|---|---|---|---|---|
| **ExecutiveRiskPostureCockpit** | Persona-001 landing; renders 5 zones from §4.1 of Pass 4 | `mockData`, all `state*`, `setSelectedEntity`, `setDrawerState`, `setActiveScreen` | `activePersona`, `timeTravelState`, `filters` | `selectedEntity`, `drawerState`, `activeScreen`, `interactionState` | `KPIStrip`, `RiskDomainHeatmap`, `WhatChangedStrip`, `IssueWatchlistTable` (DataTable), `ReportingClockStrip`, `InspectionReadinessSnapshot`, `SeniorAccountabilitySnapshot`, `AIInsightPanel` |
| **WhatChangedThisWeek** | 5-column delta board + narrative panel | same | same + 7-day window | `selectedEntity`, `drawerState` | 5× delta-column, `NarrativePanel` |
| **InspectionReadinessView** | 7 inspection lens tabs; readiness ring + gap table + composition tree | same | `interactionState.activeTabByScreen.inspectionReadiness` | tab change, `selectedEntity`, `drawerState` | `InspectionLensTabs`, `ReadinessRingCard`, `ReadinessInputsCard`, `ReadinessGapTable` (DataTable), `PackCompositionTree`, `AIInsightPanel`, `ScreenActionBar` |
| **ObligationCoverageMap** | Persona-002 landing; OBL list with right drill-in panel | same | `filters.regulator`, `interactionState.rightPanelOpen` | `selectedEntity`, `drawerState`, `interactionState`, `activeScreen` (when navigating to S-06) | `RegulatorGroupFilter`, `ObligationListTable`, `ObligationDrillInPanel` (RightPanel), `RegulatoryChangeTimeline` |
| **ControlUniverse** | RCM browser with facet filters and CES distribution snapshot | same | `filters` | `selectedEntity`, `activeScreen` (→ S-06), `interactionState` | `FacetFilterRail`, `DistributionSnapshotCard`, `ControlTable` (DataTable of `ControlHealthTile` rows), `BulkActionBar` |
| **ControlDrillDown** | Tabbed deep-dive on one control; population grid is the work surface | same + `selectedEntity` (must be `control`) | `selectedEntity`, `interactionState.activeTabByScreen.controlDrillDown` | tab + `selectedEntity` for CIs | `ControlTabBar` + 6 tab components |
| **ProcessHealthView** | Operations landing; variant conformance + step funnel + drift clusters | same | `filters.process` | `selectedEntity`, `drawerState` | `ProcessSelector`, `VariantConformanceMap`, `StepLatencyFunnel`, `DriftClusterCards`, `LinkedFailingControlsStrip` |
| **EvidenceWorkbench** | Persona-003 evidence work surface; standalone or embedded inside S-06 Evidence tab | same | `filters.evidenceStatus`, `filters.sourceSystem` | `selectedEntity`, `drawerState` | `EvidenceStatusStrip`, `EvidenceTable` (DataTable), `StaleEvidenceAlertCard`, `OrphanQueueMiniCard`, `ScreenActionBar` |
| **PopulationTestingConsole** | Persona-003 landing; test runner + results + exception cluster + workpaper assembly | same | `filters.controls` | `selectedEntity` (→ TestExecution), `activeScreen` (→ S-13) | `ControlTestSelector`, `TestRunnerPanel`, `TestResultsPanel`, `ExceptionClusterTable`, `AIInsightPanel`, `TestExecutionHistoryStrip`, `WorkpaperAssemblyBar` |
| **IssueRemediationBoard** | All-personas issue triage; cluster swimlanes + table + right panel | same | `filters.severity`, `filters.status`, `filters.owner`, `interactionState.rightPanelOpen` | `selectedEntity`, `interactionState`, `drawerState` | `ClusterSwimlanes`, `IssueTable` (DataTable), `IssueDetailRightPanel` (RightPanel with sub-tabs) |
| **AIInsightsReviewQueue** | Persona-002 HITL gate; signal class strip + list + right detail panel + model strip | same | `filters.aiSignalClass`, `interactionState.rightPanelOpen` | demo-state on insight (`human_approval_status`) | `SignalClassStrip`, `AIInsightsListTable`, `AIInsightDetailRightPanel`, `ModelStrip`, `BulkActionBar` |
| **SeniorAccountabilityLedger** | Persona-001 accountability cockpit; SM grid + right panel + decisions/attestations timeline | same | `filters.accountableSeniorManager` | `selectedEntity`, `drawerState`, `interactionState.rightPanelOpen` | `SMRoleFilter`, `SMGrid` (cards), `SMDetailRightPanel`, `DecisionAttestationTimeline` (TimelinePanel) |
| **WorkpaperAuditPackBuilder** | Persona-003 + 002 artefact builder; mode toggle + outline + editor + linked entities + export | same + `selectedEntity` (workpaper / auditPack) | `interactionState.activeTabByScreen.workpaperAuditPackBuilder` (mode) | mode toggle, `selectedEntity`, demo-state on workpaper / pack | `ModeToggle`, `DocumentOutlinePanel`, `EditingArea`, `LinkedEntitiesPanel`, `ReadinessFlagsStrip`, `ExportBar` |
| **SourceLineagePage** | Persona-002 page-level extension of D-01; orphan queue + correlation warnings + schema versions | same | `filters.sourceSystem`, `filters.correlationStatus` | `selectedEntity`, `drawerState` | `SourceSystemHealthGrid`, `OrphanQueueTable`, `CorrelationWarningTable`, `SchemaVersionTimeline` |

### 2.4 Detail content components (rendered inside `DetailDrawer`)

> Each `*DetailContent` component is small (1 entity → typed renderer); they share a common contract: `props = { entity, mockData, onSelectLinkedEntity, onAddToWorkpaper, onAddToAuditPack, onRaiseIssue }`. They never own routing, never own drawer open/close.

| DetailContent | Anchor entity | Required sub-sections | Inner components |
|---|---|---|---|
| **RiskDetailContent** | `risk` | summary; inherent/residual; linked controls (CES split); linked obligations; KRI latest; appetite latest; linked issues; AI insights | `MetricCard`s, `ControlHealthTile` list, `ObligationCoverageBar` list, `TrendSparkline` |
| **ObligationDetailContent** | `obligation` | atomic_requirement; regulator + citation; applicability; reporting clock; linked controls; coverage strength; recent regulatory changes | `ObligationCoverageBar`, `ControlHealthTile` list, `ReportingClockBadge` |
| **ControlDetailContent** | `control` | header + accountable SM; CES breakdown; outcome split; linked OBL; linked Risk; latest CIs (top 10); latest evidence; linked issues; AI insights | `CESBreakdownCard`, `OutcomeBadge` strip, `EvidenceCompletenessRing`, `AIInsightCard` (mini) |
| **ProcessDetailContent** | `process` | summary; PVDS; current variant signature; recent PEs; controls embedded in process | `MetricCard`s, PE list table |
| **ProcessExecutionDetailContent** | `processExecution` | anchor key (UCIC / alert_id / loan_app_id / vendor_id); status; step timeline; CIs evaluated; evidence completeness | `ProcessStepTimeline`, `OutcomeBadge` strip |
| **StepExecutionDetailContent** | `stepExecution` | actor + system + start/end ts; deviations; AI-002 cluster ref; source records produced | timeline-segment, source-record list |
| **ControlInstanceDetailContent** | `controlInstance` | outcome + reason; pass/fail/data-gap/evidence-gap predicate evaluated; evidence list; lineage preview | `OutcomeBadge`, `EvidenceProvenancePanel` mini, "Open Lineage" → opens `EvidenceChainDrawer` |
| **EvidenceDetailContent** | `evidenceRecord` | type + source system + payload hash + retention class + freshness + readiness flags; cited control / CI; audit trail | `EvidenceProvenancePanel`, `AuditTrailPanel` |
| **SourceRecordDetailContent** | `sourceRecord` | source system + table/api + primary key + payload hash + retrieval ts + ingestion ts + validation status; correlation status; mapped CI / EVD | row preview (key fields only — no full payload), `StatusBadge`s |
| **CorrelationRecordDetailContent** | `correlationRecord` | from/to entities + primary/backup keys + match method + confidence + cardinality + status; explanation | match metadata, escalation action |
| **IssueDetailContent** | `issue` | header + severity + ageing + accountable SM + RBI MRA flag; root cause cluster; linked entities; remediation tasks; retest | timeline of `audit_trail_event`, linked CTRL/OBL/Risk chips |
| **RemediationActionDetailContent** | `remediationAction` | description; owner; due/actual; status; retest TestExecution + result | linked TestExecution preview |
| **SeniorManagerDetailContent** | `seniorManager` | scope (processes/controls/risks/issues); SAES; decisions/attestations timeline; reasonable-oversight evidence | `SeniorAccountabilityCard` (full), `TimelinePanel` |
| **DecisionEventDetailContent** | `decisionEvent` | type + maker + ts + approval basis; cited evidence; linked CI/Issue | basis chips, evidence list |
| **AttestationEventDetailContent** | `attestationEvent` | type + attester + scope + period; cited evidence; submission acks | evidence list |
| **TestExecutionDetailContent** | `testExecution` | type + population_size + tested + exception_count + result + as-of; rerunnable_flag; population_query_ref; linked workpaper | `PopulationTestSummaryCard` |
| **WorkpaperDetailContent** | `workpaper` | sections + status + tester + reviewer + readiness; cited evidence | `WorkpaperStatusCard` (full) |
| **AuditPackDetailContent** | `auditPack` | scope + lens + period + readiness; included Workpapers + EvidenceRecords; export status | `AuditPackReadinessCard`, composition tree |
| **AIInsightDetailContent** | `aiInsight` | signal_id + class + confidence vs threshold + model_version; cited evidence; recommendation; risk-if-wrong; HITL actions | `AIInsightCard` (full), Model strip + MRR snapshot |
| **ReportingClockDetailContent** | `reportingClock` | obligation; deadline_spec; target_system; latest submissions + acks | `ReportingClockBadge`, submissions list |
| **ReportingSubmissionDetailContent** | `reportingSubmission` | submission_id + clock_id + submitted_at + ack_id + ack_at + status; evidence | `EvidenceProvenancePanel` for ack |

---

## 3. Props and State Design

> All state lives at the `App` level via `useState`. Children receive state slices and setter callbacks via props. **No context, no Redux, no Zustand, no router.**

### 3.1 Global app state (top-level useState slots)

| State slot | Type | Owner | Initial value | Notes |
|---|---|---|---|---|
| `activePersona` | enum: `cro \| compliance \| audit \| operations` | App | `cro` | drives default landing screen |
| `activeScreen` | enum (14 screens) | App | derived from persona via `defaultScreenByPersona` | Wave 2/3 routes refuse to set |
| `activeViewMode` | enum: `overview \| risks \| obligations \| controls \| processes \| evidence \| issues \| testing \| ai \| accountability \| inspection \| lineage \| workpaper \| auditPack` | App | per-screen default | scoped per screen |
| `selectedEntity` | object (see §3.4) | App | `null` | drives drawer + breadcrumb |
| `drawerState` | object (see §3.5) | App | `{ isOpen: false, drawerMode: 'detail', entityType: null, entityId: null, sourceScreen: null, drillPath: [], previousEntity: null, nextSuggestedEntity: null, openedFromMetric: null, openedFromTableRow: null }` | universal drawer |
| `timeTravelState` | object (see §3.6) | App | `{ mode: 'live', asOfDate: null, pinnedAcrossScreens: true, validTime: null, systemTime: null, showLateArrivingRecords: false, showHistoricalProjection: false }` | persists across screens |
| `filters` | object (see §3.7) | App | empty selections per facet | global; supplemented by screen-local filters in `interactionState.screenLocalFilters` |
| `demoState` | object (see §3.8) | App | `{ currentDemoStep: 0, selectedStorylinePath: 'amlAlertSlaStrRisk', highlightedRecord: null, highlightedMetric: null, guidedModeEnabled: false, completedSteps: [], storylineVariant: null }` | drives guided tour |
| `interactionState` | object (see §3.9) | App | per-table empty | UX micro-state |
| `mockData` | object | App | imported from `mockIndianBankingAuditData.js` | passed as prop everywhere |

### 3.2 Setters exposed (callbacks passed down)

| Setter | Signature | Effect |
|---|---|---|
| `setActivePersona(p)` | `(persona) → void` | persona switch + default landing screen change unless user is on a `pinnedScreen` |
| `setActiveScreen(s)` | `(screen) → void` | guards Wave 2/3 (no-op + toast) |
| `setActiveViewMode(v)` | `(viewMode) → void` | screen-scoped view mode |
| `setSelectedEntity(e)` | `(entityRef) → void` | normalises shape (§3.4); appends to `drillPath` |
| `setDrawerState(d)` | `(partial) → void` | merge-update; auto-opens / closes |
| `setTimeTravelState(t)` | `(partial) → void` | merge-update |
| `setFilters(f)` | `(partial) → void` | merge-update |
| `setDemoState(d)` | `(partial) → void` | merge-update |
| `setInteractionState(i)` | `(partial) → void` | merge-update |

### 3.3 Persona × default screen map (constant, not state)

| Persona | Default `activeScreen` | Notes |
|---|---|---|
| `cro` | `riskPosture` (S-01) | per Pass 4 §3.1 |
| `compliance` | `obligationCoverage` (S-04) | per Pass 4 §3.1 |
| `audit` | `populationTesting` (S-09) | per Pass 4 §3.1 |
| `operations` | `processHealth` (S-07) | per Pass 4 §3.1 |

### 3.4 `selectedEntity` shape

| Field | Type | Required | Notes |
|---|---|---|---|
| `entityType` | enum (23 types — see Pass 4 §10) | yes | e.g. `risk`, `obligation`, `control`, `controlInstance`, `evidenceRecord`, `sourceRecord`, `correlationRecord`, `issue`, `seniorManager`, `aiInsight`, `auditPack`, `workpaper`, `testExecution`, `reportingClock`, `reportingSubmission`, `process`, `processExecution`, `stepExecution`, `exception`, `remediationAction`, `decisionEvent`, `attestationEvent`, `sourceSystem` |
| `entityId` | string | yes | stable ID from mockData |
| `displayName` | string | yes | breadcrumb / drawer header |
| `sourceScreen` | enum (activeScreen value) | yes | which screen opened it |
| `sourceMetric` | enum: `RES \| CES \| ARS \| OCS \| EIFS \| DCQS \| PVDS \| RTS \| SAES \| AITES \| count \| ageing \| null` | yes | which metric was clicked |
| `linkedEntityIds` | array of `{ entityType, entityId }` | no | hints for "Linked …" sections |
| `drillPath` | array of `{ entityType, entityId, displayName }` | yes | full chain from origin metric |

### 3.5 `drawerState` shape

| Field | Type | Notes |
|---|---|---|
| `isOpen` | boolean | controls render |
| `drawerMode` | enum: `detail \| evidenceChain \| sourceLineage \| aiInsight \| auditTrail` | routes to `DetailDrawer` vs `EvidenceChainDrawer` |
| `entityType` | enum (per §3.4) | what to render |
| `entityId` | string | which |
| `sourceScreen` | enum | for breadcrumb |
| `drillPath` | array | mirror of `selectedEntity.drillPath` |
| `previousEntity` | object \| null | for back-navigation within drawer |
| `nextSuggestedEntity` | object \| null | for "next" hint (e.g. CI → EVD → SR) |
| `openedFromMetric` | string \| null | analytics + demo highlight |
| `openedFromTableRow` | string \| null | row id |

### 3.6 `timeTravelState` shape

| Field | Type | Notes |
|---|---|---|
| `mode` | enum: `live \| asOf` | controls metric computation in helpers |
| `asOfDate` | ISO date string \| null | applied as `valid_time ≤ asOfDate AND system_time ≤ asOfDate` |
| `pinnedAcrossScreens` | boolean | persists across screen changes (per Pass 4 §2.2) |
| `validTime` | ISO date \| null | derived |
| `systemTime` | ISO date \| null | derived |
| `showLateArrivingRecords` | boolean | toggles Late inclusion |
| `showHistoricalProjection` | boolean | toggles "what would have been" view |

### 3.7 `filters` shape (global)

| Filter | Type | Default | Used by |
|---|---|---|---|
| `riskDomain` | string[] | all | S-01, S-05, S-10 |
| `process` | string[] | all | most screens |
| `regulator` | string[] | all | S-04 |
| `obligationType` | string[] | all | S-04 |
| `controlType` | string[] | all | S-05 |
| `controlNature` | string[] | all | S-05 |
| `severity` | string[] | all | S-10 |
| `owner` | string[] | all | S-10 |
| `accountableSeniorManager` | string[] | all | S-12 |
| `status` | string[] | open + in-progress | S-10 |
| `controlHealth` | enum[] | all | S-05 |
| `evidenceStatus` | enum[] | all | S-08 |
| `sourceSystem` | string[] | all | S-08, N-09 |
| `correlationStatus` | enum[] | all | N-09 |
| `aiSignalClass` | enum[] | all | S-11 |
| `inspectionLens` | enum[] | RBI AFI | S-03 |
| `dateRange` | `{ from, to }` | last 30d | most |

> Screen-local filters (e.g., facet rail in S-05) live under `interactionState.screenLocalFilters[screen]` so they don't pollute global state.

### 3.8 `demoState` shape

| Field | Type | Notes |
|---|---|---|
| `currentDemoStep` | integer | 0..N |
| `selectedStorylinePath` | enum: `kycCkycrGap \| amlAlertSlaStrRisk \| digitalLendingKfsViolation \| inspectionReadinessPack \| populationTestingToWorkpaper` | five canonical demos |
| `highlightedRecord` | `{ entityType, entityId }` \| null | drives glow/highlight of a card or row |
| `highlightedMetric` | string \| null | drives glow of a KPI tile |
| `guidedModeEnabled` | boolean | shows DemoGuidedTourOverlay |
| `completedSteps` | integer[] | progress |
| `storylineVariant` | enum (same as selectedStorylinePath) | for branching |

### 3.9 `interactionState` shape

| Field | Type | Notes |
|---|---|---|
| `expandedRows` | object: `{ [tableId]: string[] }` | per table |
| `selectedRows` | object: `{ [tableId]: string[] }` | per table multi-select |
| `activeTabByScreen` | object: `{ [screen]: tabKey }` | tab memory |
| `sortStateByTable` | object: `{ [tableId]: { sortKey, direction } }` | sort memory |
| `paginationStateByTable` | object: `{ [tableId]: { page, pageSize } }` | page memory |
| `rightPanelOpen` | object: `{ [screen]: boolean }` | side-panel toggle |
| `comparisonModeEnabled` | boolean | future-use |
| `selectedMetricBreakdown` | string \| null | which KPI is currently expanded |
| `screenLocalFilters` | object: `{ [screen]: object }` | screen-scoped filter overrides |

### 3.10 Screen-local state guidance

Most screens are *stateless* — they read everything from `mockData` + global state and emit events upward. Where local state is unavoidable (e.g., the `EditingArea` of S-13 hosting unsaved edits), keep it as a **local `useState`** inside that screen component; do not lift unless it must persist across navigation. Persistence-eligible state (sort, pagination, expanded rows, active tab, right-panel open) goes into `interactionState`.

---

## 4. Mock Data Schema

> One file: `mockIndianBankingAuditData.js`. Exports a single object: `export const mockData = { …42 datasets… }`. Every dataset is an array of plain objects with stable IDs. **No values yet — only schemas.**

### 4.1 Master schema table

| # | Dataset | Purpose | Key fields | Linked entities | Used by screens | Sample ID format | Min records |
|---|---|---|---|---|---|---|---|
| 1 | `personas` | Persona registry | `persona_id, code (cro/compliance/audit/operations), title, default_screen, persona_questions[]` | — | TopBar, MainNavigation | `PERSONA-001..003 + OPS` | 4 |
| 2 | `navigationItems` | Left rail config | `nav_id, label, icon_name, default_screen, persona_default_for[], wave (1/2/3), enabled_flag, screens_inside[], entity_anchor` | screens | MainNavigation | `NAV-N-01..N-15` | 15 |
| 3 | `screens` | Screen registry | `screen_id, code, title, primary_persona, persona_question_answered, anchor_entity, default_filters{}, primary_kpis[]` | personas, metrics | ScreenContainer, ScreenHeader | `S-01..S-13 + D-01 + N-09` | 14 + 1 |
| 4 | `metrics` | Metric registry | `metric_id (RES/CES/ARS/OCS/EIFS/DCQS/PVDS/RTS/SAES/AITES), formula, weights, color_thresholds, denominator_rules, used_by_screens[]` | — | every screen | enum | 10 |
| 5 | `riskDomains` | 9 risk domains | `domain_id (R-CR/R-OP/R-CO/R-CD/R-TC/R-FC/R-TP/R-FR/R-MR), title, regulatory_anchor` | risks | S-01, S-05 | enum | 9 |
| 6 | `risks` | Risk register | `risk_id, domain_id, title, inherent_rating, residual_rating, accountable_senior_manager_id, kri_ids[], appetite_metric_ids[], linked_obligation_ids[], linked_control_ids[]` | seniorManagers, kris, appetiteMetrics, obligations, controls | S-01, S-12, S-06, S-04 | `R-FC-001`, `R-CD-001`, `R-OP-001`, `R-TC-001` | 9 (one per domain) |
| 7 | `regulations` | Regulator master | `regulation_id, title, regulator (RBI/PMLA/FIU/NPCI/CERT-In/ITGRCA/SEBI/IRDAI/MCA), citation, version, effective_from, supersedes` | obligations | S-04, S-03, D-01 | `REG-RBI-MD-KYC-2016`, `REG-RBI-MD-DL-2025` | 8 |
| 8 | `obligations` | Atomic regulatory requirements | `obligation_id, atomic_requirement, regulation_id, applicability_archetype, reporting_clock_id?, accountable_senior_manager_id, applicable_processes[], linked_control_ids[]` | regulations, reportingClocks, controls | S-04, S-03, S-06 | `OBL-RBI-KYC-001`, `OBL-RBI-KYC-003`, `OBL-PMLA-001`, `OBL-FIU-STR-001`, `OBL-RBI-DL-001`, `OBL-CERT-IN-001` | 12 |
| 9 | `controls` | RCM | `control_id, title, type (preventive/detective/corrective/directive), nature (manual/automated/hybrid), frequency, process_id, position_in_step, owner_role, accountable_senior_manager_id, designed_condition, evidence_specs[], population_testable_flag, ces_breakdown{operating_rate, catch_rate, evidence_completeness}, linked_obligations[], linked_risks[]` | processes, seniorManagers, obligations, risks | S-05, S-06, S-09, S-10 | `CTRL-KYC-001..008`, `CTRL-LND-002`, `CTRL-AML-002/003`, `CTRL-UPI-001`, `CTRL-VND-001`, `CTRL-ITO-001` | 12 |
| 10 | `processes` | Process register | `process_id, name, owner_role, regulatory_anchor_ids[], documented_variant_signature, pvds, status` | regulations | S-07, S-04, S-06 | `PROC-KYC-001`, `PROC-LND-001`, `PROC-AML-001`, `PROC-UPI-001`, `PROC-COMP-001`, `PROC-VND-001`, `PROC-ITO-001` | 7 |
| 11 | `processSteps` | Step register per process | `step_id, process_id, step_order, name, expected_actor_role, expected_systems[], slas{}` | processes | S-07, S-06 | `STEP-KYC-{n}`, `STEP-AML-{n}`, `STEP-LND-{n}` | ~50 (7 procs × ~7 steps avg) |
| 12 | `activities` | Atomic activities under steps | `activity_id, step_id, expected_event_type, expected_evidence_type, mandatory_flag` | processSteps | S-07 (drill), D-01 | `ACT-{step_id}-{n}` | ~80 |
| 13 | `sourceSystems` | Source-system registry | `source_system_id, system_type (CBS/LOS/AML-engine/Sanctions/CKYCR/Case-Mgmt/NPCI/ITSM/SIEM/VMO/CMS/HRMS/Telephony/Bureau/AA/UIDAI/DigiLocker/Email/DM), integration_mode (Kafka/CDC/API/SFTP/Manual), expected_latency, system_of_record_flag, status` | — | TopBar, S-08, N-09, D-01 | `SS-CBS-FINACLE`, `SS-LOS-NEWGEN`, `SS-AML-FCCM`, `SS-SANC-FIRCO`, `SS-CKYCR`, `SS-CASE-PEGA` (Wave 1) | 6 (Wave 1) + 4 placeholders (Wave 2) |
| 14 | `sourceRecords` | Raw source rows / events / API responses / docs | `source_record_id, source_system_id, source_table_or_api, source_primary_key, payload_hash, event_timestamp, ingestion_timestamp, validation_status, correlation_status, key_fields_preview{}` | sourceSystems, correlationRecords, controlInstances, evidenceRecords | S-08, N-09, D-01 | `SR-{system}-{n}` | ~30 (per Wave-1 system, ~5 each) |
| 15 | `correlationRecords` | Bridge rows for joins | `correlation_id, from_entity_type, from_entity_id, to_entity_type, to_entity_id, primary_key_used, backup_key_used, match_method, match_confidence, expected_cardinality, actual_cardinality, correlation_status (matched/timestamp_reversal/schema_mismatch/late_arriving/orphan/ambiguous_n_to_1/ambiguous_1_to_n)` | sourceRecords, processExecutions, stepExecutions, controlInstances, evidenceRecords | N-09, S-08, D-01, EvidenceChainDrawer | `CR-{n}` | ~40 |
| 16 | `processExecutions` | One journey instance | `process_execution_id, process_id, anchor_key_value (UCIC / alert_id / loan_app_id / vendor_id), status, variant_signature, control_instance_count, evidence_completeness, started_at, closed_at` | processes, controlInstances | S-07, S-06 (lineage), D-01 | `PE-KYC-UCIC-{ucic}`, `PE-AML-{alert_id}`, `PE-LND-{loan_app_id}`, `PE-VND-{vendor_id}` | 12 (3 KYC + 3 AML + 4 LND + 2 VND from Pass 2 sample IDs) |
| 17 | `stepExecutions` | Step-level event | `step_execution_id, process_execution_id, step_id, actual_actor_type (branch/BPO/system), actual_system, start_ts, end_ts, skipped_step_flag, manual_override_flag, bpo_or_vendor_flag, source_record_ids[]` | processExecutions, processSteps, sourceRecords | S-07, S-06 (lineage tab), D-01 | `SE-{n}` | ~80 (12 PEs × ~7 steps avg) |
| 18 | `controlInstances` | Each evaluation of one control on one PE | `control_instance_id, control_id, process_execution_id, subject_id, outcome (Pass/Fail/DataGap/EvidenceGap/NeedsReview/NA), fire_ts, latency_ms, evidence_ids[], exception_id?, override_reason?, fail_reason?, data_gap_reason?, evidence_gap_reason?` | controls, processExecutions, evidenceRecords, exceptions | S-06 (population grid is THE work surface), S-09 (results), S-10 (linked CIs), D-01 | `CI-{control_id}-{n}` | ~60 (across the 12 controls × representative samples; must include CI rows for UCIC-2024-00127, AML-ALRT-2024-00502, DL-APP-2024-00884) |
| 19 | `evidenceRecords` | Proof items | `evidence_id, evidence_type (EVD-LOG/EVD-DOC/EVD-ATTEST/EVD-SIGN/EVD-RECON/EVD-CALL/EVD-IMG/EVD-BIO/EVD-WORKPAPER/EVD-REPORT/EVD-BOARD), source_system_id, source_record_id, payload_hash, evidence_completeness_score, freshness_days, retention_class (PMLA-10y / RBI-MD / Concurrent / Statutory / Internal), regulator_ready_flags{rbi_afi, pmla_rule9, fiu_finnet, statutory, concurrent}` | sourceSystems, sourceRecords, controlInstances | S-08, S-06 (Evidence tab), D-01, S-13 | `EV-{type}-{n}` | ~40 |
| 20 | `exceptions` | Failed CI / repeated pattern | `exception_id, exception_type (control_failure/evidence_gap/data_gap/correlation_warning/needs_review), severity, control_instance_id?, root_cause_cluster_id?, linked_issue_id?, status, disposition` | controlInstances, rootCauseClusters, issues | S-09 (cluster), S-10, D-01 | `EX-{n}` | ~25 |
| 21 | `issues` | Issue / finding | `issue_id, title, severity, status, ageing_days, accountable_senior_manager_id, root_cause, rbi_mra_flag, section_47a_exposure_flag, pmla_exposure_flag, linked_control_ids[], linked_obligation_ids[], linked_risk_ids[], linked_remediation_ids[], linked_ai_insight_ids[], opened_at, closed_at?` | seniorManagers, controls, obligations, risks, remediationActions, aiInsights | S-10, S-01 (watchlist), S-06 (issues tab), D-01 | `ISS-2026-009`, `ISS-2026-027`, `ISS-2026-061`, `ISS-2026-085` | 6+ |
| 22 | `remediationActions` | Remediation tasks | `action_id, issue_id, description, owner_id, due_date, actual_close_date?, status, retest_required, retest_test_execution_id?, validation_status` | issues, testExecutions | S-10 (remediation tab), D-01 | `RA-{n}` | 8 |
| 23 | `seniorManagers` | SM register | `senior_manager_id, name (placeholder), role (CRO/CCO/MLRO-PO/CISO/CIO/HIA/MD&CEO/Business-Head/Operations-Head/Head-of-FCC), function, accountable_processes[], accountable_controls[], accountable_risks[], accountable_obligations[], saes, last_attestation_date` | risks, controls, obligations, processes | S-12, S-01 (snapshot), S-06 (control header) | `SM-CRO-001`, `SM-CCO-001`, `SM-MLRO-001`, `SM-CISO-001`, `SM-CIO-001`, `SM-HIA-001`, `SM-CEO-001`, `SM-BH-RETAIL-001`, `SM-OPS-001`, `SM-FCC-001` | 8–10 |
| 24 | `decisionEvents` | Decisions / approvals / overrides | `decision_id, decision_type (approval/override/escalation/veto), decision_maker_id, decision_timestamp, approval_basis, linked_entity_ref{type,id}, evidence_ids[]` | seniorManagers, evidenceRecords | S-12 (timeline), D-01 | `DE-{n}` | 15 |
| 25 | `attestationEvents` | Periodic attestations | `attestation_id, attestation_type (period_attestation/cims_certification/icr_signoff/ctrl_attestation), attester_id, scope, period, evidence_ids[]` | seniorManagers, evidenceRecords | S-12, S-03 (pack) | `AE-{n}` | 10 |
| 26 | `testExecutions` | Population / sample / retest runs | `test_id, control_id, test_type (population_reperformance/sample/retest/ToD/ToO/walkthrough), population_size, tested_count, exception_count, data_gap_count, evidence_gap_count, result, rerunnable_flag, population_query_ref, as_of_date, evidence_ids[], linked_workpaper_id?` | controls, exceptions, evidenceRecords, workpapers | S-09, S-13, D-01 | `TX-{n}` | 8 |
| 27 | `workpapers` | Workpaper artefacts | `workpaper_id, control_id, obligation_ids[], test_execution_id, sections[], population_size, tested_count, exception_count, evidence_ids[], tester_id, reviewer_id, status (draft/in_review/signed/exported), retest_required, readiness_flags{rbi_afi, pmla_rule9, statutory, concurrent}` | controls, obligations, testExecutions, evidenceRecords, seniorManagers | S-13, S-09, S-03, D-01 | `WP-{n}` | 5 |
| 28 | `auditPacks` | Inspection packs | `audit_pack_id, scope_type (inspection_lens/theme/period/control/regulator), scope_id, target_audience (rbi_afi/rbs_sparc/pmla_fiu/itgrca_csite/concurrent/statutory/board), readiness_status, ars, included_workpaper_ids[], included_evidence_ids[], included_issue_ids[], included_attestation_ids[], exported_at?, content_hash?` | workpapers, evidenceRecords, issues, attestationEvents | S-03, S-13, S-01 (snapshot), D-01 | `AP-RBI-AFI-2026-Q1`, `AP-PMLA-FIU-2026-Q1`, `AP-CONCURRENT-2026-MAR`, `AP-BOARD-2026-Q1` | 5 |
| 29 | `aiInsights` | AI signals | `ai_insight_id, signal_id (AI-001..019), signal_class (anomaly/drift/coverage_gap/effectiveness_decay/evidence_quality/cluster_rca/reporting_risk/accountability_gap/model_risk), title, model_id, model_version, confidence, threshold (alert/review/action), recommendation, risk_if_wrong, cited_evidence_ids[], cited_source_record_ids[], linked_control_ids[], linked_obligation_ids[], linked_issue_ids[], human_approval_status (pending/accepted/rejected/escalated/overridden), human_approval_reason?` | models, evidenceRecords, controls, issues | S-11, S-06 (AI tab), S-01 (panel), S-09, S-10 | `AII-{n}` | 12 (incl. AI-013 on DL-APP-2024-00884; AI-016 on DBT cohort UCIC-2024-00127; AI-002 on AML-ALRT-2024-00502 step drift; AI-018 on CTRL-AML-002 decay; AI-005 on stale CKYCR ack; AI-010 cluster on DSA-LOS-clock) |
| 30 | `models` | AI model registry | `model_id, model_name, model_version, model_type (rule/ml/llm/hybrid), training_data_id, last_validation_date, drift_metrics{}` | modelRiskRecords | S-11 (model strip) | `MDL-{n}` | 6 |
| 31 | `modelRiskRecords` | Model Risk Management snapshots | `mrr_id, model_id, validation_date, validator_id, validation_outcome, drift_status, aites, governance_committee_ref` | models, seniorManagers | S-11 (Model + MRR snapshot) | `MRR-{n}` | 6 |
| 32 | `reportingClocks` | Regulatory clocks | `clock_id, obligation_id, clock_label (CTR/STR/CTR-by-15th-of-next-month/STR-7BD/FMR-14D/CSITE-2-6h/CERT-In-6h/UAPA-daily/CIMS-quarterly/CRILC-monthly), deadline_spec (cron / SLA), target_system, current_status (within/at_risk/breached)` | obligations | S-01 (strip), S-04 (panel), S-06 (clock strip), N-10 | `RC-CTR`, `RC-STR-7BD`, `RC-CSITE`, `RC-CERT-IN`, `RC-UAPA-DAILY`, `RC-CIMS-Q`, `RC-CRILC-M`, `RC-FMR-14D` | 8 |
| 33 | `reportingSubmissions` | Submissions to regulator/utility | `submission_id, clock_id, submitted_at, ack_id, ack_at?, status (on_time/late/breached/pending), evidence_id_for_ack?` | reportingClocks, evidenceRecords | S-01, N-10, S-13 | `RS-{n}` | 12 |
| 34 | `kris` | KRI register | `kri_id, name, linked_risk_id, threshold_amber, threshold_red, unit, formula_ref` | risks | S-01 (strip), S-12 | `KRI-{n}` | 9 (one per risk domain) |
| 35 | `kriObservations` | KRI observations | `observation_id, kri_id, value, band (green/amber/red), as_of_ts` | kris | S-01, S-12 | `KOBS-{n}` | ~20 (rolling) |
| 36 | `appetiteMetrics` | Risk-appetite metrics | `appetite_metric_id, name, linked_risk_id, board_approved_threshold, unit, formula_ref` | risks | S-01 | `AP-{n}` | 9 |
| 37 | `appetiteObservations` | Appetite observations | `observation_id, appetite_metric_id, value, band, board_approval_ref, as_of_ts` | appetiteMetrics | S-01 | `APOBS-{n}` | ~20 |
| 38 | `rootCauseClusters` | AI-010 issue clusters | `cluster_id, label, member_issue_ids[], member_control_ids[], member_process_ids[], cluster_severity, ai_signal_id?` | issues, controls, processes, aiInsights | S-10 (swimlanes) | `RCC-{n}` | 4 (incl. "DSA-LOS-clock cluster", "BPO-AML-L1-SLA cluster", "DBT-CKYCR-cohort cluster", "CKYCR-late-arrival cluster") |
| 39 | `auditTrailEvents` | Append-only event log per entity | `audit_trail_event_id, entity_ref{type,id}, event_type, system_time, valid_time, actor_id, payload_summary, content_hash` | every entity | D-01, AuditTrailPanel | `ATE-{n}` | ~50 |
| 40 | `inspectionLenses` | Lens templates | `lens_id, label (rbi_afi/rbs_sparc/pmla_fiu/itgrca_csite/concurrent/statutory/board), scope_definition, required_evidence_specs[], readiness_score_inputs[], gap_categories[]` | obligations, controls | S-03 | `IL-{lens}` | 7 |
| 41 | `sourceSystemHealth` | Per-system health snapshot | `health_id, source_system_id, ingestion_lag_ms, last_successful_ingest_ts, error_rate, schema_version_current, status (healthy/degraded/down), orphan_count` | sourceSystems | TopBar (aggregate), N-09 | `SSH-{n}` | 6 |
| 42 | `demoStorylines` | Storyline scripts | `storyline_id (kycCkycrGap/amlAlertSlaStrRisk/digitalLendingKfsViolation/inspectionReadinessPack/populationTestingToWorkpaper), title, persona_starts_with, steps[]{step_id, persona, screen, action_label, highlight_record_ref, narrative}` | screens, personas, all entity refs | DemoGuidedTourOverlay | `STORY-{key}` | 5 |

### 4.2 Sample-ID rule (consistency contract)

- **All sample IDs must be reused exactly** as established in Pass 2 / Pass 4: `UCIC-2024-00123 / 00126 / 00127`, `AML-ALRT-2024-00501 / 00502 / 00505`, `DL-APP-2024-00881 / 00882 / 00884 / 00885`, `VEND-2024-00202 / 00203 / 00205`.
- **All control IDs** match the RCM rows in Pass 4: `CTRL-KYC-001..008`, `CTRL-LND-001..005`, `CTRL-AML-001..005`, `CTRL-VND-001/002`, `CTRL-UPI-001`, `CTRL-ITO-001`.
- **All AI signal IDs** match Pass 4 catalogue: `AI-001` (UPI mule), `AI-002` (process drift), `AI-003` (regulatory mapping coverage gap), `AI-005` (evidence quality), `AI-010` (RCA clustering), `AI-013` (KFS timing violation), `AI-016` (CKYCR cohort delay), `AI-018` (effectiveness decay), `AI-019` (accountability gap).
- **All issue IDs** as listed: `ISS-2026-009` (AML SLA), `ISS-2026-027`, `ISS-2026-061`, `ISS-2026-085` (KFS).
- **Demo coverage:** at minimum the data must support the three full demo storylines from Pass 4 §11 (α KYC/CKYCR via UCIC-2024-00127 + AI-016, β AML SLA / STR via AML-ALRT-2024-00502, γ KFS timing via DL-APP-2024-00884 + AI-013) end-to-end without missing nodes.

---

## 5. Screen-to-Component Mapping

| # | Screen | Main component | Child components | Data consumed | Primary interactions | Drawer usage |
|---|---|---|---|---|---|---|
| **S-01** | Executive Risk Posture Cockpit | `ExecutiveRiskPostureCockpit` | `KPIStrip` (5× `MetricCard`), `RiskDomainHeatmap`, `WhatChangedStrip`, `IssueWatchlistTable` (`DataTable`), `ReportingClockStrip` (`ReportingClockBadge` row), `InspectionReadinessSnapshot`, `SeniorAccountabilitySnapshot` (`SeniorAccountabilityCard` row), `AIInsightPanel` (`AIInsightCard` mini) | `risks`, `riskDomains`, `controls` (CES rollups), `issues`, `auditPacks` (ARS), `seniorManagers`, `aiInsights`, `reportingClocks`, `reportingSubmissions` | Click domain tile → S-06 filtered; click issue → drawer; click ARS lens → S-03; click SM card → drawer SM | `DetailDrawer` for risk/issue/SM |
| **S-02** | What Changed This Week | `WhatChangedThisWeek` | 5× `DeltaBoardColumn`, `NarrativePanel` | `issues` (new), `controls` (CES delta), `aiInsights` (newly fired), `kriObservations`, `reportingSubmissions` | Click delta card → drawer for that entity | `DetailDrawer` |
| **S-03** | Inspection Readiness View | `InspectionReadinessView` | `InspectionLensTabs`, `ReadinessRingCard`, `ReadinessInputsCard`, `ReadinessGapTable` (`DataTable`), `PackCompositionTree`, `AIInsightPanel`, `ScreenActionBar` | `auditPacks`, `inspectionLenses`, `evidenceRecords` (gap derivation), `issues` (open high-risk), `attestationEvents` (missing), `reportingSubmissions` (missing acks), `testExecutions` (failed/not-run) | Click gap → route-to-fix screen (S-08 / S-09 / S-12 / N-09); click lens tab → re-scope | `DetailDrawer` (auditPack); `EvidenceChainDrawer` for evidence gaps |
| **S-04** | Obligation Coverage Map | `ObligationCoverageMap` | `RegulatorGroupFilter` (`FilterChips`), `ObligationListTable` (`DataTable` with `ObligationCoverageBar` rows), `ObligationDrillInPanel` (`RightPanel`), `RegulatoryChangeTimeline` | `obligations`, `regulations`, `controls` (linked + CES), `reportingClocks`, `seniorManagers`, `evidenceRecords` (EIFS roll-up) | Click OBL row → right panel populates; click linked control chip → S-06 | `DetailDrawer` for obligation / control |
| **S-05** | Control Universe | `ControlUniverse` | `FacetFilterRail`, `DistributionSnapshotCard` (CES distribution + OCS), `ControlTable` (`DataTable` rows = `ControlHealthTile`), `BulkActionBar` | `controls`, `controlInstances` (rollups), `evidenceRecords` (rollups) | Click row → S-06; bulk pop-test → S-09 | `DetailDrawer` (control) |
| **S-06** | Control Drill-Down | `ControlDrillDown` | `ControlTabBar` + 6 tabs: Overview (`CESBreakdownCard`, `OutcomeSplitDonut`, `TrendSparkline`, `LinkedObligationStrip`, `LinkedRiskChips`, `ReportingClockStrip`); Population (`PopulationGrid`); Evidence (`EvidenceWorkbenchEmbed`); Issues (`IssueMiniBoard`); AIInsights (`AIInsightsList`); Lineage (`SourceLineageTimeline`) | `controls` (one), `controlInstances`, `evidenceRecords`, `issues`, `aiInsights`, `obligations` (linked), `risks` (linked), `reportingClocks` | Click CI row → `EvidenceChainDrawer`; "Run pop test" → S-09; "Raise Issue" → S-10; "Add to Workpaper" → S-13 | `DetailDrawer` + `EvidenceChainDrawer` |
| **S-07** | Process Health View | `ProcessHealthView` | `ProcessSelector`, `VariantConformanceMap`, `StepLatencyFunnel`, `DriftClusterCards` (AI-002), `LinkedFailingControlsStrip` | `processes`, `processExecutions`, `stepExecutions`, `aiInsights` (AI-002), `controls` (linked) | Click PE → drawer ProcessExecution; click step → drawer StepExecution; drift card → drawer AIInsight | `DetailDrawer` |
| **S-08** | Evidence Workbench | `EvidenceWorkbench` | `EvidenceStatusStrip`, `EvidenceTable` (`DataTable` with `EvidenceCompletenessRing` per row), `StaleEvidenceAlertCard`, `OrphanQueueMiniCard`, `ScreenActionBar` | `evidenceRecords`, `sourceRecords`, `correlationRecords`, `sourceSystems`, `controlInstances` (linked) | Click EVD row → `EvidenceChainDrawer`; "Re-fetch" → demo-state update; "Add to WP" → S-13 | `EvidenceChainDrawer` (primary), `DetailDrawer` for SR / CR |
| **S-09** | Population Testing Console | `PopulationTestingConsole` | `ControlTestSelector`, `TestRunnerPanel`, `TestResultsPanel` (`PopulationTestSummaryCard` + `OutcomeBadge` strip), `ExceptionClusterTable`, `AIInsightPanel`, `TestExecutionHistoryStrip`, `WorkpaperAssemblyBar` | `controls`, `testExecutions`, `exceptions`, `controlInstances` (population), `evidenceRecords`, `aiInsights` (Tier-3 suggest) | Click exception → drawer; "Open in Workpaper" → S-13 with TX preloaded | `DetailDrawer`, `EvidenceChainDrawer` |
| **S-10** | Issue & Remediation Board | `IssueRemediationBoard` | `ClusterSwimlanes`, `IssueTable` (`DataTable`), `IssueDetailRightPanel` (`RightPanel` with sub-tabs: Timeline / Linked / Remediation / Retest), `BulkActionBar` | `issues`, `rootCauseClusters`, `remediationActions`, `controls`, `obligations`, `aiInsights`, `seniorManagers` | Click row → right panel; click linked CTRL → S-06; click remediation → drawer; "Retest" → S-09 | `DetailDrawer` |
| **S-11** | AI Insights Review Queue | `AIInsightsReviewQueue` | `SignalClassStrip`, `AIInsightsListTable`, `AIInsightDetailRightPanel` (sections: Source / Output / Rationale / Recommendation / Decision), `ModelStrip` (model + MRR snapshot), `BulkActionBar` | `aiInsights`, `models`, `modelRiskRecords`, `evidenceRecords`, `controls` (linked) | Accept / Reject / Escalate / Override → demo-state update; "Cite evidence" → `EvidenceChainDrawer` | `DetailDrawer` (aiInsight), `EvidenceChainDrawer` |
| **S-12** | Senior Accountability Ledger | `SeniorAccountabilityLedger` | `SMRoleFilter`, `SMGrid` (`SeniorAccountabilityCard` tiles), `SMDetailRightPanel`, `DecisionAttestationTimeline` (`TimelinePanel`), `ScreenActionBar` | `seniorManagers`, `decisionEvents`, `attestationEvents`, `issues` (accountable), `risks`, `evidenceRecords` (oversight) | Click SM tile → right panel; click decision/attestation → drawer; "Open Attestation" → demo-state | `DetailDrawer` (seniorManager / decisionEvent / attestationEvent) |
| **S-13** | Workpaper / AuditPack Builder | `WorkpaperAuditPackBuilder` | `ModeToggle`, `DocumentOutlinePanel`, `EditingArea`, `LinkedEntitiesPanel`, `ReadinessFlagsStrip`, `ExportBar` | `workpapers`, `auditPacks`, `controls`, `obligations`, `evidenceRecords`, `testExecutions`, `issues`, `attestationEvents`, `aiInsights` | Add/remove linked entity; "Validate readiness" → demo-state; "Export" → toast (no real export) | `DetailDrawer` for linked entities |
| **N-09** | Source Lineage Page | `SourceLineagePage` | `SourceSystemHealthGrid`, `OrphanQueueTable`, `CorrelationWarningTable`, `SchemaVersionTimeline`, `ScreenActionBar` | `sourceSystems`, `sourceSystemHealth`, `correlationRecords` (status ≠ matched), `sourceRecords` (orphan) | Click row → `EvidenceChainDrawer` for the SR / CR | `EvidenceChainDrawer` |

---

## 6. Drill-Down / Drawer Model

### 6.1 `DetailDrawer` routing

- **Inputs (props):** `isOpen`, `entityType`, `entityId`, `sourceScreen`, `drillPath`, `mockData`, `onClose`, `onSelectEntity`, `onNavigateToScreen`, `onAddToWorkpaper`, `onAddToAuditPack`, `onRaiseIssue`.
- **Routing rule:** an internal `entityType → DetailContent` map renders exactly one of the 21 `*DetailContent` components inside `DrawerBody`.
- **Drawer behaviour rules:**
  - Width: ~40% viewport on wide screens; full-width on small.
  - Closes on ESC, click-outside, or explicit close button.
  - Pressing **Back** inside the drawer pops the last entry from `drillPath` and re-renders the drawer with the previous entity (no full-screen navigation).
  - Pressing **Open in [screen]** routes to a full screen via `onNavigateToScreen(screen)` and updates `selectedEntity` so the screen receives anchor.
  - Drawer is **opened by**: any `MetricCard` click, any table-row click in any `DataTable`, any `*Card` click, any node click in `SourceLineageTimeline`, any breadcrumb click, any AI-insight "Cited Evidence" link.
  - Drawer is **never** the right place for a Wave 2/3 entity — those nav items are disabled and emit a toast on click.

### 6.2 `EvidenceChainDrawer` behaviour

- **Specialised drawer** for `drawerMode = evidenceChain`.
- **Anchor entity** (any one of: `evidenceRecord`, `controlInstance`, `issue`, `aiInsight`, `processExecution`) is mandatory; drawer constructs the lineage chain by walking `mockData` references.
- **Lineage spine rendered (top-down):** `Regulation → Obligation → Risk → Control → ProcessExecution → StepExecution → ControlInstance → EvidenceRecord → SourceRecord → CorrelationRecord`.
- **Chain construction algorithm (helper, not state):** start from anchor → resolve anchor's `linked_*_ids` → for each link, fetch parent / child → de-dupe → render in fixed order.
- **Each node shows:** entity ID, type, status badge (`OutcomeBadge` / `StatusBadge`), timestamp (system_time + valid_time), source system (for SR / CR), payload hash (truncated), match confidence (CR), correlation status, chain-of-custody status, readiness flags, audit-trail summary.
- **Actions (`DrawerActionBar`):**
  - Open evidence detail (routes to `DetailDrawer` evidenceRecord — **drawer-in-drawer is not allowed**; instead, switches `drawerMode` to `detail`).
  - Open source record detail (`drawerMode = detail`, `entityType = sourceRecord`).
  - Open correlation record detail (same pattern).
  - Add to workpaper → calls `onAddToWorkpaper(entityRef)`; toast.
  - Add to audit pack → calls `onAddToAuditPack(entityRef)`; toast.
  - Raise evidence-gap issue → opens lightweight inline form; toast on submit; appends to `mockData.issues` for demo continuity.
  - Mark for re-fetch → demo-state update only.
  - Copy lineage summary → clipboard copy of plain-text chain.
- **No real backend calls.** All actions update local demo state and emit toasts.

### 6.3 Entity selection behaviour

| Trigger | Effect |
|---|---|
| Click a row in any `DataTable` | `setSelectedEntity({ entityType, entityId, ... })`; `setDrawerState({ isOpen: true, drawerMode: 'detail', entityType, entityId, sourceScreen, drillPath: [...prev, currentRef] })` |
| Click an aggregate `MetricCard` | If metric drills to one entity → drawer opens; if metric drills to a list (e.g., RES domain → many failing controls) → routes to `S-06` filtered |
| Click a node in `SourceLineageTimeline` | Switches drawer body to that entity's DetailContent; pushes node onto `drillPath` |
| Click "Open Lineage" inside any DetailContent | `setDrawerState({ drawerMode: 'evidenceChain' })` keeping anchor entity |
| Click breadcrumb earlier node | Truncates `drillPath` to that node and re-renders drawer with that entity |
| Click "Open in S-XX" | `onNavigateToScreen(screen)` + `setActiveScreen(screen)` + closes drawer |

### 6.4 `drillPath` behaviour

- `drillPath` is an **append-only stack** within a session of related drills, capped at depth 8 (UI hides deeper nodes behind ellipsis).
- Cleared when user clicks a top-level nav item (intent-change) or persona-switches.
- Persists when user closes the drawer mid-drill so re-opening returns to last context.
- Rendered uniformly by `DrillDownBreadcrumb` in both `ScreenHeader` and `DrawerHeader`.

### 6.5 Two-click evidence drill behaviour

The architecture must satisfy Pass 4 §1.16 — "Aggregate metric → failing control / issue list → source evidence chain" in **at most two clicks** from any aggregate metric to a `SourceRecord`.

| Origin (click 1) | Mid-step (click 2) | Final (drawer state) |
|---|---|---|
| `RiskDomainHeatmap` Red R-FC tile | `Failing Controls` list (`ControlHealthTile` row) → CTRL-AML-002 | `EvidenceChainDrawer` opens with anchor = a failed `controlInstance` (e.g., AML-ALRT-2024-00502); SR/CR visible inside drawer |
| `ObligationCoverageBar` Gap row → OBL-RBI-DL-001 | `Linked Controls` chip → CTRL-LND-002 | `EvidenceChainDrawer` opens with anchor = failed CI (e.g., DL-APP-2024-00884); LOS SR visible inside drawer |
| `AuditPackReadinessCard` Missing-evidence gap | "Open" on gap item | `EvidenceChainDrawer` opens with the missing evidence node highlighted; source-system owner visible |
| `IssueWatchlistTable` row → ISS-2026-085 | `linked_control_ids[0]` chip → CTRL-LND-002 | `EvidenceChainDrawer` opens with anchor = ControlInstance for DL-APP-2024-00884 |
| `AIInsightCard` AI-016 | "Cited Evidence" link | `EvidenceChainDrawer` for the cohort EvidenceRecords with cohort UCICs visible |

> The "click 2" can be **inside** the drawer (e.g., row click within drawer body counts) — the UX still feels like 2 clicks because no full-page navigation occurs.

---

## 7. Interaction Model

### 7.1 Persona switching

- Default `activeScreen` change rule per §3.3 map.
- **Filters preserved**: global `filters` survive persona switch.
- **Time-travel preserved**: `timeTravelState` survives persona switch (per Pass 4 §2.2).
- **Selected entity / drillPath cleared**: persona change is an intent-change.
- **`pinnedScreen`** (interactionState extension): if user has explicitly pinned the current screen, persona switch keeps current screen and only updates colour-scheme / KPI selection.
- **Demo state**: if `guidedModeEnabled = true`, persona switch advances demo step automatically per active storyline.

### 7.2 Navigation

- Click on a nav item in `MainNavigation` calls `setActiveScreen(screen)`.
- Wave 2 / Wave 3 items: disabled state; click triggers a toast "Wave N — requires {SourceSystem} integration"; no state change.
- `interactionState.activeTabByScreen` and `sortStateByTable / paginationStateByTable / expandedRows` survive across navigation so users return to where they were.
- `selectedEntity` and `drillPath` persist across navigation so a user can drill, navigate to another screen, and come back to the same drawer context.
- `filters` global; screens may add screen-local filters via `interactionState.screenLocalFilters[screen]`.

### 7.3 Filtering

- Top-bar filters apply globally; every screen reads from `filters` via helper functions like `applyGlobalFilters(rows, filters)`.
- Screen-local filters merge with global filters (intersection semantics).
- Time-travel filter is **always applied** (helpers compute as-of-window from `timeTravelState`).
- Clearing all filters at top bar resets to defaults but preserves time-travel.

### 7.4 Time travel

- `timeTravelState.mode = 'asOf'` causes every metric helper to receive `asOfDate` and filter `mockData.controlInstances`, `mockData.evidenceRecords`, `mockData.reportingSubmissions`, `mockData.kriObservations`, `mockData.appetiteObservations`, `mockData.auditTrailEvents` such that:
  - `valid_time ≤ asOfDate AND system_time ≤ asOfDate` (or whichever Pass 3 §12 rule the toggle says).
  - `showLateArrivingRecords = true` includes `valid_time ≤ asOfDate AND system_time > asOfDate`.
  - `showHistoricalProjection = true` shows the time-travel projection vs current view side-by-side.
- Time-travel chip shown prominently when active so users do not confuse historical view with live.

### 7.5 Drill-down (composite of §6)

- One uniform pattern: click → `setSelectedEntity` → `setDrawerState({ isOpen: true, drawerMode, entityType, entityId, drillPath })`.
- For lineage drills, `drawerMode = 'evidenceChain'`.
- For all other entity drills, `drawerMode = 'detail'`.
- Two-click evidence drill is the central UX promise (§6.5).

### 7.6 Population testing flow

1. User on `S-09 PopulationTestingConsole`.
2. User selects control via `ControlTestSelector` → updates `selectedEntity` (`entityType: control`).
3. User reviews `TestRunnerPanel` (population query, pass predicate, sampling rationale, as-of-date).
4. User clicks **Run** → demo-state appends a new `testExecutions` row (deterministic) and shows `TestResultsPanel`.
5. User clicks an exception cluster → expands; clicks a specific exception → opens `DetailDrawer` (`exception`).
6. From the drawer, user clicks "Open ControlInstance" → drawer body switches to `controlInstance`.
7. From CI body, user clicks "Open Lineage" → `drawerMode = 'evidenceChain'` → `EvidenceChainDrawer`.
8. User clicks "Add to Workpaper" → demo-state updates current draft workpaper.
9. User clicks `WorkpaperAssemblyBar` → `setActiveScreen('workpaperAuditPackBuilder')`.
10. In S-13, user reviews AI-drafted sections, edits, signs (demo) → readiness flags update.
11. User adds Workpaper to AuditPack via `LinkedEntitiesPanel` → demo-state updates.

### 7.7 Senior accountability flow

1. User on `S-12 SeniorAccountabilityLedger`.
2. Click `SeniorAccountabilityCard` → `RightPanel` populates (Scope / Open Issues / Decisions / Attestations / Reasonable-oversight).
3. Click an open issue → `DetailDrawer` (`issue`); from drawer, click `linked_control_ids` → drawer switches to `control`.
4. Click a `decisionEvent` → drawer (`decisionEvent`); cited evidence list → `EvidenceChainDrawer`.
5. Click an `attestationEvent` → drawer (`attestationEvent`); add **reasonable-oversight note** → demo-state appends to attestation; SAES recomputes via helper; SM card SAES ring updates.
6. If `accountability_gap_flag` triggers (helper rule), `AlertBanner` appears in S-12.

### 7.8 AI insight flow

1. User on `S-11 AIInsightsReviewQueue`.
2. Filter by signal class via `SignalClassStrip` → list filters.
3. Click a row → `AIInsightDetailRightPanel` populates with five sub-blocks (Source / Output / Rationale / Recommendation / Decision).
4. Decision row supports: **Accept**, **Reject** (mandatory rejection reason), **Escalate** (target = PERSONA-001), **Override-with-reason**.
5. **Accept** → demo-state updates `aiInsight.human_approval_status = 'accepted'`; if signal class is `Cluster-RCA`, an Issue is auto-created (or linked) and appears in S-10 swimlanes.
6. **Reject** → status `rejected`; AITES trends down; auto-action on this signal class is suppressed for the demo.
7. **Escalate** → status `escalated`; appears in S-01 cockpit AI panel for PERSONA-001.
8. **Override-with-reason** → status `overridden`; mandatory `human_approval_reason`.
9. **Cite Evidence** → `EvidenceChainDrawer` opens with cited evidence chain.
10. **Model strip** click → MRR snapshot drawer (`drawerMode = 'detail'`, `entityType = 'aiInsight'` extended with model + mrr context).
11. **Auto-action gating**: if a model's AITES < 85, helper disables auto-creation of Issues; UI shows a chip "Auto-action disabled — model under MRM remediation".

### 7.9 AuditPack flow

1. User on `S-13 WorkpaperAuditPackBuilder`, mode = AuditPack.
2. User selects inspection lens via `ReadinessFlagsStrip` (RBI AFI / RBS-SPARC / PMLA-FIU / ITGRCA-CSITE / Concurrent / Statutory / Board).
3. `DocumentOutlinePanel` shows lens-specific required sections; user fills via AI-draft + edit; `LinkedEntitiesPanel` exposes Obligations / Controls / Evidence / Issues / Workpapers / Attestations / AIInsights / ReportingSubmissions; drag/click adds.
4. `EditingArea` central; AI narrative editable.
5. User clicks "Validate readiness" → helper computes ARS by component (per Pass 4 §8.1); `ReadinessFlagsStrip` updates per lens.
6. **Export**: enabled only at green; click → toast "Pack exported (demo) — content hash computed"; demo-state appends `audit_pack.exported_at` + `content_hash`.
7. Chain-of-custody manifest appears below the export bar showing every evidence ID + hash + retention class + retrieval timestamp + readiness flags.
8. AI narrative lineage is traceable: every AI-drafted paragraph carries citations (entity refs) so reviewer can click → `EvidenceChainDrawer`.

---

## 8. Implementation Notes for Final JSX

### 8.1 Recommended file structure

```
frontend/
└── lib/
    └── indianbankingaudit/
        ├── IndianBankingAuditApp.jsx            ← single .jsx file (or .tsx if you prefer)
        └── mockIndianBankingAuditData.js        ← single export of mockData
```

### 8.2 Inside `IndianBankingAuditApp.jsx`

- **Imports**: React + `useState` + `useMemo`; `mockData` from the data file.
- **One root function `App`** that owns all 9 state slots from §3.1.
- **Helper functions** (top of file, module-scope; not React state):
  - `defaultScreenForPersona(persona)`
  - `applyGlobalFilters(rows, filters, timeTravelState)`
  - `computeRES(domainId, mockData, filters, timeTravelState)`
  - `computeCES(controlId, mockData, filters, timeTravelState)` — applies the formula `0.40 × OperatingRate + 0.40 × CatchRate + 0.20 × EvidenceCompleteness`
  - `computeARS(lensId, mockData, filters, timeTravelState)`
  - `computeOCS(filters, mockData)` / `computeEIFS(...)` / `computeDCQS(...)` / `computePVDS(...)` / `computeRTS(...)` / `computeSAES(smId, ...)` / `computeAITES(modelId, ...)`
  - `resolveLineageChain(anchorEntity, mockData)` — returns ordered nodes for `EvidenceChainDrawer`.
  - `severityColor(value)` / `outcomeColor(outcome)` / `statusColor(status)` — return Tailwind classes (kept in §8.5).
  - `formatDate(iso)` / `daysSince(iso, asOfDate)` — display utilities.
  - `isWaveEnabled(navItem)` — guards Wave 2/3 clicks.
- **Component definitions** in this order to keep readable:
  1. Atoms: `StatusBadge`, `OutcomeBadge`, `MetricCard`, `TrendSparkline`, `EvidenceCompletenessRing`, `ReportingClockBadge`, `SourceSystemHealthBadge`, `EmptyState`, `AlertBanner`, `SectionCard`, `FilterChips`, `DrillDownBreadcrumb`.
  2. Molecules: `DataTable`, `RightPanel`, `TimelinePanel`, `EvidenceProvenancePanel`, `AuditTrailPanel`, `RiskDomainHeatmap`, `ControlHealthTile`, `CESBreakdownCard`, `ObligationCoverageBar`, `SourceLineageTimeline`, `ProcessStepTimeline`, `PopulationTestSummaryCard`, `ExceptionClusterTable`, `WorkpaperStatusCard`, `AuditPackReadinessCard`, `AIInsightCard`, `HumanReviewQueueItem`, `SeniorAccountabilityCard`.
  3. DetailContent components (21 small components).
  4. Drawers: `DetailDrawer`, `EvidenceChainDrawer`.
  5. ActiveScreens (14).
  6. Shell: `MainNavigation`, `TopBar`, `AppShell`, finally `App`.

### 8.3 Render strategy

- **`AppShell`** uses a simple conditional render switch on `activeScreen` (no router). One-liner per screen e.g.,
  - `if (activeScreen === 'riskPosture') return <ExecutiveRiskPostureCockpit ... />`
  - … repeat for 14 screens.
- **`DetailDrawer`** mounted at root; renders only when `drawerState.isOpen && drawerMode === 'detail'`.
- **`EvidenceChainDrawer`** mounted at root; renders only when `drawerState.isOpen && drawerMode === 'evidenceChain'`.
- **No portals required**; Tailwind's `fixed inset-y-0 right-0` is enough for drawer positioning.

### 8.4 Deriving metrics from mock data

- All metrics are **computed via helpers**, never stored on the mock objects, so a single source of truth (the `controlInstances`, `evidenceRecords`, `auditTrailEvents` arrays) drives every screen.
- Cache results with `useMemo` keyed on `[mockData, filters, timeTravelState]` at `App` root; pass derived metrics down as props rather than recomputing inside children.
- For demo determinism, helpers are pure and synchronous; no `useEffect`, no async.
- For storyline-specific glow/highlight, helpers consult `demoState` (e.g., return `highlight: true` for a specific record id).

### 8.5 Status / outcome / readiness colour mapping (Tailwind tokens — placeholder only; NOT to be written yet)

| Concept | Tailwind class hint (do **not** write yet — the next pass picks tokens) |
|---|---|
| Pass | green-* |
| Fail / Control Failure | red-* |
| Data Gap | purple-* (or zinc-*) |
| Evidence Gap | amber-* |
| Correlation Warning | orange-* |
| Needs Review | sky-* (or blue-*) |
| Not Applicable | neutral-* |
| BPO-Pending | striped amber via repeating-linear-gradient |
| AI auto-action threshold | red-* with cyan-* edge |
| AI review threshold | sky-* with cyan-* edge |
| RES / CES / ARS thresholds | green ≥80, amber 60–79, red <60, neutral grey for "insufficient data" |

### 8.6 Active-screen rendering (concrete pattern)

| Screen value (`activeScreen`) | Rendered component | Notes |
|---|---|---|
| `riskPosture` | `ExecutiveRiskPostureCockpit` | landing for `cro` |
| `whatChanged` | `WhatChangedThisWeek` | |
| `inspectionReadiness` | `InspectionReadinessView` | |
| `obligationCoverage` | `ObligationCoverageMap` | landing for `compliance` |
| `controlUniverse` | `ControlUniverse` | |
| `controlDrillDown` | `ControlDrillDown` | requires `selectedEntity.entityType === 'control'`; falls back to ControlUniverse if missing |
| `processHealth` | `ProcessHealthView` | landing for `operations` |
| `evidenceWorkbench` | `EvidenceWorkbench` | |
| `populationTesting` | `PopulationTestingConsole` | landing for `audit` |
| `issueBoard` | `IssueRemediationBoard` | |
| `aiInsights` | `AIInsightsReviewQueue` | |
| `accountability` | `SeniorAccountabilityLedger` | |
| `workpaperAuditPackBuilder` | `WorkpaperAuditPackBuilder` | reads `interactionState.activeTabByScreen.workpaperAuditPackBuilder` for mode |
| `sourceLineage` | `SourceLineagePage` | extends D-01 |

### 8.7 Drawer rendering (concrete pattern)

- Always mount both drawers at AppShell root; render conditionally on `drawerState.isOpen` and `drawerMode`.
- Avoid drawer-in-drawer; instead, switch `drawerMode` and update `entityType / entityId / drillPath`.
- Drawer body resolves `entityType` via a single in-component `entityType → DetailContent` map (`{ risk: RiskDetailContent, … }`), which keeps the drawer file small.
- `EvidenceChainDrawer` invokes `resolveLineageChain(anchor, mockData)` and renders the resulting node list via `SourceLineageTimeline` plus `EvidenceProvenancePanel` and `AuditTrailPanel`.

### 8.8 How to avoid over-engineering

- **No router.** Use `activeScreen` switch.
- **No context.** Pass props; the file is single-screen-focused for the demo.
- **No external chart libraries.** Use div-based bars, rings, and sparklines.
- **No external animation library.** Use simple CSS transitions on drawer open/close.
- **No backend, no API, no `useEffect` for data loading.** Mock data is imported synchronously at module load.
- **No dynamic schema renderer.** Each `*DetailContent` is a small, hand-written component because the entity shapes differ.
- **No deep prop-drilling.** Components above depth 3 receive an `appProps` object (object containing `mockData`, all setters, all state); the rest destructure as needed. (This is a controlled compromise over context for demo simplicity.)
- **No premature performance work.** `useMemo` is enough; do not virtualise tables until the prototype has live mock data and a real perf signal.
- **No bespoke icon system.** Use a single icon library (e.g., lucide-react) consistently.

### 8.9 Demo-state strategy

- `demoState.guidedModeEnabled` toggled from a small button in `TopBar`.
- `mockData.demoStorylines` drives the `DemoGuidedTourOverlay` which:
  - Shows current step text + persona icon.
  - Highlights the target record / metric via `demoState.highlightedRecord` / `highlightedMetric`.
  - Auto-advances on the expected click; manual "Next" / "Back" buttons available.
- Storyline progression updates `selectedEntity` / `drawerState` programmatically, so the demo can run hands-off.
- Five storylines must work end-to-end without missing nodes:
  1. `kycCkycrGap` — UCIC-2024-00127, AI-016, CTRL-KYC-003.
  2. `amlAlertSlaStrRisk` — AML-ALRT-2024-00502, ISS-2026-009, CTRL-AML-002, AI-018.
  3. `digitalLendingKfsViolation` — DL-APP-2024-00884, AI-013, ISS-2026-085, CTRL-LND-002.
  4. `inspectionReadinessPack` — RBI AFI lens; gaps drill to S-08 / S-09 / S-12; readiness improves after action.
  5. `populationTestingToWorkpaper` — generic auditor flow ending in S-13 export.

### 8.10 Final consistency checklist (review before writing JSX)

- [ ] All sample IDs from Pass 2 / Pass 4 are present in the schemas above and reused in storylines.
- [ ] Every entity referenced by a screen exists in `mockData`.
- [ ] Two-click evidence drill is achievable from at least: every Risk-domain tile, every OBL row, every CES card, every Issue row, every AIInsight row, every AuditPack gap.
- [ ] `EvidenceChainDrawer` renders the full Reg → SR → CR spine for every anchor type.
- [ ] All five demo storylines have complete data paths.
- [ ] No Wave 2 / Wave 3 entity types are wired into the drawer routing.
- [ ] No screen owns persistent state outside `interactionState`.
- [ ] All AI HITL actions update `aiInsight.human_approval_status` deterministically.
- [ ] All artefact exports are demo-only (toast + content_hash + exported_at update).
- [ ] All metrics drill to evidence in ≤2 clicks.
- [ ] No UK regulatory terminology anywhere.
- [ ] No generic GRC verbs ("manage controls", "track issues") — use Indian banking verbs (population-test, attest, file STR within 7 BD, certify CIMS quarterly).

---

### Final summary

This Pass 5 architecture is a **thin, single-file-friendly React frontend** atop a deterministic `mockData` object. It enforces:

- One **`App`** with 9 `useState` slots and pure helper functions for every metric.
- One **`AppShell`** with a 14-screen switch on `activeScreen`.
- One **universal `DetailDrawer`** routing 21 entity-typed `DetailContent` components.
- One **specialised `EvidenceChainDrawer`** for lineage that satisfies Pass 4 §1.16's two-click evidence rule.
- One **`mockIndianBankingAuditData.js`** with 42 datasets, stable IDs, and full coverage of the Pass 2 / Pass 4 sample IDs and the five demo storylines.

The next pass — **UI Pass 6: Mock Data + JSX Prototype** — should populate `mockData` per §4 schemas using the canonical IDs and storylines, and write `IndianBankingAuditApp.jsx` per §8 (one file, atoms → molecules → details → drawers → screens → shell → App). Once Pass 6 lands and demos cleanly to a CRO / CCO / Internal Audit audience, Wave 1 production build can begin against the real CBS / LOS / AML engine / Sanctions / Case Mgmt / CKYCR connectors per Pass 3 §13 handoff.
