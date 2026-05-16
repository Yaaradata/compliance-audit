// @ts-nocheck
'use client';

import React, { useState, useMemo, useCallback, useReducer } from 'react';
import mockDataV2 from '@/lib/ukbankingaudit/mockDataV2';
import mockDataV3 from '@/lib/ukbankingaudit/mockDataV3';
import {
  getUkAuditUi,
  computeRssScore,
  WhatChangedFromLastReview,
  RssDecomposition,
  GeneratedNarrative,
} from '@/components/UKBankingAudit/v3';

let personas, navigationItems, croCategories, risks, controls, obligations,
  processes, processSteps, smfHolders, actors, kris, riskAppetiteMetrics,
  consumerOutcomes, importantBusinessServices, coverageGaps,
  controlInstances, evidenceRecords, exceptions, issues, remediationActions,
  tests, workpapers, auditPacks, aiInsights, auditTrailEvents, metrics,
  riskAreas, controlObjectives, groupSetRequirements,
  crsaAttestationCycles, crsaAttestationLines,
  firmLevelRAG, whatChangedThisWeek,
  horizonScanItems, findingsLedger,
  amlAlertsByWeek, sarFilingsByWeek, eddPipelineItems,
  sanctionsScreeningMetrics, capacityVsDemandSeries;

let activeUkUi = getUkAuditUi('v2');

function bindUkMock(mock, variant = 'v2') {
  personas = mock.personas;
  navigationItems = mock.navigationItems;
  croCategories = mock.croCategories;
  risks = mock.risks;
  controls = mock.controls;
  obligations = mock.obligations;
  processes = mock.processes;
  processSteps = mock.processSteps;
  smfHolders = mock.smfHolders;
  actors = mock.actors;
  kris = mock.kris;
  riskAppetiteMetrics = mock.riskAppetiteMetrics;
  consumerOutcomes = mock.consumerOutcomes;
  importantBusinessServices = mock.importantBusinessServices;
  coverageGaps = mock.coverageGaps;
  controlInstances = mock.controlInstances;
  evidenceRecords = mock.evidenceRecords;
  exceptions = mock.exceptions;
  issues = mock.issues;
  remediationActions = mock.remediationActions;
  tests = mock.tests;
  workpapers = mock.workpapers;
  auditPacks = mock.auditPacks;
  aiInsights = mock.aiInsights;
  auditTrailEvents = mock.auditTrailEvents;
  metrics = mock.metrics;
  riskAreas = mock.riskAreas;
  controlObjectives = mock.controlObjectives;
  groupSetRequirements = mock.groupSetRequirements;
  crsaAttestationCycles = mock.crsaAttestationCycles;
  crsaAttestationLines = mock.crsaAttestationLines;
  firmLevelRAG = mock.firmLevelRAG;
  whatChangedThisWeek = mock.whatChangedThisWeek;
  horizonScanItems = mock.horizonScanItems;
  findingsLedger = mock.findingsLedger;
  amlAlertsByWeek = mock.amlAlertsByWeek;
  sarFilingsByWeek = mock.sarFilingsByWeek;
  eddPipelineItems = mock.eddPipelineItems;
  sanctionsScreeningMetrics = mock.sanctionsScreeningMetrics;
  capacityVsDemandSeries = mock.capacityVsDemandSeries;
  activeUkUi = getUkAuditUi(variant);
}

bindUkMock(mockDataV2, 'v2');

// ─── Helper: lookups ──────────────────────────────────────────────────────
const findById = (arr, id) => (arr || []).find(x => x.id === id) || null;
const getRisk = (id) => findById(risks, id);
const getControl = (id) => findById(controls, id);
const getObligation = (id) => findById(obligations, id);
const getIssue = (id) => findById(issues, id);
const getEvidence = (id) => findById(evidenceRecords, id);
const getSMF = (id) => findById(smfHolders, id);
const getActor = (id) => findById(actors, id);
const getProcessStep = (id) => findById(processSteps, id);
const getProcess = (id) => findById(processes, id);
const getKRI = (id) => findById(kris, id);
const getAppetite = (id) => findById(riskAppetiteMetrics, id);
const getControlInstance = (id) => findById(controlInstances, id);
const getException = (id) => findById(exceptions, id);
const getRemediation = (id) => findById(remediationActions, id);
const getTest = (id) => findById(tests, id);
const getWorkpaper = (id) => findById(workpapers, id);
const getAuditPack = (id) => findById(auditPacks, id);
const getInsight = (id) => findById(aiInsights, id);
const getCoverageGap = (id) => findById(coverageGaps, id);
// Pass 7.0 — CRSA entity getters
const getRiskArea = (id) => findById(riskAreas, id);
const getControlObjective = (id) => findById(controlObjectives, id);
const getGSR = (id) => findById(groupSetRequirements, id);
const getCRSACycle = (id) => findById(crsaAttestationCycles, id);
const getAttestationLine = (id) => findById(crsaAttestationLines, id);
const getCROCategory = (id) => CRO_CATEGORIES[id] || (croCategories || []).find(c => c.id === id) || null;

// ─── Tone classes ─────────────────────────────────────────────────────────
const bandBg = (band) => ({
  red: "bg-rose-50 border-rose-300 text-rose-900",
  amber: "bg-amber-50 border-amber-300 text-amber-900",
  green: "bg-emerald-50 border-emerald-300 text-emerald-900",
  neutral: "bg-slate-50 border-slate-300 text-slate-700",
}[band] || "bg-slate-50 border-slate-300 text-slate-700");

const bandDot = (band) => ({
  red: "bg-rose-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  neutral: "bg-slate-400",
}[band] || "bg-slate-400");

const bandText = (band) => ({
  red: "text-rose-700",
  amber: "text-amber-700",
  green: "text-emerald-700",
  neutral: "text-slate-600",
}[band] || "text-slate-600");

const bandBar = (band) => ({
  red: "bg-rose-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  neutral: "bg-slate-400",
}[band] || "bg-slate-400");

const trendArrow = (trend) => ({
  improving: "↘",
  stable: "→",
  worsening: "↗",
  rapidly_worsening: "⇗",
}[trend] || "→");

const trendTone = (trend) => ({
  improving: "text-emerald-600",
  stable: "text-slate-500",
  worsening: "text-amber-600",
  rapidly_worsening: "text-rose-600",
}[trend] || "text-slate-500");

const severityBadge = (s) => ({
  critical: "bg-rose-100 text-rose-800 border border-rose-300",
  high: "bg-rose-100 text-rose-800 border border-rose-300",
  medium: "bg-amber-100 text-amber-800 border border-amber-300",
  low: "bg-slate-100 text-slate-700 border border-slate-300",
}[s] || "bg-slate-100 text-slate-700 border border-slate-300");

// ─── Tiny SVG sparkline ───────────────────────────────────────────────────
const Sparkline = ({ series = [], band = "neutral", width = 120, height = 30, fill = false }) => {
  if (!series.length) return <div className="h-[30px]" />;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stroke = { red: "#e11d48", amber: "#d97706", green: "#059669", neutral: "#64748b" }[band] || "#64748b";
  const fillColor = { red: "#fee2e2", amber: "#fef3c7", green: "#d1fae5", neutral: "#f1f5f9" }[band] || "#f1f5f9";
  const points = series.map((v, i) => {
    const x = (i / (series.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const fillPath = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && <polygon points={fillPath} fill={fillColor} />}
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ─── Status badge ─────────────────────────────────────────────────────────
const StatusBadge = ({ tone = "neutral", label, size = "sm" }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${size === "xs" ? "text-[10px]" : "text-xs"} font-medium ${bandBg(tone)}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${bandDot(tone)}`} />
    {label}
  </span>
);

// ─── Time-bound RAG badge (Pass 7.2) ──────────────────────────────────────
// Visually distinct from a static red — affordance is "managed-failure-on-plan",
// not "observed failure". Dashed border + clock icon + "[BAND] until DD-MMM" copy.
// Optional milestoneNarrative renders beneath; pass it on the CRO tile, not here.
const TimeBoundRAGBadge = ({ band = "red", untilDate, size = "sm" }) => {
  if (!untilDate) return null;
  const d = new Date(untilDate);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mmm = d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
  const formatted = `${dd}-${mmm}`;
  const tone = bandBg(band);
  const dot = bandDot(band);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-dashed px-2.5 py-0.5 ${size === "xs" ? "text-[10px]" : "text-[11px]"} font-bold tracking-tight ${tone}`}>
      <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5v3.5l2.2 1.4" strokeLinecap="round" />
      </svg>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="uppercase">{band} until {formatted}</span>
    </span>
  );
};

// ─── Pass 7.3 primitives (CRSA-anchored monitoring) ───────────────────────
// All four are co-located with the rest of the primitive cluster so they
// stay close to Sparkline / StatusBadge / TimeBoundRAGBadge for discoverability.

// RACMRefBadge — small mono-font pill for AREA.RISK.OBJ.REQ (e.g. AML.01.05.02).
const RACMRefBadge = ({ racmRef, size = "sm" }) => {
  if (!racmRef) return null;
  const cls = size === "xs"
    ? "text-[10px] px-1.5 py-0"
    : "text-[11px] px-2 py-0.5";
  return (
    <span className={`inline-block rounded border border-slate-300 bg-slate-50 ${cls} font-mono tracking-tight text-slate-700`}>
      {racmRef}
    </span>
  );
};

// CoverageMetric — mandatory above-the-fold metric on every monitoring /
// attestation surface. Per spec §2.4 the differentiator is "Coverage: 100% of
// population (n=…)" — sampled / partial fall back to less-prominent copy.
const CoverageMetric = ({ mode = "full", populationSize = 0, size = "md" }) => {
  const n = populationSize ? populationSize.toLocaleString("en-GB") : "—";
  const cls = size === "lg"
    ? "text-base px-4 py-2"
    : size === "sm"
    ? "text-[11px] px-2 py-1"
    : "text-xs px-3 py-1.5";
  if (mode === "full") {
    return (
      <span className={`inline-flex items-center gap-2 rounded-md border-2 border-emerald-300 bg-emerald-50 ${cls} font-semibold text-emerald-900`}>
        <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6L7 10.5 4.5 8l1-1L7 8.5 10.5 5l1 1z" />
        </svg>
        <span>Coverage: 100% of population (n={n})</span>
      </span>
    );
  }
  if (mode === "sampled") {
    return (
      <span className={`inline-flex items-center gap-2 rounded-md border-2 border-amber-300 bg-amber-50 ${cls} font-semibold text-amber-900`}>
        <span>Coverage: sampled · n={n} (source-system access partial)</span>
      </span>
    );
  }
  // partial
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border-2 border-amber-300 bg-amber-50 ${cls} font-semibold text-amber-900`}>
      <span>Coverage: partial · n={n} (expand-sample available)</span>
    </span>
  );
};

// ApplicabilityBadge — applicable / not_applicable / conditional.
const ApplicabilityBadge = ({ value = "applicable" }) => {
  const map = {
    applicable:     { label: "Applicable",     tone: "emerald" },
    not_applicable: { label: "Not Applicable", tone: "slate" },
    conditional:    { label: "Conditional",    tone: "amber" },
  }[value] || { label: value, tone: "slate" };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-${map.tone}-100 text-${map.tone}-800 border border-${map.tone}-200`}>
      {map.label}
    </span>
  );
};

// OneLTwoLPair — paired-row component mirroring the CRSA per-area sheet
// column layout (1L ← left, 2L → right). Used inside the Per-Requirement
// Attestation View. Frequency / Nature-and-Approach values resolve from the
// FREQUENCY / NATURE_AND_APPROACH enum maps.
const OneLTwoLPair = ({ oneL, twoL, oneLEvidence = [] }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {/* 1L — left */}
    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-800">{LINE_OF_DEFENCE['1L'].label}</span>
        <span className="text-[10px] text-slate-500">— operates the control</span>
      </div>
      {oneL ? (
        <div className="space-y-2.5 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Control Activity Undertaken</div>
            <p className="text-slate-800 leading-relaxed">{oneL.controlActivity || "—"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <KVRow k="Responsibility" v={oneL.responsibilityRole || "—"} />
            <KVRow k="Frequency" v={(FREQUENCY[oneL.frequency] && FREQUENCY[oneL.frequency].label) || "—"} />
            <KVRow k="Nature & Approach" v={(NATURE_AND_APPROACH[oneL.natureAndApproach] && NATURE_AND_APPROACH[oneL.natureAndApproach].label) || "—"} />
            <KVRow k="Coverage Mode" v={oneL.coverageMode || "—"} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Execution Evidence</div>
            {oneLEvidence.length ? (
              <ul className="text-slate-700 list-disc list-inside text-[11px] space-y-0.5">
                {oneLEvidence.map(eid => <li key={eid}>{eid}</li>)}
              </ul>
            ) : (
              <p className="text-slate-500 text-[11px]">No evidence references attached at this stage.</p>
            )}
          </div>
        </div>
      ) : <EmptyState message="No 1L block on this line." />}
    </div>

    {/* 2L — right */}
    <div className="rounded-xl border-2 border-violet-200 bg-violet-50/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] uppercase tracking-wider font-bold text-violet-800">{LINE_OF_DEFENCE['2L'].label}</span>
        <span className="text-[10px] text-slate-500">— tests 1L operating it</span>
      </div>
      {twoL ? (
        <div className="space-y-2.5 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Monitoring &amp; Assurance Activity</div>
            <p className="text-slate-800 leading-relaxed">{twoL.monitoringActivity || "—"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <KVRow k="Responsibility" v={twoL.responsibilityRole || "—"} />
            <KVRow k="Frequency" v={(FREQUENCY[twoL.frequency] && FREQUENCY[twoL.frequency].label) || "—"} />
          </div>
        </div>
      ) : <EmptyState message="No 2L monitoring activity on this line." />}
    </div>
  </div>
);

const EntityTypeBadge = ({ type }) => {
  const map = { risk: "RISK", control: "CONTROL", obligation: "OBLIGATION", issue: "ISSUE", evidence: "EVIDENCE", smf: "SMF", auditPack: "MONITORING REPORT", aiInsight: "AI INSIGHT", kri: "KRI" };
  const tone = { risk: "rose", control: "indigo", obligation: "purple", issue: "amber", evidence: "sky", smf: "emerald", auditPack: "slate", aiInsight: "violet", kri: "cyan" }[type] || "slate";
  return <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider bg-${tone}-100 text-${tone}-800 border border-${tone}-200`}>{map[type] || type}</span>;
};

// ─── Three-dim signal bars (the AML-C002 visualisation) ───────────────────
const ThreeDimSignalBars = ({ threeDim }) => {
  if (!threeDim) return null;
  const dims = [
    { key: "operating", label: "Operating Rate", desc: "Did the control fire when expected?", data: threeDim.operating },
    { key: "catch", label: "Catch Rate", desc: "Did it catch what it was designed to catch?", data: threeDim.catch },
    { key: "evidence", label: "Evidence Completeness", desc: "Is the evidence captured to standard?", data: threeDim.evidence },
  ];
  return (
    <div className="space-y-3">
      {dims.map(d => (
        <div key={d.key} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">{d.label}</div>
              <div className="text-xs text-slate-500">{d.desc}</div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${bandText(d.data.band)}`}>{d.data.current}</div>
              <div className={`text-xs ${trendTone(d.data.trend)}`}>{trendArrow(d.data.trend)} {d.data.trend.replace("_", " ")}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${bandBar(d.data.band)} transition-all`} style={{ width: `${d.data.current}%` }} />
            </div>
            <Sparkline series={d.data.series} band={d.data.band} width={100} height={26} fill />
          </div>
        </div>
      ))}
    </div>
  );
};


// ============================================================================
// Pass 7.0 — Enumerations (verbatim from CRSA Tables sheet)
// ============================================================================

// Frequency — 11 values, exact CRSA Tables-sheet wording preserved as label
const FREQUENCY = {
  daily:            { id: 'daily',            label: 'Daily' },
  weekly:           { id: 'weekly',           label: 'Weekly' },
  every_two_weeks:  { id: 'every_two_weeks',  label: 'Every Two Weeks' },
  monthly:          { id: 'monthly',          label: 'Monthly' },
  every_two_months: { id: 'every_two_months', label: 'Every Two Months' },
  quarterly:        { id: 'quarterly',        label: 'Quarterly' },
  six_monthly:      { id: 'six_monthly',      label: 'Six-Monthly' },
  annually:         { id: 'annually',         label: 'Annually' },
  ad_hoc:           { id: 'ad_hoc',           label: 'Ad-Hoc, As Required' },
  other:            { id: 'other',            label: 'Other (include details)' },
  never:            { id: 'never',            label: 'Never' },
};

// Nature & Approach — 7 values, exact CRSA Tables-sheet wording preserved
const NATURE_AND_APPROACH = {
  manual_preventative:    { id: 'manual_preventative',    label: 'Manual - Preventative' },
  manual_detective:       { id: 'manual_detective',       label: 'Manual - Detective' },
  manual_corrective:      { id: 'manual_corrective',      label: 'Manual - Corrective' },
  automatic_preventative: { id: 'automatic_preventative', label: 'Automatic - Preventative' },
  automatic_detective:    { id: 'automatic_detective',    label: 'Automatic - Detective' },
  automatic_corrective:   { id: 'automatic_corrective',   label: 'Automatic - Corrective' },
  not_applicable:         { id: 'not_applicable',         label: 'Not Applicable' },
};

// Line of Defence
const LINE_OF_DEFENCE = {
  '1L': { id: '1L', label: '1st Line of Defence' },
  '2L': { id: '2L', label: '2nd Line of Defence — Monitoring & Assurance' },
  '3L': { id: '3L', label: '3rd Line of Defence — Internal Audit' },
};

// CRO Categories — 5 fixed, brief-mandated UK CRO taxonomy
const CRO_CATEGORIES = {
  financial:             { id: 'financial',             label: 'Financial Risk',
                           scope: 'Capital adequacy, liquidity, ICAAP / ILAAP / ICARA' },
  regulatory:            { id: 'regulatory',            label: 'Regulatory Risk',
                           scope: 'Compliance with FCA / PRA / PSR mandates in jurisdictions of operation' },
  conduct:               { id: 'conduct',               label: 'Conduct Risk',
                           scope: 'SMCR conduct rules, Consumer Duty (PRIN 12), vulnerable customer treatment' },
  fraud_financial_crime: { id: 'fraud_financial_crime', label: 'Fraud & Financial Crime Risk',
                           scope: 'AML / KYC / Sanctions / internal + external fraud' },
  cyber_op_resilience:   { id: 'cyber_op_resilience',   label: 'Cyber & Operational Resilience Risk',
                           scope: 'DORA-equivalent, third-party concentration, BCP, model risk, cyber' },
};

// ============================================================================
// Pass 7.0 — Single useReducer state shape (per spec §5.4, verbatim)
// ============================================================================

const initialUI = {
  activePersona: 'cro',                  // 'cro'|'head_of_erm'|'smf16'|'smf17' (Pass 7.1 — 4-persona array surfaced)
  activeScreen: 'croBoardView',          // Pass 7.2 — was 'riskPosture' (CRORiskPostureCockpit deleted).
  drawer: { isOpen: false, entityType: null, entityId: null, sourceScreen: null, drillPath: [] },
  timeTravel: { mode: 'live', asOfDate: null },
  filterCROCategoryId: null,             // replaces filterDomain
  selection: {
    smfId: 'SMF17-PRIYA-PATEL',
    packId: 'AP-S165-FCC-001',
    testId: 'TEST-Q2-AML-002',
    cycleId: 'CYC-Q2-2026-AML',          // new
    gsrId: null,                         // new
    attestationLineId: null,             // new
    riskAreaId: null,                    // Pass 7.3 — drives LeadershipControlUniverse area-drill mode
  },
  pendingDecision: { id: null, rationale: '' },
};

// Lazy initializer: seeds smfTrails from smfHolders (preserves Pass 6 mutable pattern).
function initState() {
  const trails = {};
  smfHolders.forEach(s => {
    trails[s.id] = {
      awaiting: [...s.awaitingAcknowledgements],
      trail: [...s.reasonableStepsTrail],
      rss: { ...s.rss, components: { ...s.rss.components } },
    };
  });
  return {
    ui: { ...initialUI },
    domain: { smfTrails: trails },
  };
}

// ─── Reducer (action set per spec §5.4 + 3 minimal companion actions for legacy
//     selectedSMFId / selectedPackId / selectedTestId, flagged in read-out) ────
function reducer(state, action) {
  switch (action.type) {
    case 'SWITCH_PERSONA': {
      const p = (personas || []).find(x => x.id === action.personaId);
      // Pass 7.1 — new persona shape uses `defaultScreenId`.
      const nextScreen = p?.defaultScreenId || p?.defaultScreen || state.ui.activeScreen;
      return {
        ...state,
        ui: {
          ...state.ui,
          activePersona: action.personaId,
          activeScreen: nextScreen,
          drawer: { isOpen: false, entityType: null, entityId: null, sourceScreen: null, drillPath: [] },
        },
      };
    }
    case 'SET_ACTIVE_SCREEN':
      return { ...state, ui: { ...state.ui, activeScreen: action.screen } };

    case 'OPEN_DRAWER':
      return {
        ...state,
        ui: {
          ...state.ui,
          drawer: {
            isOpen: true,
            entityType: action.entityType,
            entityId: action.entityId,
            sourceScreen: action.sourceScreen,
            drillPath: [],
          },
        },
      };

    case 'DRILL_FROM_DRAWER': {
      const prev = state.ui.drawer;
      const currentEntity = resolveEntity(prev.entityType, prev.entityId);
      const label = currentEntity?.title || currentEntity?.name || prev.entityId;
      return {
        ...state,
        ui: {
          ...state.ui,
          drawer: {
            ...prev,
            drillPath: [...prev.drillPath, { type: prev.entityType, id: prev.entityId, label }],
            entityType: action.entityType,
            entityId: action.entityId,
          },
        },
      };
    }

    case 'DRILL_BACK': {
      const prev = state.ui.drawer;
      if (!prev.drillPath.length) {
        return { ...state, ui: { ...state.ui, drawer: { ...prev, isOpen: false } } };
      }
      const last = prev.drillPath[prev.drillPath.length - 1];
      return {
        ...state,
        ui: {
          ...state.ui,
          drawer: {
            ...prev,
            entityType: last.type,
            entityId: last.id,
            drillPath: prev.drillPath.slice(0, -1),
          },
        },
      };
    }

    case 'CLOSE_DRAWER':
      return {
        ...state,
        ui: {
          ...state.ui,
          drawer: { isOpen: false, entityType: null, entityId: null, sourceScreen: null, drillPath: [] },
        },
      };

    case 'SET_TIME_TRAVEL':
      return {
        ...state,
        ui: {
          ...state.ui,
          timeTravel: { mode: action.mode, asOfDate: action.asOfDate ?? null },
        },
      };

    case 'SET_FILTER_CRO_CATEGORY':
      return { ...state, ui: { ...state.ui, filterCROCategoryId: action.categoryId } };

    case 'SELECT_CYCLE':
      return { ...state, ui: { ...state.ui, selection: { ...state.ui.selection, cycleId: action.cycleId } } };

    case 'SELECT_GSR':
      return {
        ...state,
        ui: {
          ...state.ui,
          selection: {
            ...state.ui.selection,
            gsrId: action.gsrId,
            ...(action.cycleId ? { cycleId: action.cycleId } : {}),
          },
        },
      };

    case 'SELECT_ATTESTATION_LINE':
      return { ...state, ui: { ...state.ui, selection: { ...state.ui.selection, attestationLineId: action.lineId } } };

    // Pass 7.3 — drives LeadershipControlUniverse area-drill mode + cockpit area click.
    case 'SELECT_RISK_AREA':
      return { ...state, ui: { ...state.ui, selection: { ...state.ui.selection, riskAreaId: action.riskAreaId } } };

    case 'SET_PENDING_DECISION':
      return {
        ...state,
        ui: {
          ...state.ui,
          pendingDecision: { id: action.id, rationale: action.rationale ?? state.ui.pendingDecision.rationale ?? '' },
        },
      };

    case 'CAPTURE_SMF_DECISION': {
      // Mutates domain.smfTrails (existing Pass 6 mutable-trail pattern).
      const { smfId, awaiting } = action;
      const rationale = (state.ui.pendingDecision.rationale || '').trim();
      if (!rationale) return state; // noop without rationale (matches Pass 6 guard)
      const prevTrails = state.domain.smfTrails;
      const cur = { ...prevTrails[smfId] };
      cur.awaiting = cur.awaiting.filter(a => a.targetId !== awaiting.targetId);
      const newEvent = {
        timestamp: new Date().toISOString(),
        eventType: 'acknowledgement',
        label: `Acknowledged ${awaiting.targetType === 'issue' ? awaiting.targetId : awaiting.targetType + ' ' + awaiting.targetId}: ${rationale.slice(0, 80)}`,
        evidenceId: null,
      };
      cur.trail = [newEvent, ...cur.trail];
      cur.rss = {
        ...cur.rss,
        components: { ...cur.rss.components, issueAwareness: Math.min(100, cur.rss.components.issueAwareness + 14) },
      };
      cur.rss.score = computeRssScore(cur.rss.components, activeUkUi.rssComponents);
      cur.rss.band = cur.rss.score >= 80 ? 'green' : cur.rss.score >= 60 ? 'amber' : 'red';
      return {
        ...state,
        ui: { ...state.ui, pendingDecision: { id: null, rationale: '' } },
        domain: { ...state.domain, smfTrails: { ...prevTrails, [smfId]: cur } },
      };
    }

    case 'EXPAND_SAMPLE':
      // Pass 7.0 plumbing only: write-path acknowledged, no state mutation yet
      // (Pass 7.3 owns sample-expansion against attestation lines).
      return state;

    case 'GENERATE_QUARTERLY_REPORT':
      // Pass 7.0 plumbing only: write-path acknowledged, no state mutation yet
      // (Pass 7.3 owns the QuarterlyReportGenerator wiring).
      return state;

    // ─── Companion actions for legacy selection state (flagged in read-out) ──
    // The state shape lists selection.smfId/packId/testId; the spec §5.4 action
    // list does not enumerate setters for them. Pattern-mirroring SELECT_CYCLE
    // / SELECT_GSR / SELECT_ATTESTATION_LINE keeps zero-state-outside-reducer
    // honest. Confirm with founder; revisit in Pass 7.1.
    case 'SELECT_SMF':
      return { ...state, ui: { ...state.ui, selection: { ...state.ui.selection, smfId: action.smfId } } };
    case 'SELECT_PACK':
      return { ...state, ui: { ...state.ui, selection: { ...state.ui.selection, packId: action.packId } } };
    case 'SELECT_TEST':
      return { ...state, ui: { ...state.ui, selection: { ...state.ui.selection, testId: action.testId } } };

    default:
      return state;
  }
}

// resolveEntity needs to be visible to reducer (DRILL_FROM_DRAWER) — declared
// here since reducer is module-scope. Mirrors the App-body resolver.
function resolveEntity(type, id) {
  if (!type || !id) return null;
  return ({
    risk: getRisk, control: getControl, obligation: getObligation, issue: getIssue,
    evidence: getEvidence, smf: getSMF, auditPack: getAuditPack, aiInsight: getInsight,
    kri: getKRI,
    riskArea: getRiskArea, controlObjective: getControlObjective, gsr: getGSR,
    crsaCycle: getCRSACycle, attestationLine: getAttestationLine,
  }[type] || (() => null))(id);
}

// ─── Selectors (thin pure functions) ────────────────────────────────────────
const selectActivePersona       = (s) => s.ui.activePersona;
const selectActiveScreen        = (s) => s.ui.activeScreen;
const selectDrawer              = (s) => s.ui.drawer;
const selectTimeTravel          = (s) => s.ui.timeTravel;
const selectFilterCROCategoryId = (s) => s.ui.filterCROCategoryId;
const selectSelection           = (s) => s.ui.selection;
const selectSelectedSMFId       = (s) => s.ui.selection.smfId;
const selectSelectedPackId      = (s) => s.ui.selection.packId;
const selectSelectedTestId      = (s) => s.ui.selection.testId;
const selectSelectedCycleId     = (s) => s.ui.selection.cycleId;
const selectSelectedGSRId       = (s) => s.ui.selection.gsrId;
const selectSelectedLineId      = (s) => s.ui.selection.attestationLineId;
const selectPendingDecision     = (s) => s.ui.pendingDecision;
const selectSMFTrails           = (s) => s.domain.smfTrails;


// ─── App Component ────────────────────────────────────────────────────────
export default function UKBankingControlTrace({ variant = 'v2' } = {}) {
  bindUkMock(variant === 'v3' ? mockDataV3 : mockDataV2, variant);
  // Pass 7.0 — single useReducer replaces 12 fragmented useState calls.
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  // ── Selectors (read-side; cheap, called per render) ──────────────────────
  const activePersona       = selectActivePersona(state);
  const activeScreen        = selectActiveScreen(state);
  const drawer              = selectDrawer(state);
  const timeTravel          = selectTimeTravel(state);
  const filterCROCategoryId = selectFilterCROCategoryId(state);
  const selectedSMFId       = selectSelectedSMFId(state);
  const selectedPackId      = selectSelectedPackId(state);
  const selectedTestId      = selectSelectedTestId(state);
  // Pass 7.3 — CRSA selections.
  const selectedCycleId     = selectSelectedCycleId(state);
  const selectedGSRId       = selectSelectedGSRId(state);
  const selectedRiskAreaId  = state.ui.selection.riskAreaId;
  const pendingDecisionId   = selectPendingDecision(state).id;
  const decisionRationale   = selectPendingDecision(state).rationale;
  const smfTrails           = selectSMFTrails(state);

  // ── Adapter setters (preserve Pass 6 prop API for existing screens) ──────
  // These translate legacy setX(value) calls into typed dispatches so the
  // existing screen JSX keeps working unchanged. useCallback stabilises refs
  // so screens that memoise on setter identity don't thrash.
  const switchPersona      = useCallback((id)            => dispatch({ type: 'SWITCH_PERSONA', personaId: id }), []);
  const setActiveScreen    = useCallback((screen)        => dispatch({ type: 'SET_ACTIVE_SCREEN', screen }), []);
  const openDrawer         = useCallback((entityType, entityId, sourceScreen) =>
                                          dispatch({ type: 'OPEN_DRAWER', entityType, entityId, sourceScreen }), []);
  const drillFromDrawer    = useCallback((entityType, entityId) =>
                                          dispatch({ type: 'DRILL_FROM_DRAWER', entityType, entityId }), []);
  const drillBack          = useCallback(()              => dispatch({ type: 'DRILL_BACK' }), []);
  const closeDrawer        = useCallback(()              => dispatch({ type: 'CLOSE_DRAWER' }), []);
  const setSelectedSMFId   = useCallback((id)            => dispatch({ type: 'SELECT_SMF',  smfId:  id }), []);
  const setSelectedPackId  = useCallback((id)            => dispatch({ type: 'SELECT_PACK', packId: id }), []);
  const setSelectedTestId  = useCallback((id)            => dispatch({ type: 'SELECT_TEST', testId: id }), []);
  const setFilterDomain    = useCallback((categoryId)    => dispatch({ type: 'SET_FILTER_CRO_CATEGORY', categoryId }), []);
  // Pass 7.3 adapters for the CRSA cockpit / per-requirement drill chain.
  const setSelectedRiskAreaId = useCallback((id)         => dispatch({ type: 'SELECT_RISK_AREA', riskAreaId: id }), []);
  const setSelectedGSRId   = useCallback((id, cycleId)   => dispatch({ type: 'SELECT_GSR', gsrId: id, cycleId }), []);
  const setSelectedCycleId = useCallback((id)            => dispatch({ type: 'SELECT_CYCLE', cycleId: id }), []);
  const expandSample       = useCallback((lineId)        => dispatch({ type: 'EXPAND_SAMPLE', lineId }), []);
  const setPendingDecisionId = useCallback((id)          => dispatch({ type: 'SET_PENDING_DECISION', id, rationale: decisionRationale }),
                                          [decisionRationale]);
  const setDecisionRationale = useCallback((rationale)   => dispatch({ type: 'SET_PENDING_DECISION', id: pendingDecisionId, rationale }),
                                          [pendingDecisionId]);
  const captureSMFDecision = useCallback((smfId, awaiting) =>
                                          dispatch({ type: 'CAPTURE_SMF_DECISION', smfId, awaiting }), []);
  const toggleTimeTravel   = useCallback(() => {
    if (timeTravel.mode === 'live') dispatch({ type: 'SET_TIME_TRAVEL', mode: 'asOf', asOfDate: '2026-03-31' });
    else                            dispatch({ type: 'SET_TIME_TRAVEL', mode: 'live' });
  }, [timeTravel.mode]);

  const navItems = navigationItems.filter(n => n.visibleForPersonas.includes(activePersona));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-bold text-sm">RC</div>
            <div>
              <div className="text-sm font-semibold tracking-tight">RiskTrace<span className="text-indigo-600">.uk</span></div>
              <div className="text-[10px] text-slate-500 -mt-0.5">UK Banking Risk · Compliance · Audit</div>
            </div>
          </div>

          {/* Persona switcher */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {personas.map(p => (
              <button key={p.id} onClick={() => switchPersona(p.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${activePersona === p.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <input type="text" placeholder="Search risks, controls, obligations, SMFs…" className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" />
          </div>

          {/* Time travel */}
          <button onClick={toggleTimeTravel}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md">
            <span className={`h-1.5 w-1.5 rounded-full ${timeTravel.mode === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            {timeTravel.mode === "live" ? "Live · now" : `As of ${timeTravel.asOfDate}`}
          </button>

          {/* Independence mode — Pass 7.1: SMF16 (Head of Compliance Monitoring) carries the 2LoD badge. */}
          {activePersona === "smf16" && (
            <span className="px-2 py-1 text-[10px] font-bold tracking-wider bg-violet-100 text-violet-800 rounded border border-violet-200">2LoD COMPLIANCE</span>
          )}
        </div>

        {/* Nav */}
        <nav className="px-6 flex items-center gap-1 border-t border-slate-100">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveScreen(n.screen)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition ${activeScreen === n.screen ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-600 hover:text-slate-900"}`}>
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="px-6 py-6">
        {/* Pass 7.1 — four SMF-aligned persona landings (stubs; Passes 7.2–7.4 fill them in). */}
        {/* Pass 7.2 — CROBoardView is now real (three-zone board view). */}
        {activeScreen === "croBoardView" && <CROBoardView openDrawer={openDrawer} variant={variant} />}
        {activeScreen === "headOfERMWorkspace" && variant !== "v3" && <HeadOfERMWorkspace />}
        {/* Pass 7.3 — CRSACycleCockpit is now real (CRSA-anchored SMF16 landing). */}
        {activeScreen === "crsaCycleCockpit" && (
          <CRSACycleCockpit
            openDrawer={openDrawer}
            setActiveScreen={setActiveScreen}
            setSelectedRiskAreaId={setSelectedRiskAreaId}
            setSelectedCycleId={setSelectedCycleId}
            selectedCycleId={selectedCycleId}
          />
        )}
        {activeScreen === "mlroWorkspace" && (
          <MLROWorkspace
            openDrawer={openDrawer}
            setActiveScreen={setActiveScreen}
            setSelectedGSRId={setSelectedGSRId}
          />
        )}

        {/* Drill-only destination (no longer a persona default; reachable from drawer or shared nav). */}
        {/* Pass 7.2 — CRORiskPostureCockpit DELETED entirely; its 'riskPosture' route is removed. */}
        {/* Pass 7.3 — LeadershipControlUniverse repurposed as the CRSA area-drill when riskAreaId set. */}
        {activeScreen === "controlUniverse" && (
          <LeadershipControlUniverse
            openDrawer={openDrawer}
            filterDomain={filterCROCategoryId}
            setFilterDomain={setFilterDomain}
            riskAreaId={selectedRiskAreaId}
            setActiveScreen={setActiveScreen}
            setSelectedGSRId={setSelectedGSRId}
            selectedCycleId={selectedCycleId}
          />
        )}

        {/* Pass 7.3 — Per-Requirement Attestation View, the drill destination from the area view. */}
        {activeScreen === "perRequirementAttestation" && (
          <PerRequirementAttestationView
            gsrId={selectedGSRId}
            cycleId={selectedCycleId}
            openDrawer={openDrawer}
            setActiveScreen={setActiveScreen}
            expandSample={expandSample}
          />
        )}

        {/* Surviving cross-persona screens. */}
        {activeScreen === "smcrWorkspace" && <SMCRReasonableStepsWorkspace variant={variant} selectedSMFId={selectedSMFId} setSelectedSMFId={setSelectedSMFId} smfTrails={smfTrails} pendingDecisionId={pendingDecisionId} setPendingDecisionId={setPendingDecisionId} decisionRationale={decisionRationale} setDecisionRationale={setDecisionRationale} captureSMFDecision={captureSMFDecision} openDrawer={openDrawer} setActiveScreen={setActiveScreen} setSelectedPackId={setSelectedPackId} />}
        {activeScreen === "monitoringReportBuilder" && <MonitoringReportBuilder variant={variant} selectedPackId={selectedPackId} setSelectedPackId={setSelectedPackId} openDrawer={openDrawer} />}
        {activeScreen === "aiInsights" && <AIInsightExplorer openDrawer={openDrawer} />}

        {/* Pass 7.5 — Obligation Coverage Map promoted to top-level cross-persona screen. */}
        {activeScreen === "coverageMap" && (
          <ObligationCoverageMap
            openDrawer={openDrawer}
            setActiveScreen={setActiveScreen}
            setSelectedGSRId={setSelectedGSRId}
          />
        )}

        {/* Pass 7.3 — populationTesting case retained as a no-op route (the old
            ComplianceAuditWorkspace was its only entry; PerRequirementAttestationView
            will absorb the population-testing surface in a future pass). */}
        {activeScreen === "populationTesting" && <PopulationTestWorkspace selectedTestId={selectedTestId} openDrawer={openDrawer} setActiveScreen={setActiveScreen} setSelectedPackId={setSelectedPackId} />}
      </main>

      {/* ── DRAWER ──────────────────────────────────────────────────────── */}
      {drawer.isOpen && (
        <DetailDrawer drawer={drawer} closeDrawer={closeDrawer} drillFromDrawer={drillFromDrawer} drillBack={drillBack} setActiveScreen={setActiveScreen} setSelectedSMFId={setSelectedSMFId} setSelectedPackId={setSelectedPackId} setSelectedTestId={setSelectedTestId} />
      )}
    </div>
  );
}


// ─── Pass 7.1 — Persona Landing Stubs ─────────────────────────────────────
// Each stub is intentional. Passes 7.2–7.4 fill in the real content; this
// pass just proves persona routing lands the user on the right screen with
// the right SMF-aligned framing.

const PersonaStubLanding = ({ accent, persona, subhead, ownedByPass }) => {
  // Visually distinct per persona (accent class set; same minimal shape).
  // Minimal, low-noise — explicitly NOT a real screen yet.
  return (
    <div className="space-y-6">
      <div className={`rounded-xl border ${accent.border} ${accent.bg} p-6 shadow-sm`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className={`text-[10px] uppercase tracking-wider font-bold ${accent.kicker}`}>
              {persona.smfDesignation || "Non-SMF"}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{persona.label}</h1>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">{subhead}</p>
          </div>
          <div className={`flex-shrink-0 h-12 w-12 rounded-lg ${accent.iconBg} flex items-center justify-center`}>
            <span className="text-xl">{accent.icon}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
        <div className="text-3xl mb-2 opacity-50">🛠</div>
        <div className="text-sm font-semibold text-slate-700">Screen build pending — {ownedByPass}</div>
        <div className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
          Persona routing and SMF designation are wired. The full landing —
          tiles, drill targets, AI narrative — lands in the named pass.
        </div>
      </div>

      <div className="text-[11px] text-slate-400 text-center">
        Drill paths (drawer, AI insight detail, control detail) remain available
        from any screen that opens them; this stub does not yet expose entry points.
      </div>
    </div>
  );
};

// ─── Pass 7.2 — CRO Board View ────────────────────────────────────────────
// The screen that sells the platform. Three-zone strict layout fitted to a
// ten-minute pre-board read; if the CRO can't tell the firm risk story from
// this screen alone in <=90 seconds, the screen is not done.
//
//   Zone 1: FirmLevelRAGBand   — full-width hero, one-sentence narrative.
//   Zone 2: 5-up CROCategoryTile grid — RAG, one-line "why", w/w delta,
//                                       TimeBoundRAGBadge where applicable.
//                                       Click = drill (amber-first ordering).
//   Zone 3: WhatChangedThisWeek — 3–5 lines of plain English, AI confidence
//                                 beneath each. Written, not charted.
//
// No KRI tiles, no drift charts, no domain cards on landing — those move to
// the Head of ERM screen (Pass 7.X) where they belong.

// Zone 1: firm-level RAG band — large, graphic, one-sentence narrative.
const FirmLevelRAGBand = ({ band = "amber", narrative = "" }) => (
  <div className={`rounded-xl border-2 ${bandBg(band)} p-6 shadow-sm`}>
    <div className="flex items-center gap-3 mb-3">
      <span className={`h-3 w-3 rounded-full ${bandDot(band)}`} />
      <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Firm Risk Posture</span>
      <span className={`text-2xl font-extrabold tracking-tight ${bandText(band)}`}>{band.toUpperCase()}</span>
    </div>
    <p className="text-base leading-relaxed text-slate-800 max-w-4xl">{narrative}</p>
  </div>
);

// Zone 2: one of five tiles in the category grid.
const CROCategoryTile = ({ category, isDrilled, onClick }) => {
  const band = category.resBand;
  const delta = category.weekOnWeekDelta;
  const isTimeBound = !!category.expectedRecoveryDate;
  return (
    <button onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 hover:shadow-md transition flex flex-col gap-3 ${bandBg(band)} ${isDrilled ? "ring-2 ring-indigo-500 ring-offset-2" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold tracking-tight opacity-90 leading-tight">{category.label}</div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${bandText(band)}`}>{band}</span>
      </div>
      <p className="text-xs text-slate-700 leading-snug min-h-[2.5rem]">{category.whyOneLiner}</p>
      <div className="flex items-center justify-between gap-2 mt-auto">
        {isTimeBound ? (
          <TimeBoundRAGBadge band={band} untilDate={category.expectedRecoveryDate} size="xs" />
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">w/w</span>
        )}
        <span className={`text-xs font-semibold ${trendTone(category.trend)}`}>
          {trendArrow(category.trend)} {typeof delta === "number" ? (delta > 0 ? `+${delta}` : delta) : "—"}
        </span>
      </div>
    </button>
  );
};

// Zone 3: prose, not a chart. 3–5 lines of plain English with AI confidence.
const WhatChangedThisWeek = ({ items = [] }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-slate-900">What changed this week</h3>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">AI-summarised · written, not charted</span>
    </div>
    {items.length === 0 ? (
      <EmptyState message="No material changes this week." />
    ) : (
      <ul className="space-y-3.5">
        {items.map(item => (
          <li key={item.id} className="border-l-2 border-slate-200 pl-4">
            <p className="text-sm text-slate-800 leading-relaxed">{item.narrativeText}</p>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1.5 font-medium">
              AI confidence {Math.round((item.aiConfidence ?? 0) * 100)}%
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// Inline drill panel — opens below the 5-up grid when a tile is clicked.
// Amber-first; red below; green collapsed by default (per spec §2.5).
function CategoryDrillPanel({ categoryId, openDrawer, onClose }) {
  const cat = (croCategories || []).find(c => c.id === categoryId);
  const [showGreen, setShowGreen] = useState(false);
  if (!cat) return null;

  const riskBand = (r) => r.residualRating === "high" ? "red"
                       : r.residualRating === "medium" ? "amber" : "green";
  const contributing = (risks || []).filter(r => r.croCategoryId === categoryId);
  const amberRisks = contributing.filter(r => riskBand(r) === "amber");
  const redRisks   = contributing.filter(r => riskBand(r) === "red");
  const greenRisks = contributing.filter(r => riskBand(r) === "green");

  const RiskRow = ({ r }) => (
    <button onClick={() => openDrawer("risk", r.id, "croBoardView")}
      className="w-full text-left px-5 py-3 hover:bg-slate-50 transition flex items-start gap-3 border-t border-slate-100 first:border-t-0">
      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${bandDot(riskBand(r))}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">{r.title}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{r.id} · owner {r.ownerRole} · accountable {r.accountableSMFId}</div>
      </div>
      <StatusBadge tone={riskBand(r)} label={`${r.residualScore}`} size="xs" />
    </button>
  );

  const SectionHeader = ({ band, count, label }) => (
    <div className={`px-5 py-2 text-[10px] uppercase tracking-wider font-bold border-y ${bandBg(band)}`}>
      {label} · {count}
    </div>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Drilling into</div>
          <h3 className="text-base font-semibold text-slate-900 mt-0.5">{cat.label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{cat.scope}</p>
        </div>
        <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100">Close ✕</button>
      </div>

      <p className="px-5 py-2 text-[11px] text-slate-500 bg-slate-50/60 border-b border-slate-100">
        Amber-first · red below · green collapsed by default. Click a row to open the risk drawer.
      </p>

      {amberRisks.length > 0 && (
        <>
          <SectionHeader band="amber" count={amberRisks.length} label="Amber" />
          {amberRisks.map(r => <RiskRow key={r.id} r={r} />)}
        </>
      )}

      {redRisks.length > 0 && (
        <>
          <SectionHeader band="red" count={redRisks.length} label="Red" />
          {redRisks.map(r => <RiskRow key={r.id} r={r} />)}
        </>
      )}

      {greenRisks.length > 0 && (
        <>
          <button onClick={() => setShowGreen(s => !s)}
            className="w-full px-5 py-2 text-left text-[10px] uppercase tracking-wider font-bold border-y border-emerald-100 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 flex items-center justify-between">
            <span>Green · {greenRisks.length} {showGreen ? "(showing)" : "(collapsed)"}</span>
            <span>{showGreen ? "▾" : "▸"}</span>
          </button>
          {showGreen && greenRisks.map(r => <RiskRow key={r.id} r={r} />)}
        </>
      )}

      {contributing.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-500">
          No risks currently contributing to this category. Coverage exists at the framework level — drill is informational only.
        </div>
      )}
    </div>
  );
}

// ─── Pass 7.3 — CRSA Cycle Cockpit (SMF16 landing) ───────────────────────
// Replaces the Pass 7.1 stub. Anchored on Sridhar's Q2 2026 cycle.
// Acts 2/3/4 of the demo run on this screen plus the Per-Requirement view
// and the Quarterly Report Generator below.

// Tile in the 5-up area grid.
const RiskAreaTile = ({ area, cycle, onClick, isActive }) => {
  // Cycle band derived from completion + exceptions.
  const completionBand = cycle.exceptionsCount > 5 ? "amber"
                       : cycle.exceptionsCount > 0 ? "amber"
                       : cycle.completionPct >= 100 ? "green"
                       : "neutral";
  const visBand = cycle.status === "submitted_for_executive_review" ? "green"
                : cycle.exceptionsCount >= 5 ? "amber"
                : cycle.exceptionsCount > 0 ? "amber"
                : "green";
  return (
    <button onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 hover:shadow-md transition flex flex-col gap-3 ${bandBg(visBand)} ${isActive ? "ring-2 ring-indigo-500 ring-offset-2" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold tracking-tight">{area.name}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{area.code} · {cycle.periodLabel}</div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${bandText(visBand)}`}>{visBand}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Completion</div>
          <div className="text-xl font-bold">{cycle.completionPct}%</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Exceptions</div>
          <div className={`text-xl font-bold ${cycle.exceptionsCount > 0 ? bandText("amber") : bandText("green")}`}>{cycle.exceptionsCount}</div>
        </div>
      </div>
      {cycle.status === "submitted_for_executive_review" && (
        <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded px-2 py-0.5 self-start">
          Submitted for Executive Review
        </span>
      )}
    </button>
  );
};

// Horizon Scanner — one-row panel surfacing in-flight reg-change items.
const HorizonScannerPanel = ({ items = [] }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="px-5 py-3 border-b border-slate-100">
      <h3 className="text-sm font-semibold text-slate-900">Horizon Scanner</h3>
      <p className="text-[11px] text-slate-500">Reg-change events with applicability assessment in flight</p>
    </div>
    {items.length === 0 ? <EmptyState message="No items in horizon scanner." /> : (
      <ul className="divide-y divide-slate-100">
        {items.map(it => (
          <li key={it.id} className="px-5 py-3">
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 mt-0.5">{it.regulatorBody}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">{it.title}</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{it.summary}</p>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  {it.citation} · published {it.publishedDate} · target {it.targetCompletionDate}
                </div>
              </div>
              <StatusBadge tone="amber" label={it.applicabilityStatus.replace(/_/g, " ").toUpperCase()} size="xs" />
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// Findings Ledger — control failures discovered through monitoring.
const FindingsLedger = ({ findings = [], openDrawer }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="px-5 py-3 border-b border-slate-100">
      <h3 className="text-sm font-semibold text-slate-900">Findings Ledger</h3>
      <p className="text-[11px] text-slate-500">First-line remediation status</p>
    </div>
    {findings.length === 0 ? <EmptyState message="No findings recorded." /> : (
      <ul className="divide-y divide-slate-100">
        {findings.map(f => (
          <li key={f.id} className="px-5 py-3">
            <div className="flex items-start gap-3">
              <RACMRefBadge racmRef={f.racmRef} size="xs" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">{f.title}</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{f.summary}</p>
                <div className="text-[10px] text-slate-500 mt-1.5">
                  Discovered {f.discoveredDate} · status {f.firstLineRemediationStatus.replace(/_/g, " ")}
                </div>
              </div>
              <StatusBadge tone={f.severity === "high" ? "red" : "amber"} label={f.severity.toUpperCase()} size="xs" />
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

// XLSX export — lazy-loads SheetJS from CDN on first invocation. Browser-only;
// fits the Vercel single-file-prototype delivery model. The export columns
// mirror the source CRSA Questions sheet schema exactly (22 columns).
const CRSA_EXPORT_COLUMNS = [
  "Area Ref", "Risk Ref", "Obj Ref", "Reqs Ref", "RACM Ref",
  "Area", "Risk", "Control Objectives", "Group Set Requirements",
  "1st Line Applicability", "1st Line Control Activities Undertaken",
  "1st Line Responsible", "1st Line Frequency", "1st Line Nature and Approach",
  "1st Line Execution Evidence",
  "2nd Line Monitoring & Assurance Activities", "2nd Line Responsible", "2nd Line Frequency",
  "Division", "Business", "Completed By", "Date of Submission",
];

function buildExportRows(cycle) {
  // Build one row per attestation line. Mirrors source CRSA per-area schema.
  const lines = (crsaAttestationLines || []).filter(l => l.cycleId === cycle.id);
  return lines.map(line => {
    const gsr = (groupSetRequirements || []).find(g => g.id === line.groupSetRequirementId);
    const co  = gsr ? (controlObjectives || []).find(c => c.id === gsr.controlObjectiveId) : null;
    const area = (riskAreas || []).find(a => a.id === cycle.riskAreaId);
    const oneL = line.oneL || {};
    const twoL = line.twoL || {};
    return {
      "Area Ref":    area?.code || "—",
      "Risk Ref":    "01",
      "Obj Ref":     gsr?.controlObjectiveId?.split('-').pop() || "—",
      "Reqs Ref":    gsr?.reqCode || "—",
      "RACM Ref":    gsr?.racmRef || "—",
      "Area":        area?.name || "—",
      "Risk":        area?.crsaRiskStatement || "—",
      "Control Objectives":     co?.name || "—",
      "Group Set Requirements": gsr?.requirementText || "—",
      "1st Line Applicability": line.applicability || "—",
      "1st Line Control Activities Undertaken": oneL.controlActivity || "—",
      "1st Line Responsible":   oneL.responsibilityRole || "—",
      "1st Line Frequency":     (FREQUENCY[oneL.frequency] && FREQUENCY[oneL.frequency].label) || "—",
      "1st Line Nature and Approach": (NATURE_AND_APPROACH[oneL.natureAndApproach] && NATURE_AND_APPROACH[oneL.natureAndApproach].label) || "—",
      "1st Line Execution Evidence": (oneL.executionEvidenceIds || []).join(", ") || "—",
      "2nd Line Monitoring & Assurance Activities": twoL.monitoringActivity || "—",
      "2nd Line Responsible":   twoL.responsibilityRole || "—",
      "2nd Line Frequency":     (FREQUENCY[twoL.frequency] && FREQUENCY[twoL.frequency].label) || "—",
      "Division":     "—",
      "Business":     "—",
      "Completed By": "—",
      "Date of Submission": "—",
    };
  });
}

async function ensureSheetJSLoaded() {
  if (typeof window === "undefined") throw new Error("XLSX export only runs in the browser.");
  if (window.XLSX) return window.XLSX;
  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-sheetjs-loader="1"]');
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
    s.dataset.sheetjsLoader = "1";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load SheetJS from CDN. Check network."));
    document.head.appendChild(s);
  });
  return window.XLSX;
}

const CRSAExportButton = ({ cycle, rows, onStatus }) => {
  const handle = async () => {
    try {
      onStatus?.({ state: "loading", message: "Loading SheetJS…" });
      const XLSX = await ensureSheetJSLoaded();
      onStatus?.({ state: "loading", message: "Building workbook…" });
      const sheet = XLSX.utils.json_to_sheet(rows, { header: CRSA_EXPORT_COLUMNS });
      const wb = XLSX.utils.book_new();
      const sheetName = cycle.id.replace(/^CYC-Q2-2026-/, ""); // e.g. "AML"
      XLSX.utils.book_append_sheet(wb, sheet, sheetName);
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19) + "Z";
      const filename = `CRSA_${sheetName}_${cycle.periodLabel.replace(" ", "_")}_${ts}.xlsx`;
      XLSX.writeFile(wb, filename);
      onStatus?.({ state: "done", message: `Exported ${filename}` });
    } catch (err) {
      onStatus?.({ state: "error", message: err.message || String(err) });
    }
  };
  return (
    <button onClick={handle}
      className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-md shadow-sm">
      Export to CRSA format (.xlsx) →
    </button>
  );
};

const XLSXLayoutPreview = ({ rows }) => {
  // Render a horizontally-scrollable preview of the first ~15 rows, with all
  // 22 columns visible — visually demonstrates the CRSA column layout.
  const previewRows = rows.slice(0, 15);
  return (
    <div className="border border-slate-200 rounded-md bg-white overflow-auto max-h-[55vh]">
      <table className="text-[10px] min-w-full">
        <thead className="bg-slate-100 sticky top-0">
          <tr>
            {CRSA_EXPORT_COLUMNS.map(col => (
              <th key={col} className="px-2 py-1.5 text-left font-semibold text-slate-700 border-r border-slate-200 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              {CRSA_EXPORT_COLUMNS.map(col => (
                <td key={col} className="px-2 py-1 text-slate-700 border-r border-slate-100 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis" title={row[col] || ""}>
                  {row[col] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > previewRows.length && (
        <div className="px-3 py-2 text-[11px] text-slate-500 border-t border-slate-100 bg-slate-50">
          Preview: showing first {previewRows.length} of {rows.length} rows. Export delivers the full set.
        </div>
      )}
    </div>
  );
};

// QuarterlyReportGenerator — modal launched from the cockpit's top-right.
const QuarterlyReportGenerator = ({ cycle, onClose }) => {
  const [exportStatus, setExportStatus] = useState(null);
  if (!cycle) return null;
  const rows = useMemo(() => buildExportRows(cycle), [cycle.id]);
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-start justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white rounded-t-xl">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Quarterly Report Generator</div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">CRSA — {cycle.periodLabel} · {cycle.id.replace(/^CYC-Q2-2026-/, "")}</h2>
            <p className="text-xs text-slate-600 mt-1">
              Source-template fidelity: <span className="font-mono">{cycle.sourceTemplateRef}</span> ·
              {" "}{rows.length} attestation lines populated from continuous evidence ·
              {" "}<span className="font-semibold">Coverage: 100% of population (n={cycle.populationSize.toLocaleString("en-GB")})</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100">Close ✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[11px] text-slate-600">
              Preview renders the CRSA in Sridhar's exact column layout. Export delivers an .xlsx with one sheet per area.
            </div>
            <CRSAExportButton cycle={cycle} rows={rows} onStatus={setExportStatus} />
          </div>

          {exportStatus && (
            <div className={`text-xs px-3 py-2 rounded border ${
              exportStatus.state === "error" ? "bg-rose-50 border-rose-300 text-rose-800"
              : exportStatus.state === "done" ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : "bg-amber-50 border-amber-300 text-amber-800"}`}>
              {exportStatus.message}
            </div>
          )}

          <XLSXLayoutPreview rows={rows} />

          <div className="text-[10px] text-slate-400 text-center">
            22-column layout mirrors the source CRSA Questions sheet schema. Round-trip fidelity (ingest → regenerate exactly the firm's CRSA) lands in Pass 8.
          </div>
        </div>
      </div>
    </div>
  );
};

// CRSA Cycle Cockpit — the SMF16 landing.
function CRSACycleCockpit({ openDrawer, setActiveScreen, setSelectedRiskAreaId, setSelectedCycleId, selectedCycleId }) {
  const persona = personas.find(p => p.id === "smf16");
  const [reportCycleId, setReportCycleId] = useState(null);

  if (!persona) return <EmptyState message="SMF16 persona not configured." />;

  const cycles = crsaAttestationCycles || [];
  const focalCycle = cycles.find(c => c.id === selectedCycleId) || cycles[0];

  const drillToArea = (cycle) => {
    setSelectedCycleId(cycle.id);
    setSelectedRiskAreaId(cycle.riskAreaId);
    setActiveScreen("controlUniverse"); // repurposed as the area-drill view
  };

  const reportCycle = reportCycleId ? cycles.find(c => c.id === reportCycleId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">{persona.smfDesignation}</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{persona.label}</h1>
          <p className="text-sm text-slate-600 mt-1">{persona.subhead}</p>
        </div>
        <button onClick={() => setReportCycleId(focalCycle?.id || null)}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-md shadow-sm">
          Generate Quarterly Report →
        </button>
      </div>

      {/* Cycle summary card — focuses on AML by default (the demo focal cycle). */}
      {focalCycle && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">Active Cycle</div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {focalCycle.id} · {focalCycle.periodLabel}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Owner {focalCycle.ownerSMFId} · due {focalCycle.dueDate} · source template{" "}
                <span className="font-mono">{focalCycle.sourceTemplateRef}</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Completion</div>
                <div className="text-3xl font-bold text-slate-900">{focalCycle.completionPct}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Exceptions</div>
                <div className={`text-3xl font-bold ${focalCycle.exceptionsCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>{focalCycle.exceptionsCount}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Status</div>
                <div className="text-sm font-bold text-slate-900 mt-2">{focalCycle.status.replace(/_/g, " ")}</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <CoverageMetric mode={focalCycle.coverageMode} populationSize={focalCycle.populationSize} size="lg" />
          </div>
        </div>
      )}

      {/* 5-up area tile grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">CRSA Cycles · Q2 2026</h2>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">click an area to drill (per-requirement view)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {cycles.map(cycle => {
            const area = (riskAreas || []).find(a => a.id === cycle.riskAreaId);
            if (!area) return null;
            return (
              <RiskAreaTile
                key={cycle.id}
                area={area}
                cycle={cycle}
                isActive={focalCycle?.id === cycle.id}
                onClick={() => drillToArea(cycle)}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom: Horizon Scanner + Findings Ledger side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizonScannerPanel items={horizonScanItems || []} />
        <FindingsLedger findings={findingsLedger || []} openDrawer={openDrawer} />
      </div>

      {/* Modal */}
      {reportCycle && (
        <QuarterlyReportGenerator cycle={reportCycle} onClose={() => setReportCycleId(null)} />
      )}
    </div>
  );
}

// ─── Pass 7.3 — Per-Requirement Attestation View ──────────────────────────
// Reached from the CRSA Cycle Cockpit → area tile → GSR row.
// The "Coverage: 100% of population (n=…)" headline is mandatory, above the fold.
const ExpandSampleButton = ({ lineId, currentMode, onExpand }) => (
  <button
    onClick={() => onExpand?.(lineId)}
    disabled={currentMode !== "partial"}
    className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
      currentMode === "partial"
        ? "bg-indigo-600 text-white hover:bg-indigo-700"
        : "bg-slate-100 text-slate-400 cursor-not-allowed"
    }`}
    title={currentMode === "partial"
      ? "Expand sample to full population"
      : "Coverage is full — no sample expansion needed."}
  >
    Expand Sample to Full Population →
  </button>
);

function PerRequirementAttestationView({ gsrId, cycleId, openDrawer, setActiveScreen, expandSample }) {
  const gsr = (groupSetRequirements || []).find(g => g.id === gsrId);
  const cycle = (crsaAttestationCycles || []).find(c => c.id === cycleId);
  const co = gsr ? (controlObjectives || []).find(c => c.id === gsr.controlObjectiveId) : null;
  const area = co ? (riskAreas || []).find(a => a.id === co.riskAreaId) : null;
  const line = (crsaAttestationLines || []).find(l =>
    l.groupSetRequirementId === gsrId && l.cycleId === cycleId);

  if (!gsr || !line) {
    return (
      <div className="space-y-4">
        <button onClick={() => setActiveScreen("crsaCycleCockpit")}
          className="text-xs text-indigo-700 hover:underline">← back to Cycle Cockpit</button>
        <EmptyState message="No attestation line found for this requirement / cycle pair." />
      </div>
    );
  }

  const series = line.evidenceCompletenessSeries || [];
  const start = series[0];
  const end   = series[series.length - 1];
  const delta = (typeof start === "number" && typeof end === "number") ? (end - start) : null;
  const linkedControls = (gsr.controlIds || []).map(cid => getControl(cid)).filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Breadcrumb back */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <button onClick={() => setActiveScreen("crsaCycleCockpit")} className="hover:text-indigo-700 hover:underline">
          CRSA Cycle Cockpit
        </button>
        <span>›</span>
        <button onClick={() => setActiveScreen("controlUniverse")} className="hover:text-indigo-700 hover:underline">
          {area?.code || "—"} · area drill
        </button>
        <span>›</span>
        <span className="font-mono text-slate-700">{gsr.racmRef}</span>
      </div>

      {/* Header card */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <RACMRefBadge racmRef={gsr.racmRef} />
          <ApplicabilityBadge value={line.applicability} />
          <StatusBadge tone={line.evidenceCompletenessBand} label={`EVIDENCE ${line.evidenceCompletenessPct}%`} />
          {line.exceptionFlag && <StatusBadge tone="red" label="EXCEPTION" size="xs" />}
          {gsr.thinCoverageFlag && <StatusBadge tone="amber" label="THIN COVERAGE" size="xs" />}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Group Set Requirement (verbatim)</div>
        <p className="text-base text-slate-900 leading-relaxed">{gsr.requirementText}</p>
        <div className="text-[11px] text-slate-500 mt-3">
          {area?.name} · Control Objective <span className="font-medium text-slate-700">{co?.name}</span>
        </div>
      </div>

      {/* Coverage metric — MANDATORY above the fold */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <CoverageMetric
          mode={(line.oneL && line.oneL.coverageMode) || "full"}
          populationSize={(line.oneL && line.oneL.populationSize) || cycle?.populationSize || 0}
          size="lg"
        />
        <ExpandSampleButton
          lineId={line.id}
          currentMode={(line.oneL && line.oneL.coverageMode) || "full"}
          onExpand={expandSample}
        />
      </div>

      {/* 1L / 2L paired rows */}
      <OneLTwoLPair
        oneL={line.oneL}
        twoL={line.twoL}
        oneLEvidence={(line.oneL && line.oneL.executionEvidenceIds) || []}
      />

      {/* Right rail-style: 13-week trend + linked controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Evidence completeness · 13-week trend</h3>
            <div className="text-xs">
              <span className="text-slate-500">start </span>
              <span className="font-bold text-slate-900">{start ?? "—"}%</span>
              <span className="text-slate-500 mx-2">·</span>
              <span className="text-slate-500">end </span>
              <span className={`font-bold ${bandText(line.evidenceCompletenessBand)}`}>{end ?? "—"}%</span>
              {typeof delta === "number" && (
                <>
                  <span className="text-slate-500 mx-2">·</span>
                  <span className={`font-bold ${delta < 0 ? "text-rose-600" : "text-emerald-600"}`}>{delta > 0 ? `+${delta}` : delta} pp</span>
                </>
              )}
            </div>
          </div>
          <Sparkline series={series} band={line.evidenceCompletenessBand} width={620} height={64} fill />
          <div className="grid grid-cols-13 gap-1 mt-2 text-[9px] text-slate-400 text-center">
            {series.map((_, i) => <div key={i}>w{i + 1}</div>)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Satisfying controls</h3>
          {linkedControls.length === 0 ? (
            <p className="text-xs text-slate-500">No controls mapped at this stage.</p>
          ) : (
            <ul className="space-y-2">
              {linkedControls.map(c => (
                <li key={c.id}>
                  <button onClick={() => openDrawer("control", c.id, "perRequirementAttestation")}
                    className="w-full text-left p-2 rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition">
                    <div className="text-xs font-semibold text-slate-900">{c.id}</div>
                    <div className="text-[11px] text-slate-600 leading-snug line-clamp-2">{c.title}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StatusBadge tone={c.ces?.band || "neutral"} label={`CES ${c.ces?.current ?? "—"}`} size="xs" />
                      <span className="text-[10px] text-slate-500">{c.lineOfDefence ? LINE_OF_DEFENCE[c.lineOfDefence]?.label : "—"}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-center pt-2">
        1st Line of Defence operates the control · 2nd Line of Defence tests 1L operating it · evidence trail mirrors the CRSA per-area sheet schema.
      </p>
    </div>
  );
}

// CRO (SMF4) board view — replaces the Pass 7.1 stub.
function CROBoardView({ openDrawer, variant = 'v2' }) {
  const ui = getUkAuditUi(variant);
  const persona = personas.find(p => p.id === "cro");
  const [drilledCategoryId, setDrilledCategoryId] = useState(null);

  if (!persona) return <EmptyState message="CRO persona not configured." />;

  return (
    <div className="space-y-6">
      {/* Header strip — minimal, board-view appropriate. */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-700 font-bold">{persona.smfDesignation || ""}</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{persona.label}</h1>
          <p className="text-sm text-slate-600 mt-1">{persona.subhead}</p>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Ten-minute board view · five UK CRO categories
        </div>
      </div>

      {/* Zone 1 — firm-level RAG band */}
      <FirmLevelRAGBand
        band={firmLevelRAG?.band || "amber"}
        narrative={firmLevelRAG?.narrative || "Firm-level narrative not yet available."}
      />

      {/* Zone 2 — 5-up category tile grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Categories</h2>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">click a tile to drill (amber-first)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(croCategories || []).map(cat => (
            <CROCategoryTile
              key={cat.id}
              category={cat}
              isDrilled={drilledCategoryId === cat.id}
              onClick={() => setDrilledCategoryId(prev => prev === cat.id ? null : cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Inline drill panel — appears below the grid when a tile is clicked. */}
      {drilledCategoryId && (
        <CategoryDrillPanel
          categoryId={drilledCategoryId}
          openDrawer={openDrawer}
          onClose={() => setDrilledCategoryId(null)}
        />
      )}

      {/* Zone 3 — what changed (prose) */}
      <WhatChangedFromLastReview title={ui.whatChangedTitle} items={whatChangedThisWeek || []} />

      {variant !== "v3" && (
        <p className="text-[10px] text-slate-400 text-center pt-2">
          No KRI tiles, no drift charts, no domain cards on this screen — those live in the Head of ERM workspace.
        </p>
      )}
    </div>
  );
}

// Head of ERM — accent emerald
function HeadOfERMWorkspace() {
  const persona = personas.find(p => p.id === "head_of_erm");
  if (!persona) return <EmptyState message="Head of ERM persona not configured." />;
  return (
    <PersonaStubLanding
      accent={{
        border: "border-emerald-200",
        bg: "bg-emerald-50/40",
        kicker: "text-emerald-700",
        iconBg: "bg-emerald-100",
        icon: "🌐",
      }}
      persona={persona}
      subhead={persona.subhead}
      ownedByPass="Pass 7.X (Head of ERM Workspace — sequencing TBC)"
    />
  );
}

// SMF16 stub deleted in Pass 7.3 — CRSACycleCockpit is now real (see above).

// ─── Pass 7.4 — MLRO Workspace (SMF17 landing) ────────────────────────────
// Replaces the Pass 7.1 stub. Repurposes the existing Pass 6 AML capacity-stress
// narrative onto MLRO-shaped widgets. The natural detail-handoff:
//   CRO landing F&FC tile (amber) → drill → MLROWorkspace → drill →
//   AML.01.05.02 / AML.01.07.01 attestation (Pass 7.3 PerRequirementAttestationView).
//
// Layout (per spec §4.6): KRI ribbon (top), AlertBacklog (full-width primary),
// SAR timeliness + EDD pipeline (mid 2-up), Sanctions + Capacity (bottom 2-up).
//
// Drill helpers — both targets are AML GSRs from Pass 7.3 mock data.
const MLRO_DRILL_TARGETS = {
  // AML.01.05.02 — MLRO Reporting (the focal red line; capacity narrative
  // surfaces here). AML.01.07.01 — FCA Annual FC Report / FIU regime.
  alertBacklog: { gsrId: 'GSR-AML-05-02', cycleId: 'CYC-Q2-2026-AML' },
  sarTimeliness: { gsrId: 'GSR-AML-07-01', cycleId: 'CYC-Q2-2026-AML' },
  eddPipeline: { gsrId: 'GSR-AML-05-02', cycleId: 'CYC-Q2-2026-AML' },
};

// FinancialCrimeKRIStrip — horizontal ribbon of FC-attached KRIs.
const FinancialCrimeKRIStrip = ({ kriList, openDrawer }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-slate-900">Financial Crime KRIs · mapped to F&amp;FC appetite</h3>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">click a KRI for definition, bands, trend, and links</span>
    </div>
    {kriList.length === 0 ? <EmptyState message="No FC KRIs attached." /> : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kriList.map(kri => {
          const series = (kri.series || []).map(p => p.value);
          return (
            <button key={kri.id} onClick={() => openDrawer && openDrawer("kri", kri.id, "mlroWorkspace")}
              className={`text-left p-3 rounded-lg border-2 hover:shadow-md transition ${bandBg(kri.currentBand)}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-[11px] font-semibold leading-tight">{kri.name}</div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${bandText(kri.currentBand)}`}>{kri.currentBand}</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold">{kri.current}</span>
                <span className="text-[10px] text-slate-500">{kri.unit}</span>
              </div>
              <div className="mt-1.5">
                <Sparkline series={series} band={kri.currentBand} width={160} height={24} fill />
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                green ≤{kri.greenBand?.[1]} · amber ≤{kri.amberBand?.[1]} · {kri.unit === "%" ? "%" : "ct"}
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

// AlertBacklogVsAppetite — primary widget. Pulls amlAlertsByWeek + the
// APP-FC-002 appetite metric. Click drills to AML.01.05.02 attestation.
const AlertBacklogVsAppetite = ({ alertSeries, appetiteMetric, onDrill }) => {
  const last = alertSeries[alertSeries.length - 1] || {};
  const first = alertSeries[0] || {};
  const backlogDelta = (last.openBacklog || 0) - (first.openBacklog || 0);
  const breachWeek = (appetiteMetric?.breachEvents || [])[0];
  const backlogSeries = alertSeries.map(p => p.openBacklog);
  const slaSeries = alertSeries.map(p => p.slaBreaches);
  return (
    <button onClick={onDrill}
      className="w-full text-left rounded-xl border-2 border-rose-300 bg-rose-50/40 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-rose-800 font-bold">AML Programme Posture · Primary widget</div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">Alert backlog vs. appetite</h2>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-2xl">
            Backlog has crossed the {appetiteMetric?.amberThreshold ?? "—"}% red appetite threshold. The L1/L2 disposition team
            is at fixed capacity; demand has risen since week 8. Disposition rate has not kept pace, so the backlog accumulates.
          </p>
        </div>
        <StatusBadge tone="red" label={`OUT OF APPETITE · ${appetiteMetric?.current ?? "—"}${appetiteMetric?.metric?.includes("%") ? "%" : ""}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        <div className="rounded-md bg-white border border-slate-200 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Backlog (current)</div>
          <div className="text-3xl font-bold text-rose-700 mt-0.5">{last.openBacklog?.toLocaleString("en-GB") ?? "—"}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {backlogDelta >= 0 ? "+" : ""}{backlogDelta.toLocaleString("en-GB")} vs 13 weeks ago
          </div>
        </div>
        <div className="rounded-md bg-white border border-slate-200 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">SLA breaches (this wk)</div>
          <div className="text-3xl font-bold text-rose-700 mt-0.5">{last.slaBreaches?.toLocaleString("en-GB") ?? "—"}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">vs. {first.slaBreaches} 13 wks ago</div>
        </div>
        <div className="rounded-md bg-white border border-slate-200 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Generated (this wk)</div>
          <div className="text-3xl font-bold text-slate-900 mt-0.5">{last.generated?.toLocaleString("en-GB") ?? "—"}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">vs. dispositioned {last.dispositioned?.toLocaleString("en-GB") ?? "—"}</div>
        </div>
        <div className="rounded-md bg-white border border-slate-200 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Appetite breach</div>
          <div className="text-base font-bold text-rose-700 mt-1">
            {breachWeek ? `${appetiteMetric?.currentBand?.toUpperCase()} ${appetiteMetric?.current}%` : "—"}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {breachWeek ? `breach ${breachWeek.fromBand}→${breachWeek.toBand}` : "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-md bg-white border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Open backlog · 13 wk</span>
            <span className="text-[10px] text-rose-700 font-semibold">↗ {alertSeries.length} weeks</span>
          </div>
          <Sparkline series={backlogSeries} band="red" width={420} height={48} fill />
        </div>
        <div className="rounded-md bg-white border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">SLA breaches · 13 wk</span>
            <span className="text-[10px] text-rose-700 font-semibold">↗ accelerating</span>
          </div>
          <Sparkline series={slaSeries} band="red" width={420} height={48} fill />
        </div>
      </div>

      <div className="mt-4 text-[11px] text-rose-800 font-medium">
        Drill into AML.01.05.02 (MLRO Reporting) Per-Requirement Attestation View →
      </div>
    </button>
  );
};

// SARTimelinessBand — % SARs filed within statutory POCA s.330 window.
const SARTimelinessBand = ({ series, onDrill }) => {
  const last = series[series.length - 1] || {};
  const seriesValues = series.map(p => p.pctOnTime);
  return (
    <button onClick={onDrill}
      className={`w-full text-left rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition ${bandBg(last.band)}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">SAR timeliness · POCA s.330 window (30 days)</div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">% of SARs filed within statutory window</h3>
        </div>
        <StatusBadge tone={last.band} label={last.band?.toUpperCase()} />
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-bold">{last.pctOnTime?.toFixed(1)}%</span>
        <span className="text-[10px] text-slate-500">of {last.filed} filings this week</span>
      </div>
      <div className="mt-3">
        <Sparkline series={seriesValues} band={last.band} width={420} height={40} fill />
      </div>
      <div className="mt-2 text-[10px] text-slate-500 grid grid-cols-3 gap-2">
        <div>Filed (period): <span className="font-semibold">{series.reduce((s, p) => s + (p.filed || 0), 0)}</span></div>
        <div>Within window: <span className="font-semibold">{series.reduce((s, p) => s + (p.withinWindow || 0), 0)}</span></div>
        <div>Submission: NCA SAR Online</div>
      </div>
      <div className="mt-2 text-[11px] font-medium opacity-80">
        Drill into AML.01.07.01 (FCA Annual FC Report / FIU regime) →
      </div>
    </button>
  );
};

// EDDPipelineStatus — high-risk customer review pipeline.
const EDDPipelineStatus = ({ items, onDrill }) => {
  const counts = items.reduce((acc, it) => {
    acc[it.status] = (acc[it.status] || 0) + 1;
    if (it.band === "red") acc.red = (acc.red || 0) + 1;
    return acc;
  }, {});
  const pastDue = counts.past_due || 0;
  const inProgress = counts.in_progress || 0;
  const awaiting = counts.awaiting_decision || 0;
  const totalBand = pastDue >= 3 ? "amber" : pastDue > 0 ? "amber" : "green";
  return (
    <button onClick={onDrill}
      className={`w-full text-left rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition ${bandBg(totalBand)}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">EDD pipeline · MLR 2017 Reg 28 / Reg 35</div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">High-risk customer reviews</h3>
        </div>
        <StatusBadge tone={totalBand} label={`${pastDue} PAST DUE`} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="rounded bg-white/70 border border-slate-200 p-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Past due</div>
          <div className={`text-2xl font-bold ${pastDue > 0 ? "text-rose-700" : "text-emerald-700"}`}>{pastDue}</div>
        </div>
        <div className="rounded bg-white/70 border border-slate-200 p-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">In progress</div>
          <div className="text-2xl font-bold text-slate-900">{inProgress}</div>
        </div>
        <div className="rounded bg-white/70 border border-slate-200 p-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Awaiting MLRO</div>
          <div className="text-2xl font-bold text-slate-900">{awaiting}</div>
        </div>
      </div>
      <ul className="mt-3 space-y-1 text-[11px]">
        {items.filter(it => it.band === "red").slice(0, 3).map(it => (
          <li key={it.id} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />
            <span className="font-mono text-slate-600 text-[10px]">{it.id}</span>
            <span className="text-slate-700 truncate">{it.notes}</span>
            <span className="text-rose-700 font-semibold ml-auto">{it.daysOpen}d</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 text-[11px] font-medium opacity-80">
        Drill into AML.01.05.02 attestation (capacity is the why) →
      </div>
    </button>
  );
};

// SanctionsScreeningPosture — snapshot card with screening + reporting status.
const SanctionsScreeningPosture = ({ metrics }) => {
  const m = metrics || {};
  const p = m.payments || {};
  const c = m.customers || {};
  const r = m.reportingStatus || {};
  return (
    <div className={`w-full rounded-xl border-2 p-4 shadow-sm ${bandBg(m.postureBand)}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">Sanctions posture · OFSI / OFAC / UN / EU</div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">Screening &amp; reporting</h3>
        </div>
        <StatusBadge tone={m.postureBand} label={m.postureBand?.toUpperCase()} />
      </div>
      <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{m.postureNarrative}</p>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="rounded bg-white/70 border border-slate-200 p-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Payments screened</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{p.screenedThisPeriod?.toLocaleString("en-GB")}</div>
          <div className="text-[10px] text-slate-500">{p.holdsThisPeriod} holds · {p.truePositives} TP · {p.blockedTransactions} blocked</div>
        </div>
        <div className="rounded bg-white/70 border border-slate-200 p-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Customers screened</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{c.screenedAtOnboarding?.toLocaleString("en-GB")}</div>
          <div className="text-[10px] text-slate-500">{c.truePositives} TP · {c.falsePositives} FP · full coverage</div>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-[11px]">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${r.ofsiFreezeReports?.withinDeadline ? "bg-emerald-500" : "bg-rose-500"} flex-shrink-0`} />
          <span className="text-slate-700">OFSI freeze reports:</span>
          <span className="font-semibold text-slate-900">{r.ofsiFreezeReports?.submitted}/{r.ofsiFreezeReports?.dueThisPeriod} on time</span>
          <span className="text-slate-500 ml-auto">last {r.ofsiFreezeReports?.lastSubmitted}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${r.ofacBlockingReports?.withinDeadline ? "bg-emerald-500" : "bg-rose-500"} flex-shrink-0`} />
          <span className="text-slate-700">OFAC blocking reports:</span>
          <span className="font-semibold text-slate-900">{r.ofacBlockingReports?.dueThisPeriod} due</span>
          <span className="text-slate-500 ml-auto">last {r.ofacBlockingReports?.lastSubmitted}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${(r.nonComplianceWaivers?.open ?? 0) === 0 ? "bg-emerald-500" : "bg-amber-500"} flex-shrink-0`} />
          <span className="text-slate-700">Non-compliance waivers:</span>
          <span className="font-semibold text-slate-900">{r.nonComplianceWaivers?.open} open</span>
        </div>
      </div>
    </div>
  );
};

// CapacityVsDemandGauge — dual-line capacity (flat) vs demand (rising).
// Custom mini-SVG since the existing Sparkline only supports a single series.
const CapacityVsDemandGauge = ({ series }) => {
  if (!series.length) return <EmptyState message="No capacity series." />;
  const w = 480;
  const h = 120;
  const padX = 24;
  const padY = 16;
  const allValues = series.flatMap(p => [p.capacity, p.demand]);
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const range = maxV - minV || 1;
  const xAt = (i) => padX + (i / (series.length - 1)) * (w - padX * 2);
  const yAt = (v) => padY + (1 - (v - minV) / range) * (h - padY * 2);
  const linePath = (key, _stroke) =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(p[key])}`).join(' ');
  const last = series[series.length - 1];
  const gap = (last.demand || 0) - (last.capacity || 0);
  return (
    <div className={`w-full rounded-xl border-2 p-4 shadow-sm ${bandBg(gap > 0 ? "red" : "green")}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">L1/L2 disposition team · capacity vs demand</div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">The why behind the alert backlog</h3>
        </div>
        <StatusBadge tone={gap > 0 ? "red" : "green"} label={`GAP ${gap >= 0 ? "+" : ""}${gap}/wk`} />
      </div>

      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mt-2 max-w-full">
        {/* Capacity (flat, indigo) */}
        <path d={linePath("capacity", "#4f46e5")} fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4,3" />
        {/* Demand (rising, rose) */}
        <path d={linePath("demand", "#e11d48")} fill="none" stroke="#e11d48" strokeWidth="2.5" />
        {/* Last point markers */}
        <circle cx={xAt(series.length - 1)} cy={yAt(last.capacity)} r="3" fill="#4f46e5" />
        <circle cx={xAt(series.length - 1)} cy={yAt(last.demand)}   r="3" fill="#e11d48" />
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-indigo-600" style={{ borderTop: "2px dashed #4f46e5" }} />
          <span className="text-slate-700">Capacity (FTE-equivalent)</span>
          <span className="font-bold text-slate-900 ml-auto">{last.capacity?.toLocaleString("en-GB")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-0.5 bg-rose-600" />
          <span className="text-slate-700">Demand (alerts/wk)</span>
          <span className="font-bold text-rose-700 ml-auto">{last.demand?.toLocaleString("en-GB")}</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-700 mt-2 leading-relaxed">
        Capacity is fixed; demand has risen ~{Math.round(((last.demand - series[0].demand) / series[0].demand) * 100)}% over the period.
        Gap from week 8 onward → backlog accumulation → AML-C002 disposition control under pressure → AML.01.05.02 evidence completeness collapses.
      </p>
    </div>
  );
};

// MLRO Workspace — the SMF17 landing.
function MLROWorkspace({ openDrawer, setActiveScreen, setSelectedGSRId }) {
  const persona = personas.find(p => p.id === "smf17");
  if (!persona) return <EmptyState message="MLRO persona not configured." />;

  const fcKRIs = (kris || []).filter(k => {
    const r = (risks || []).find(rr => rr.id === k.riskId);
    return r && (r.croCategoryId === "fraud_financial_crime" || r.id === "R-FC-AML" || r.id === "R-FC-OFSI" || r.id === "R-FC-KYC");
  });

  const amlAppetite = (riskAppetiteMetrics || []).find(a => a.id === "APP-FC-002");

  const drillTo = (target) => {
    const t = MLRO_DRILL_TARGETS[target];
    if (!t) return;
    setSelectedGSRId && setSelectedGSRId(t.gsrId, t.cycleId);
    setActiveScreen && setActiveScreen("perRequirementAttestation");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-violet-700 font-bold">{persona.smfDesignation}</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{persona.label}</h1>
          <p className="text-sm text-slate-600 mt-1">{persona.subhead}</p>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          AML programme posture · POCA / MLR 2017 / OFSI
        </div>
      </div>

      {/* Header strip — KRI ribbon */}
      <FinancialCrimeKRIStrip kriList={fcKRIs} openDrawer={openDrawer} />

      {/* Top zone — primary widget */}
      <AlertBacklogVsAppetite
        alertSeries={amlAlertsByWeek || []}
        appetiteMetric={amlAppetite}
        onDrill={() => drillTo("alertBacklog")}
      />

      {/* Mid 2-up — SAR timeliness + EDD pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SARTimelinessBand series={sarFilingsByWeek || []} onDrill={() => drillTo("sarTimeliness")} />
        <EDDPipelineStatus items={eddPipelineItems || []} onDrill={() => drillTo("eddPipeline")} />
      </div>

      {/* Bottom 2-up — Sanctions + Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SanctionsScreeningPosture metrics={sanctionsScreeningMetrics} />
        <CapacityVsDemandGauge series={capacityVsDemandSeries || []} />
      </div>

      <p className="text-[10px] text-slate-400 text-center pt-2">
        Walk-through line: alert backlog rising → capacity stress is the why → AML.01.05.02 evidence completeness degrading is the consequence on the CRSA.
      </p>
    </div>
  );
}

// ─── SCREEN: Leadership Control Universe ──────────────────────────────────
function LeadershipControlUniverse({ openDrawer, filterDomain, setFilterDomain,
                                      // Pass 7.3 — area-drill prop set drives a top section that lists
                                      // GSRs in the selected area (CRSA cockpit → area drill); the
                                      // existing controls/obligations universe stays below for context.
                                      riskAreaId, setActiveScreen, setSelectedGSRId, selectedCycleId }) {
  // Pass 7.0 — activeViewMode lifted out of App body into local presentational state
  // (allowable per task constraint: presentational state may stay as useState).
  const [activeViewMode, setActiveViewMode] = useState("controls");

  // Pass 7.3 — area-drill mode resolves the area-scoped GSR list and the active cycle.
  const areaScopedGSRs = useMemo(() => {
    if (!riskAreaId) return null;
    const cosForArea = (controlObjectives || []).filter(c => c.riskAreaId === riskAreaId);
    const coIds = new Set(cosForArea.map(c => c.id));
    return (groupSetRequirements || []).filter(g => coIds.has(g.controlObjectiveId));
  }, [riskAreaId]);
  const areaCycle = useMemo(() => {
    if (!riskAreaId) return null;
    return (crsaAttestationCycles || []).find(c => c.riskAreaId === riskAreaId) || null;
  }, [riskAreaId]);
  const areaRecord = riskAreaId ? (riskAreas || []).find(a => a.id === riskAreaId) : null;
  const lineByGsr = useMemo(() => {
    if (!areaCycle) return {};
    const m = {};
    (crsaAttestationLines || [])
      .filter(l => l.cycleId === areaCycle.id)
      .forEach(l => { m[l.groupSetRequirementId] = l; });
    return m;
  }, [areaCycle]);

  const drillToGSR = (gsr) => {
    setSelectedGSRId(gsr.id, areaCycle ? areaCycle.id : (selectedCycleId || null));
    setActiveScreen("perRequirementAttestation");
  };

  const filtered = useMemo(() => {
    if (!filterDomain) return controls;
    return controls.filter(c => {
      const r = getRisk(c.linkedRiskIds[0]);
      return r?.croCategoryId === filterDomain;
    });
  }, [filterDomain]);

  const obligationsCoverage = useMemo(() => {
    const buckets = { fully_covered: [], thinly_covered: [], uncovered: [] };
    obligations.forEach(o => {
      const k = o.ocs.coverageStatus;
      if (buckets[k]) buckets[k].push(o);
    });
    return buckets;
  }, []);

  return (
    <div className="space-y-6">
      {/* Pass 7.3 — CRSA area-drill section (only when riskAreaId is set) */}
      {riskAreaId && areaCycle && areaRecord && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <button onClick={() => setActiveScreen && setActiveScreen("crsaCycleCockpit")}
              className="hover:text-indigo-700 hover:underline">
              CRSA Cycle Cockpit
            </button>
            <span>›</span>
            <span className="font-mono text-slate-700">{areaRecord.code} · area drill</span>
          </div>

          <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">{areaRecord.code} · {areaCycle.periodLabel}</div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{areaRecord.name}</h2>
                <p className="text-xs text-slate-600 mt-1">{areaRecord.crsaRiskStatement}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Completion</div>
                  <div className="text-2xl font-bold">{areaCycle.completionPct}%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Exceptions</div>
                  <div className={`text-2xl font-bold ${areaCycle.exceptionsCount > 0 ? "text-amber-700" : "text-emerald-700"}`}>{areaCycle.exceptionsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">GSRs</div>
                  <div className="text-2xl font-bold">{areaScopedGSRs ? areaScopedGSRs.length : 0}</div>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <CoverageMetric mode={areaCycle.coverageMode} populationSize={areaCycle.populationSize} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-12 gap-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              <div className="col-span-2">RACM Ref</div>
              <div className="col-span-7">Group Set Requirement</div>
              <div className="col-span-2 text-center">Evidence</div>
              <div className="col-span-1 text-right">Flags</div>
            </div>
            <div className="divide-y divide-slate-100">
              {(areaScopedGSRs || []).map(gsr => {
                const line = lineByGsr[gsr.id];
                const band = line?.evidenceCompletenessBand || gsr.currentEvidenceCompletenessBand;
                const pct = line?.evidenceCompletenessPct ?? gsr.currentEvidenceCompletenessPct;
                return (
                  <button key={gsr.id} onClick={() => drillToGSR(gsr)}
                    className="w-full text-left px-5 py-3 grid grid-cols-12 gap-3 items-center hover:bg-slate-50 transition">
                    <div className="col-span-2"><RACMRefBadge racmRef={gsr.racmRef} size="xs" /></div>
                    <div className="col-span-7 text-xs text-slate-800 leading-snug line-clamp-2">{gsr.requirementText}</div>
                    <div className="col-span-2 text-center">
                      <StatusBadge tone={band} label={`${pct ?? "—"}%`} size="xs" />
                    </div>
                    <div className="col-span-1 text-right space-x-1">
                      {line?.exceptionFlag && <span title="Exception" className="text-rose-600 font-bold text-sm">!</span>}
                      {gsr.thinCoverageFlag && <span title="Thin coverage" className="text-amber-600 font-bold text-sm">⚠</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Existing process-lane Control Universe (drill destination since Pass 7.1) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Control Universe &amp; Obligation Coverage</h2>
          <p className="text-xs text-slate-500">Drill destination · {controls.length} controls · {obligations.length} obligations</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-0.5">
          {["controls", "obligations"].map(m => (
            <button key={m} onClick={() => setActiveViewMode(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md ${activeViewMode === m ? "bg-white shadow-sm" : "text-slate-600"}`}>
              {m === "controls" ? "Controls" : "Obligation Coverage"}
            </button>
          ))}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Domain:</span>
        <button onClick={() => setFilterDomain(null)} className={`px-2.5 py-1 text-xs rounded ${!filterDomain ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>All</button>
        {croCategories.slice(0, 5).map(d => (
          <button key={d.id} onClick={() => setFilterDomain(d.id)} className={`px-2.5 py-1 text-xs rounded ${filterDomain === d.id ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{d.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          {activeViewMode === "controls" ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-12 gap-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                <div className="col-span-4">Control</div>
                <div className="col-span-2 text-center">Operating</div>
                <div className="col-span-2 text-center">Catch</div>
                <div className="col-span-2 text-center">Evidence</div>
                <div className="col-span-1 text-center">CES</div>
                <div className="col-span-1 text-right">Trend</div>
              </div>
              <div className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <button key={c.id} onClick={() => openDrawer("control", c.id, "controlUniverse")}
                    className="w-full text-left px-5 py-3 grid grid-cols-12 gap-3 items-center hover:bg-slate-50 transition">
                    <div className="col-span-4">
                      <div className="text-sm font-semibold text-slate-900">{c.id}</div>
                      <div className="text-xs text-slate-600 truncate">{c.title}</div>
                    </div>
                    <DimCell dim={c.threeDim.operating} />
                    <DimCell dim={c.threeDim.catch} />
                    <DimCell dim={c.threeDim.evidence} />
                    <div className="col-span-1 text-center">
                      <div className={`inline-block px-2 py-0.5 rounded font-bold text-sm ${bandBg(c.ces.band)}`}>{c.ces.current}</div>
                    </div>
                    <div className={`col-span-1 text-right text-xs font-medium ${trendTone(c.ces.trend)}`}>{trendArrow(c.ces.trend)} {c.ces.delta13w >= 0 ? "+" : ""}{c.ces.delta13w}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold">Obligation Coverage by Status</h3>
              </div>
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                {[
                  { key: "fully_covered", label: "Fully Covered", tone: "green" },
                  { key: "thinly_covered", label: "Thinly Covered", tone: "amber" },
                  { key: "uncovered", label: "Uncovered", tone: "red" },
                ].map(b => (
                  <div key={b.key} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className={`text-2xl font-bold ${bandText(b.tone)}`}>{(obligationsCoverage[b.key] || []).length}</div>
                        <div className="text-xs text-slate-500">{b.label}</div>
                      </div>
                      <span className={`h-3 w-3 rounded-full ${bandDot(b.tone)}`} />
                    </div>
                    <div className="space-y-1">
                      {(obligationsCoverage[b.key] || []).map(o => (
                        <button key={o.id} onClick={() => openDrawer("obligation", o.id, "controlUniverse")}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-slate-50 rounded">
                          <div className="font-medium text-slate-900 truncate">{o.citationShort}</div>
                          <div className="text-[10px] text-slate-500 truncate">{o.regulator} · OCS {o.ocs.score}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: coverage gaps + AI */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Coverage Gaps</h3>
            <div className="space-y-2">
              {coverageGaps.map(g => (
                <div key={g.id} className={`p-2 rounded border ${bandBg(g.severity === "high" || g.severity === "critical" ? "red" : g.severity === "medium" ? "amber" : "neutral")}`}>
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold">{g.gapType.replace(/_/g, " ")}</span>
                    <span className="text-[10px]">{g.ageDays}d</span>
                  </div>
                  <div className="text-xs font-medium">{g.entityId}</div>
                  <div className="text-[10px] mt-1 line-clamp-2">{g.recommendedRemediation}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Domain AI Insights</h3>
            <div className="space-y-2">
              {aiInsights.filter(i => i.screenRelevance.includes("controlUniverse")).slice(0, 3).map(i => (
                <button key={i.id} onClick={() => openDrawer("aiInsight", i.id, "controlUniverse")}
                  className="w-full text-left p-2 rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30">
                  <div className="text-xs font-medium text-slate-900 line-clamp-1">{i.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">conf {Math.round(i.confidence * 100)}% · {i.type.replace("_", " ")}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pass 7.5 — Obligation Coverage Map (top-level cross-persona screen) ──
// Promoted from a drill-only buried view inside LeadershipControlUniverse to a
// top-level shared screen. Default lens is forward coverage (Obligation row →
// satisfying Controls). Four additional lenses surface as tabs:
//   - Reverse        : pick a Control, see every Obligation + GSR it satisfies
//   - Coverage Gaps  : requirements covered by exactly one weak control
//                      (the AML.01.13.01 / AML-C006 thin-coverage anchor)
//   - Reg-change     : pick a horizon-scan item, see lineage downstream
//                      (controls / obligations / processes / vendors / cohorts)
//   - CRSA Coverage  : same forward-coverage rendering keyed on GSR rows
//                      instead of Obligation rows ("what controls satisfy
//                      requirement Y" vs. "what controls satisfy regulation X")
//
// Constraint: extend, don't rebuild. The existing 3-bucket "fully / thinly /
// uncovered" rendering used inside LeadershipControlUniverse is preserved
// unchanged; the Forward lens here mirrors its logic for the top-level
// surface.

const COVERAGE_LENSES = [
  { id: 'forward',   label: 'Forward',        sub: 'Obligation → Controls' },
  { id: 'crsa',      label: 'CRSA Coverage',  sub: 'Group Set Requirement → Controls' },
  { id: 'reverse',   label: 'Reverse',        sub: 'Control → Obligations + GSRs' },
  { id: 'gaps',      label: 'Coverage Gaps',  sub: 'Single weak control' },
  { id: 'regchange', label: 'Reg-change Impact', sub: 'Horizon item → downstream lineage' },
];

// Forward lens — preserves the existing 3-bucket Obligation Coverage panel.
const ForwardCoverageLens = ({ openDrawer }) => {
  const buckets = useMemo(() => {
    const acc = { fully_covered: [], thinly_covered: [], uncovered: [] };
    (obligations || []).forEach(o => {
      const k = o.ocs?.coverageStatus;
      if (acc[k]) acc[k].push(o);
    });
    return acc;
  }, []);
  const cells = [
    { key: 'fully_covered',  label: 'Fully Covered',  tone: 'green' },
    { key: 'thinly_covered', label: 'Thinly Covered', tone: 'amber' },
    { key: 'uncovered',      label: 'Uncovered',      tone: 'red'   },
  ];
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Obligation coverage by status</h3>
          <p className="text-[11px] text-slate-500">{(obligations || []).length} obligations · click a row to open the obligation drawer</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {cells.map(b => (
          <div key={b.key} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className={`text-3xl font-bold ${bandText(b.tone)}`}>{(buckets[b.key] || []).length}</div>
                <div className="text-xs text-slate-500">{b.label}</div>
              </div>
              <span className={`h-3 w-3 rounded-full ${bandDot(b.tone)}`} />
            </div>
            <div className="space-y-1">
              {(buckets[b.key] || []).map(o => (
                <button key={o.id} onClick={() => openDrawer && openDrawer("obligation", o.id, "coverageMap")}
                  className="w-full text-left px-2 py-1.5 text-xs hover:bg-slate-50 rounded">
                  <div className="font-medium text-slate-900 truncate">{o.citationShort || o.citation}</div>
                  <div className="text-[10px] text-slate-500 truncate">{o.regulator} · {(o.linkedControlIds || []).length} controls · OCS {o.ocs?.score ?? "—"}</div>
                </button>
              ))}
              {(buckets[b.key] || []).length === 0 && (
                <p className="text-[11px] text-slate-400 italic px-2 py-1">No obligations in this bucket.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// CRSA Coverage Lens — same forward rendering keyed on GSR rows.
const CRSACoverageLens = ({ openDrawer, setSelectedGSRId, setActiveScreen }) => {
  const all = groupSetRequirements || [];
  const drillToGSR = (gsrId) => {
    // Resolve the GSR's owning cycle deterministically (the single Q2 2026
    // cycle for that area).
    const gsr = all.find(g => g.id === gsrId);
    const co = gsr ? (controlObjectives || []).find(c => c.id === gsr.controlObjectiveId) : null;
    const area = co ? (riskAreas || []).find(a => a.id === co.riskAreaId) : null;
    const cycle = area ? (crsaAttestationCycles || []).find(c => c.riskAreaId === area.id) : null;
    if (gsr && cycle) {
      setSelectedGSRId && setSelectedGSRId(gsrId, cycle.id);
      setActiveScreen && setActiveScreen("perRequirementAttestation");
    }
  };
  const Bucket = ({ filterFn, label, tone }) => {
    const rows = all.filter(filterFn);
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={`text-3xl font-bold ${bandText(tone)}`}>{rows.length}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
          <span className={`h-3 w-3 rounded-full ${bandDot(tone)}`} />
        </div>
        <div className="space-y-1">
          {rows.slice(0, 12).map(g => (
            <button key={g.id} onClick={() => drillToGSR(g.id)}
              className="w-full text-left px-2 py-1.5 text-xs hover:bg-slate-50 rounded">
              <div className="flex items-center gap-1.5">
                <RACMRefBadge racmRef={g.racmRef} size="xs" />
                {g.thinCoverageFlag && <span title="Thin coverage" className="text-amber-600 text-xs">⚠</span>}
              </div>
              <div className="text-[10px] text-slate-600 truncate mt-0.5">{(g.controlIds || []).length} controls · {g.currentEvidenceCompletenessPct}% evidence</div>
            </button>
          ))}
          {rows.length > 12 && <p className="text-[10px] text-slate-400 italic px-2">+{rows.length - 12} more</p>}
          {rows.length === 0 && <p className="text-[11px] text-slate-400 italic px-2 py-1">No requirements in this bucket.</p>}
        </div>
      </div>
    );
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Group Set Requirement coverage · {all.length} requirements</h3>
        <p className="text-[11px] text-slate-500">Same coverage logic, keyed on CRSA Group Set Requirements rather than Obligations.  Click a row to open the Per-Requirement Attestation View.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <Bucket label="Multi-control coverage" tone="green"
          filterFn={g => (g.controlIds || []).length >= 2 && !g.thinCoverageFlag} />
        <Bucket label="Single-control coverage" tone="amber"
          filterFn={g => (g.controlIds || []).length === 1 && !g.thinCoverageFlag} />
        <Bucket label="Thin / uncovered" tone="red"
          filterFn={g => g.thinCoverageFlag || (g.controlIds || []).length === 0} />
      </div>
    </div>
  );
};

// Reverse lens — pick a control, see every obligation and GSR it satisfies.
const ReverseCoverageQuery = ({ openDrawer, setSelectedGSRId, setActiveScreen }) => {
  const [pickedControlId, setPickedControlId] = useState('AML-C002'); // demo-friendly default
  const ctrl = (controls || []).find(c => c.id === pickedControlId);
  const obls = useMemo(() => {
    return (obligations || []).filter(o => (o.linkedControlIds || []).includes(pickedControlId));
  }, [pickedControlId]);
  const gsrs = useMemo(() => {
    return (groupSetRequirements || []).filter(g => (g.controlIds || []).includes(pickedControlId));
  }, [pickedControlId]);
  const drillToGSR = (gsrId) => {
    const gsr = (groupSetRequirements || []).find(g => g.id === gsrId);
    const co = gsr ? (controlObjectives || []).find(c => c.id === gsr.controlObjectiveId) : null;
    const area = co ? (riskAreas || []).find(a => a.id === co.riskAreaId) : null;
    const cycle = area ? (crsaAttestationCycles || []).find(c => c.riskAreaId === area.id) : null;
    if (gsr && cycle) {
      setSelectedGSRId && setSelectedGSRId(gsrId, cycle.id);
      setActiveScreen && setActiveScreen("perRequirementAttestation");
    }
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-700">Show what this control satisfies:</span>
          <select value={pickedControlId} onChange={(e) => setPickedControlId(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white">
            {(controls || []).map(c => (
              <option key={c.id} value={c.id}>{c.id} — {c.title}</option>
            ))}
          </select>
          {ctrl && <StatusBadge tone={ctrl.ces?.band || "neutral"} label={`CES ${ctrl.ces?.current ?? "—"}`} size="xs" />}
        </div>
        {ctrl && (
          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{ctrl.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Regulatory obligations satisfied</h3>
            <p className="text-[11px] text-slate-500">{obls.length} obligations</p>
          </div>
          <div className="divide-y divide-slate-100">
            {obls.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic p-4">No obligations linked to this control.</p>
            ) : obls.map(o => (
              <button key={o.id} onClick={() => openDrawer && openDrawer("obligation", o.id, "coverageMap")}
                className="w-full text-left px-5 py-3 hover:bg-slate-50 transition">
                <div className="text-xs font-semibold text-slate-900">{o.citationShort || o.citation}</div>
                <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{o.requirementText}</div>
                <div className="text-[10px] text-slate-500 mt-1">{o.regulator} · OCS {o.ocs?.score ?? "—"} · {o.ocs?.coverageStatus?.replace(/_/g, " ")}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">CRSA Group Set Requirements satisfied</h3>
            <p className="text-[11px] text-slate-500">{gsrs.length} requirements · click to open the Per-Requirement view</p>
          </div>
          <div className="divide-y divide-slate-100">
            {gsrs.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic p-4">No GSRs linked to this control.</p>
            ) : gsrs.map(g => (
              <button key={g.id} onClick={() => drillToGSR(g.id)}
                className="w-full text-left px-5 py-3 hover:bg-slate-50 transition">
                <div className="flex items-center gap-2">
                  <RACMRefBadge racmRef={g.racmRef} size="xs" />
                  <StatusBadge tone={g.currentEvidenceCompletenessBand} label={`${g.currentEvidenceCompletenessPct}%`} size="xs" />
                  {g.thinCoverageFlag && <span title="Thin coverage" className="text-amber-600 text-xs">⚠</span>}
                </div>
                <div className="text-[11px] text-slate-700 line-clamp-2 mt-1">{g.requirementText}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Coverage Gaps lens — single-weak-control surfacing.
const CoverageGapPanel = ({ setSelectedGSRId, setActiveScreen }) => {
  const all = groupSetRequirements || [];
  const total = all.length;
  // Definition of "thin coverage" per spec §6: a GSR with thinCoverageFlag true,
  // OR exactly one mapped control with band amber/red.
  const thin = useMemo(() => {
    return all.filter(g => {
      if (g.thinCoverageFlag) return true;
      const cIds = g.controlIds || [];
      if (cIds.length !== 1) return false;
      const c = (controls || []).find(cc => cc.id === cIds[0]);
      return c && (c.ces?.band === "amber" || c.ces?.band === "red");
    });
  }, []);
  const drill = (g) => {
    const co = (controlObjectives || []).find(c => c.id === g.controlObjectiveId);
    const area = co ? (riskAreas || []).find(a => a.id === co.riskAreaId) : null;
    const cycle = area ? (crsaAttestationCycles || []).find(c => c.riskAreaId === area.id) : null;
    if (cycle) {
      setSelectedGSRId && setSelectedGSRId(g.id, cycle.id);
      setActiveScreen && setActiveScreen("perRequirementAttestation");
    }
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50/40 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-amber-800">{thin.length}</span>
          <span className="text-amber-900 text-sm">of {total} requirements covered by a single weak control or thin-coverage flag</span>
        </div>
        <p className="text-[11px] text-amber-900 mt-2 leading-relaxed">
          Coverage-gap surfacing is the regulator-credible analysis that no competitor offers — it's the OBL-OCC-2023-17-005 / VO-C005 pattern from the US build, applied here against the UK CRSA's 70-requirement universe.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Thin-coverage requirements</h3>
          <p className="text-[11px] text-slate-500">Click a row to open the Per-Requirement Attestation view; supplemental control design is the remediation track.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {thin.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic p-4">No coverage gaps surfaced.</p>
          ) : thin.map(g => {
            const cIds = g.controlIds || [];
            const c = cIds.length ? (controls || []).find(cc => cc.id === cIds[0]) : null;
            return (
              <button key={g.id} onClick={() => drill(g)}
                className="w-full text-left px-5 py-3 hover:bg-slate-50 transition grid grid-cols-12 gap-3 items-center">
                <div className="col-span-2"><RACMRefBadge racmRef={g.racmRef} size="xs" /></div>
                <div className="col-span-6 text-xs text-slate-800 leading-snug line-clamp-2">{g.requirementText}</div>
                <div className="col-span-2 text-center">
                  {c ? (
                    <div className="text-[10px]">
                      <div className="font-semibold text-slate-900">{c.id}</div>
                      <div className="text-slate-500">CES {c.ces?.current ?? "—"} {c.ces?.band ? `· ${c.ces.band}` : ""}</div>
                    </div>
                  ) : <div className="text-[10px] text-slate-500">no controls mapped</div>}
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">{g.thinCoverageFlag ? "THIN" : "SINGLE-WEAK"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Reg-change Impact Lineage — pick a horizon item, see lineage downstream.
const RegChangeImpactLineage = ({ openDrawer }) => {
  const items = horizonScanItems || [];
  const [pickedId, setPickedId] = useState(items[0]?.id || null);
  const item = items.find(i => i.id === pickedId);
  const LineageRow = ({ label, ids, onClickId, count }) => (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</span>
        <span className="text-[10px] text-slate-700 font-bold">{count ?? (ids || []).length}</span>
      </div>
      {(ids || []).length === 0 ? (
        <p className="text-[10px] text-slate-400 italic">— no impact</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {ids.map(id => (
            <button key={id} onClick={() => onClickId && onClickId(id)}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200">
              {id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-700">Reg-change item:</span>
          <select value={pickedId || ""} onChange={(e) => setPickedId(e.target.value)}
            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white">
            {items.map(i => (
              <option key={i.id} value={i.id}>{i.regulatorBody} — {i.citation}</option>
            ))}
          </select>
          {item && <StatusBadge
            tone={item.applicabilityStatus === "completed" ? "green" : "amber"}
            label={item.applicabilityStatus.replace(/_/g, " ").toUpperCase()} size="xs" />}
        </div>
        {item && (
          <>
            <h3 className="text-sm font-bold text-slate-900 mt-2">{item.title}</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{item.summary}</p>
            <div className="text-[10px] text-slate-500 mt-1.5">
              Published {item.publishedDate} · Owner {item.assessmentOwnerSMFId} · Target {item.targetCompletionDate}
            </div>
          </>
        )}
      </div>

      {item && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <LineageRow label="CRO categories impacted" ids={item.impactedCROCategoryIds} />
          <LineageRow label="Risk areas impacted"   ids={item.impactedRiskAreaIds} />
          <LineageRow label="Risks impacted"        ids={item.impactedRiskIds}
            onClickId={id => openDrawer && openDrawer("risk", id, "coverageMap")} />
          <LineageRow label="Obligations impacted" ids={item.impactedObligationIds}
            onClickId={id => openDrawer && openDrawer("obligation", id, "coverageMap")} />
          <LineageRow label="Controls impacted"    ids={item.impactedControlIds}
            onClickId={id => openDrawer && openDrawer("control", id, "coverageMap")} />
          <LineageRow label="Processes impacted"   ids={item.impactedProcessIds} />
          <LineageRow label="Vendors impacted"     ids={item.impactedVendorIds} />
          <LineageRow label="Customer cohorts"     ids={item.impactedCustomerCohorts} />
        </div>
      )}
    </div>
  );
};

// ObligationCoverageMap — top-level cross-persona screen (Pass 7.5).
function ObligationCoverageMap({ openDrawer, setActiveScreen, setSelectedGSRId }) {
  const [activeLens, setActiveLens] = useState('forward');
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Cross-persona shared screen</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Obligation Coverage Map</h1>
          <p className="text-sm text-slate-600 mt-1">Forward and reverse traversal of the regulation → obligation → CRSA requirement → control graph.  Pick a lens.</p>
        </div>
      </div>

      {/* Lens tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {COVERAGE_LENSES.map(lens => (
          <button key={lens.id} onClick={() => setActiveLens(lens.id)}
            className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap ${
              activeLens === lens.id
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}>
            <div>{lens.label}</div>
            <div className={`text-[10px] font-normal mt-0.5 ${activeLens === lens.id ? "text-indigo-500" : "text-slate-400"}`}>
              {lens.sub}
            </div>
          </button>
        ))}
      </div>

      {/* Active lens body */}
      {activeLens === 'forward'   && <ForwardCoverageLens openDrawer={openDrawer} />}
      {activeLens === 'crsa'      && <CRSACoverageLens openDrawer={openDrawer} setSelectedGSRId={setSelectedGSRId} setActiveScreen={setActiveScreen} />}
      {activeLens === 'reverse'   && <ReverseCoverageQuery openDrawer={openDrawer} setSelectedGSRId={setSelectedGSRId} setActiveScreen={setActiveScreen} />}
      {activeLens === 'gaps'      && <CoverageGapPanel setSelectedGSRId={setSelectedGSRId} setActiveScreen={setActiveScreen} />}
      {activeLens === 'regchange' && <RegChangeImpactLineage openDrawer={openDrawer} />}
    </div>
  );
}

const DimCell = ({ dim }) => (
  <div className="col-span-2 flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${bandBar(dim.band)}`} style={{ width: `${dim.current}%` }} />
    </div>
    <div className={`text-xs font-bold w-8 text-right ${bandText(dim.band)}`}>{dim.current}</div>
  </div>
);

// ─── SCREEN: Population Test Workspace ────────────────────────────────────
function PopulationTestWorkspace({ selectedTestId, openDrawer, setActiveScreen, setSelectedPackId }) {
  const test = getTest(selectedTestId);
  if (!test) return <EmptyState message="Select a test from the Compliance Workspace." />;
  const control = getControl(test.controlId);
  const workpaper = test.workpaperId ? getWorkpaper(test.workpaperId) : null;
  const tester = getActor(test.testerId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EntityTypeBadge type="control" />
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">Test {test.id}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{control?.title}</h2>
            <p className="text-xs text-slate-500 mt-1">Window {test.testWindowStart} → {test.testWindowEnd} · Tester {tester?.name} ({tester?.role}) · {test.testerFunction}</p>
          </div>
          <StatusBadge tone={test.status === "done" ? "green" : "amber"} label={test.status.replace("_", " ").toUpperCase()} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: scoping */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Population Scoping</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Stat k="Population" v={test.populationSize.toLocaleString()} />
                <Stat k="Excluded" v={test.excludedCount} sub={test.excludedReason || "—"} />
                <Stat k="Eligible" v={test.eligibleCount.toLocaleString()} tone="emerald" />
                <Stat k="Tested" v={test.testedCount.toLocaleString()} tone={test.testedCount === test.eligibleCount ? "emerald" : "amber"} />
              </div>
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Population Query</div>
                <div className="text-xs font-mono text-slate-700">{test.populationQueryRef}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 break-all">hash {test.populationQueryHash}</div>
              </div>
              {test.samplingRationale && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold mb-1">Sampling Rationale</div>
                  <div className="text-xs text-amber-900">{test.samplingRationale}</div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Testability Classification</h3>
            <div className={`p-3 rounded-lg border-2 ${test.method === "population" ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold uppercase">{test.method.replace("_", " ")}</span>
                <span className="text-[10px] font-medium">{control?.judgementDependence} judgement</span>
              </div>
              <div className="text-xs text-slate-700">
                {test.method === "population"
                  ? `100% population reperformance — ${test.populationSize.toLocaleString()} cases tested.`
                  : `Risk-based sample of ${test.testedCount} from ${test.populationSize.toLocaleString()} eligible.`}
              </div>
            </div>
          </div>
        </div>

        {/* Right: results */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Results Summary</h3>
              <StatusBadge tone={test.result === "pass" ? "green" : test.result === "qualified" || test.result === "pass_with_observations" ? "amber" : "red"} label={test.result.replace(/_/g, " ").toUpperCase()} />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-700">{(test.testedCount - test.exceptionCount).toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">Passed</div>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-rose-700">{test.exceptionCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold">Exceptions</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-slate-700">{((test.exceptionCount / test.testedCount) * 100).toFixed(1)}%</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Exception Rate</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 mb-1">Exception breakdown</div>
              {test.exceptionDetails.map((e, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="text-xs text-slate-600 w-44">{e.type.replace(/_/g, " ")}</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400" style={{ width: `${(e.count / test.exceptionCount) * 100}%` }} />
                  </div>
                  <div className="text-xs font-bold w-10 text-right">{e.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Exceptions list */}
          {test.exceptionInstanceIds.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold">Exception Cases ({test.exceptionInstanceIds.length})</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {test.exceptionInstanceIds.slice(0, 12).map(ciId => {
                  const ci = getControlInstance(ciId);
                  if (!ci) return null;
                  const evMissing = ci.evidenceIds.length === 0;
                  return (
                    <button key={ciId} onClick={() => openDrawer("evidence", evMissing ? ciId : ci.evidenceIds[0], "populationTesting")}
                      className="w-full text-left px-5 py-2 hover:bg-slate-50 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-3 font-mono text-slate-700">{ci.id}</div>
                      <div className="col-span-3 text-slate-600">{ci.caseOrTransactionId}</div>
                      <div className="col-span-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${evMissing ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                          {evMissing ? "evidence missing" : "evidence incomplete"}
                        </span>
                      </div>
                      <div className="col-span-2 text-slate-500">{getActor(ci.operatorId)?.name || "—"}</div>
                      <div className="col-span-1 text-right text-indigo-600">drill →</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monitoring Test preview */}
          {workpaper && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Monitoring Test · {workpaper.id}</h3>
                  <p className="text-[10px] text-slate-500">{workpaper.aiAssistanceLineage ? `AI-drafted · ${workpaper.aiAssistanceLineage.humanEditsCount} human edits · owned by ${workpaper.aiAssistanceLineage.finalHumanOwner}` : "Manual"}</p>
                </div>
                <StatusBadge tone={workpaper.status === "draft" ? "amber" : "green"} label={workpaper.status.replace("_", " ")} size="xs" />
              </div>
              <div className="text-xs text-slate-700 leading-relaxed mb-3">{workpaper.findings}</div>
              <div className="rounded-md bg-slate-50 border border-slate-200 p-3 mb-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Conclusion</div>
                <div className="text-xs text-slate-800">{workpaper.conclusion}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedPackId("AP-S165-FCC-001"); setActiveScreen("monitoringReportBuilder"); }}
                  className="flex-1 py-2 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-md">
                  Add to Monitoring Report →
                </button>
                <button className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 rounded-md">Export PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: SMCR Reasonable Steps Workspace ──────────────────────────────
function SMCRReasonableStepsWorkspace({ variant = 'v2', selectedSMFId, setSelectedSMFId, smfTrails, pendingDecisionId, setPendingDecisionId, decisionRationale, setDecisionRationale, captureSMFDecision, openDrawer, setActiveScreen, setSelectedPackId }) {
  const ui = getUkAuditUi(variant);
  const smf = getSMF(selectedSMFId);
  if (!smf) return <EmptyState message="Select an SMF." />;
  const live = smfTrails[selectedSMFId];
  const rss = live.rss;

  const rssComponents = ui.rssComponents;

  return (
    <div className="space-y-6">
      {/* SMF identity card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EntityTypeBadge type="smf" />
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-600">{smf.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{smf.name}</h2>
            <div className="text-sm text-slate-700 mt-0.5">{smf.functionLabel}</div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">{smf.smfFunction}</span>
              {smf.prescribedResponsibilities.map(pr => (
                <span key={pr} className="text-[10px] font-bold tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{pr}</span>
              ))}
              <span className="text-[10px] text-slate-500">SoR v{smf.sorVersion} · {smf.sorEffectiveFrom}</span>
              <span className="text-[10px] text-slate-500">MRM ref {smf.managementResponsibilitiesMapRef}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${bandText(rss.band)}`}>{rss.score}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">RSS</div>
            <StatusBadge tone={rss.band} label={rss.band.toUpperCase()} size="xs" />
          </div>
        </div>

        {/* SMF picker */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-[10px] text-slate-500">View SMF:</span>
          {smfHolders.map(s => (
            <button key={s.id} onClick={() => setSelectedSMFId(s.id)}
              className={`px-2.5 py-1 text-xs rounded ${selectedSMFId === s.id ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s.smfFunction}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* RSS decomposition */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <RssDecomposition components={rss.components} defs={rssComponents} bandText={bandText} bandBar={bandBar} />

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Accountability Boundary</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-slate-900">{smf.accountableProcessIds.length}</div>
                <div className="text-[10px] text-slate-500">Processes</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-slate-900">{smf.accountableControlIds.length}</div>
                <div className="text-[10px] text-slate-500">Controls</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-lg font-bold text-slate-900">{smf.accountableObligationIds.length}</div>
                <div className="text-[10px] text-slate-500">Obligations</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">SoR Reference</h3>
            <div className="text-xs space-y-1 text-slate-700">
              <div>SoR version: <span className="font-mono">v{smf.sorVersion}</span></div>
              <div>Effective: <span className="font-mono">{smf.sorEffectiveFrom}</span></div>
              <div>Last attestation: <span className="font-mono">{smf.lastAttestationDate}</span></div>
              <div>Conduct rule breaches: <span className={`font-bold ${smf.conductRuleBreaches === 0 ? "text-emerald-600" : "text-rose-600"}`}>{smf.conductRuleBreaches}</span></div>
            </div>
          </div>
        </div>

        {/* Centre: Awaiting acks + capture */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Awaiting My Acknowledgement ({live.awaiting.length})</h3>
              {live.awaiting.length === 0 && <StatusBadge tone="green" label="ALL CLEAR" size="xs" />}
            </div>
            <div className="divide-y divide-slate-100">
              {live.awaiting.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No items awaiting acknowledgement.</div>
              ) : (
                live.awaiting.map((a, idx) => {
                  const target = a.targetType === "issue" ? getIssue(a.targetId) : a.targetType === "appetite_breach" ? getAppetite(a.targetId) : getKRI(a.targetId);
                  const isExpanded = pendingDecisionId === a.targetId;
                  return (
                    <div key={a.targetId + idx} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{a.targetType.replace("_", " ")}</span>
                            <span className="text-xs font-mono text-slate-700">{a.targetId}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.daysOpen > 30 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{a.daysOpen}d open</span>
                          </div>
                          <div className="text-sm text-slate-900">{target?.title || target?.metric || target?.name || "—"}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Raised {a.raisedDate}</div>
                        </div>
                        <button onClick={() => setPendingDecisionId(isExpanded ? null : a.targetId)}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-md flex-shrink-0">
                          {isExpanded ? "Cancel" : "Capture decision"}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <textarea value={decisionRationale} onChange={(e) => setDecisionRationale(e.target.value)}
                            placeholder="Capture your reasonable-steps rationale: what you knew, what you did, what evidence supports the decision…"
                            className="w-full text-xs p-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" rows={3} />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setPendingDecisionId(null); setDecisionRationale(""); }}
                              className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                            <button onClick={() => captureSMFDecision(selectedSMFId, a)} disabled={!decisionRationale.trim()}
                              className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded disabled:bg-slate-300 disabled:cursor-not-allowed">
                              Sign & lodge
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold">Reasonable Steps Trail</h3>
              <p className="text-[10px] text-slate-500">Chronological · click any event to drill to evidence</p>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {live.trail.map((t, idx) => (
                <button key={idx} onClick={() => t.evidenceId && openDrawer("evidence", t.evidenceId, "smcrWorkspace")}
                  className="w-full text-left px-5 py-3 hover:bg-slate-50 transition flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700">{t.eventType}</span>
                      <span className="text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="text-xs text-slate-800">{t.label}</div>
                    {t.evidenceId && <div className="text-[10px] font-mono text-indigo-600 mt-0.5">→ {t.evidenceId}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: actions + accountable obligations */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">Accountable Obligations</h3>
            <div className="space-y-1">
              {smf.accountableObligationIds.map(oid => {
                const o = getObligation(oid);
                if (!o) return null;
                return (
                  <button key={oid} onClick={() => openDrawer("obligation", oid, "smcrWorkspace")}
                    className="w-full text-left p-2 rounded hover:bg-slate-50 text-xs">
                    <div className="font-medium text-slate-900">{o.citationShort}</div>
                    <div className="text-[10px] text-slate-500">{o.regulator} · OCS {o.ocs.score}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={() => { setSelectedPackId("AP-S165-FCC-001"); setActiveScreen("monitoringReportBuilder"); }}
            className="w-full p-3 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md">
            Generate s.166 Reasonable Steps Pack →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Monitoring Report Builder ───────────────────────────────────
function MonitoringReportBuilder({ variant = 'v2', selectedPackId, setSelectedPackId, openDrawer }) {
  const ui = getUkAuditUi(variant);
  const pack = getAuditPack(selectedPackId);
  if (!pack) return <EmptyState message="Select a monitoring report." />;

  const compositionRows = [
    { key: "controls", label: "Controls", entityType: "control", data: pack.composition.controls },
    { key: "obligations", label: "Obligations", entityType: "obligation", data: pack.composition.obligations },
    { key: "evidence", label: "Evidence", entityType: "evidence", data: pack.composition.evidence },
    { key: "issues", label: "Issues", entityType: "issue", data: pack.composition.issues },
    { key: "workpapers", label: "Monitoring Tests", entityType: null, data: pack.composition.workpapers },
    { key: "smfRecords", label: "SMF Records", entityType: "smf", data: pack.composition.smfRecords },
    { key: "kriObservations", label: "KRI Observations", entityType: null, data: pack.composition.kriObservations },
    { key: "appetiteObservations", label: "Appetite Observations", entityType: null, data: pack.composition.appetiteObservations },
  ];

  const stages = ["drafting", "internal_review", "legal_review", "ready_to_send", "sent"];
  const stageIdx = stages.indexOf(pack.readinessStatus);

  return (
    <div className="space-y-6">
      {/* Pack picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Pack:</span>
        {auditPacks.map(p => (
          <button key={p.id} onClick={() => setSelectedPackId(p.id)}
            className={`px-3 py-1.5 text-xs rounded ${selectedPackId === p.id ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {p.id}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EntityTypeBadge type="auditPack" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{pack.scopeType.replace(/_/g, " ")}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{pack.targetAudience}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{pack.title}</h2>
            <div className="text-xs text-slate-500 mt-1">
              Window {pack.timeWindowStart} → {pack.timeWindowEnd} · As-of {pack.asOfStateDate} · State hash <span className="font-mono">{pack.asOfStateHash.slice(0, 16)}…</span>
            </div>
          </div>
          <StatusBadge tone={pack.readinessStatus === "ready_to_send" || pack.readinessStatus === "sent" ? "green" : "amber"} label={pack.readinessStatus.replace("_", " ").toUpperCase()} />
        </div>

        {/* Readiness pipeline */}
        <div className="mt-5 flex items-center gap-1">
          {stages.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex-1 flex flex-col items-center ${i <= stageIdx ? "" : "opacity-40"}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold ${i < stageIdx ? "bg-emerald-500 text-white" : i === stageIdx ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-slate-200 text-slate-600"}`}>
                  {i < stageIdx ? "✓" : i + 1}
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-medium">{s.replace("_", " ")}</div>
              </div>
              {i < stages.length - 1 && <div className={`h-0.5 flex-1 ${i < stageIdx ? "bg-emerald-500" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Composition */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Pack Composition</h3>
              <span className="text-xs font-bold text-slate-700">{pack.composition.totalEntities.toLocaleString()} entities</span>
            </div>
            <div className="divide-y divide-slate-100">
              {compositionRows.map(row => {
                const sample = row.data.sampleIds || [];
                return (
                  <button key={row.key} onClick={() => row.entityType && sample[0] && openDrawer(row.entityType, sample[0], "monitoringReportBuilder")}
                    disabled={!row.entityType || !sample[0]}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 disabled:hover:bg-transparent disabled:cursor-default flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{row.label}</div>
                      {sample.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-0.5">e.g. {sample.slice(0, 2).join(", ")}{sample.length > 2 ? `… +${sample.length - 2}` : ""}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{row.data.count.toLocaleString()}</span>
                      {row.entityType && sample[0] && <span className="text-[10px] text-indigo-600">→</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm mt-4">
            <h3 className="text-sm font-semibold mb-3">Chain-of-Custody Manifest</h3>
            <div className="space-y-2 text-xs">
              <KVRow k="Evidence count" v={pack.chainOfCustodyManifest.evidenceCount.toLocaleString()} />
              <KVRow k="All hashes verified" v={pack.chainOfCustodyManifest.allHashesVerified ? "✓ Yes" : "✗ No"} tone={pack.chainOfCustodyManifest.allHashesVerified ? "green" : "red"} />
              <KVRow k="Manifest signed" v={pack.chainOfCustodyManifest.manifestSigned ? "✓ Yes" : "Pending"} tone={pack.chainOfCustodyManifest.manifestSigned ? "green" : "amber"} />
              <KVRow k="Manifest TS" v={new Date(pack.chainOfCustodyManifest.manifestTs).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} />
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
<GeneratedNarrative pack={pack} subtitle={ui.narrativeSubtitle} singleParagraph={variant === "v3"} />

          <div className="flex gap-2">
            <button className="flex-1 py-2.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md">Route to Executive Review →</button>
            <button className="px-4 py-2.5 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 rounded-md">Export PDF + XLSX + Manifest</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: AI Insight Explorer ──────────────────────────────────────────
function AIInsightExplorer({ openDrawer }) {
  const [filterType, setFilterType] = useState(null);
  const filtered = filterType ? aiInsights.filter(i => i.type === filterType) : aiInsights;
  const types = [...new Set(aiInsights.map(i => i.type))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">AI Insight Explorer</h2>
        <p className="text-xs text-slate-500">{aiInsights.length} insights · explainable, cited, counter-factual where applicable</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">Type:</span>
        <button onClick={() => setFilterType(null)} className={`px-2.5 py-1 text-xs rounded ${!filterType ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>All</button>
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-2.5 py-1 text-xs rounded ${filterType === t ? "bg-indigo-100 text-indigo-700 font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{t.replace("_", " ")}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(i => (
          <button key={i.id} onClick={() => openDrawer("aiInsight", i.id, "aiInsights")}
            className="text-left p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider bg-violet-100 text-violet-800 px-2 py-0.5 rounded">AI · {i.type.replace("_", " ")}</span>
              <div className="flex items-center gap-2">
                <StatusBadge tone={i.severity === "high" ? "red" : i.severity === "medium" ? "amber" : "green"} label={i.severity.toUpperCase()} size="xs" />
                <span className="text-[10px] text-slate-500">conf {Math.round(i.confidence * 100)}%</span>
              </div>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">{i.title}</h4>
            <p className="text-xs text-slate-600 line-clamp-3 mb-3">{i.summary}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{i.modelId} v{i.modelVersion}</span>
              <span>{i.sourceRecordIds?.length || 0} sources</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── DRAWER ───────────────────────────────────────────────────────────────
function DetailDrawer({ drawer, closeDrawer, drillFromDrawer, drillBack, setActiveScreen, setSelectedSMFId, setSelectedPackId, setSelectedTestId }) {
  const { entityType, entityId, drillPath, sourceScreen } = drawer;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={closeDrawer} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[60%] xl:w-[55%] bg-white z-50 shadow-2xl flex flex-col">
        {/* Drawer header */}
        <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <EntityTypeBadge type={entityType} />
                <span className="text-xs font-mono text-slate-500">{entityId}</span>
              </div>
              {/* Breadcrumb */}
              {(sourceScreen || drillPath.length > 0) && (
                <div className="text-[10px] text-slate-500 flex items-center gap-1 flex-wrap mb-1">
                  {sourceScreen && <span className="capitalize">{sourceScreen.replace(/([A-Z])/g, " $1")}</span>}
                  {drillPath.map((p, i) => (
                    <React.Fragment key={i}>
                      <span className="text-slate-300">›</span>
                      <span className="font-medium">{p.label}</span>
                    </React.Fragment>
                  ))}
                  <span className="text-slate-300">›</span>
                  <span className="font-medium text-slate-700">current</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {drillPath.length > 0 && (
                <button onClick={drillBack} className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded">← Back</button>
              )}
              <button onClick={closeDrawer} className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded">✕ Close</button>
            </div>
          </div>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {entityType === "risk" && <RiskDetailContent risk={getRisk(entityId)} drillFromDrawer={drillFromDrawer} />}
          {entityType === "control" && <ControlDetailContent control={getControl(entityId)} drillFromDrawer={drillFromDrawer} />}
          {entityType === "obligation" && <ObligationDetailContent obligation={getObligation(entityId)} drillFromDrawer={drillFromDrawer} />}
          {entityType === "issue" && <IssueDetailContent issue={getIssue(entityId)} drillFromDrawer={drillFromDrawer} />}
          {entityType === "evidence" && <EvidenceDetailContent entityId={entityId} />}
          {entityType === "smf" && <SMFDetailContent smf={getSMF(entityId)} setSelectedSMFId={setSelectedSMFId} setActiveScreen={setActiveScreen} closeDrawer={closeDrawer} />}
          {entityType === "auditPack" && <AuditPackDetailContent pack={getAuditPack(entityId)} setSelectedPackId={setSelectedPackId} setActiveScreen={setActiveScreen} closeDrawer={closeDrawer} />}
          {entityType === "aiInsight" && <AIInsightDetailContent insight={getInsight(entityId)} drillFromDrawer={drillFromDrawer} />}
          {entityType === "kri" && <KRIDetailContent kri={getKRI(entityId)} drillFromDrawer={drillFromDrawer} />}
        </div>
      </div>
    </>
  );
}

// ─── DRAWER CONTENT: KRI (MLRO ribbon / appetite links) ───────────────────
function KRIDetailContent({ kri, drillFromDrawer }) {
  if (!kri) return <EmptyState message="KRI not found." />;
  const series = (kri.series || []).map((p) => p.value);
  const linkedRisk = kri.riskId ? getRisk(kri.riskId) : null;
  const owner = kri.accountableSMFId ? getSMF(kri.accountableSMFId) : null;
  const curTone = kri.currentBand === "red" ? "rose" : kri.currentBand === "amber" ? "amber" : "emerald";
  const curLabel =
    kri.unit === "%" ? `${kri.current}%` : kri.unit === "count" ? String(kri.current) : String(kri.current);
  const curSub = kri.unit === "count" ? "count" : kri.unit || "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{kri.name}</h2>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{kri.definition}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat k="Current" v={curLabel} sub={curSub || undefined} tone={curTone} />
        <Stat k="Status band" v={(kri.currentBand || "—").toUpperCase()} tone={curTone} />
        <Stat k="KRI id" v={kri.id} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Appetite thresholds</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <KVRow k="Green" v={Array.isArray(kri.greenBand) ? `${kri.greenBand[0]}–${kri.greenBand[1]} ${kri.unit || ""}` : "—"} tone="green" />
          <KVRow k="Amber" v={Array.isArray(kri.amberBand) ? `${kri.amberBand[0]}–${kri.amberBand[1]} ${kri.unit || ""}` : "—"} tone="amber" />
          <KVRow k="Red" v={Array.isArray(kri.redBand) ? `${kri.redBand[0]}–${kri.redBand[1]} ${kri.unit || ""}` : "—"} tone="red" />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold mb-2">Trend</h3>
        {series.length ? (
          <Sparkline series={series} band={kri.currentBand || "neutral"} width={320} height={40} fill />
        ) : (
          <p className="text-xs text-slate-500">No series data.</p>
        )}
      </div>

      {linkedRisk && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Linked risk</h3>
          <button
            type="button"
            onClick={() => drillFromDrawer("risk", linkedRisk.id)}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition"
          >
            <div className="text-sm font-medium text-slate-900">{linkedRisk.title}</div>
            <div className="text-[10px] text-indigo-600 mt-1">Open risk detail →</div>
          </button>
        </div>
      )}

      {owner && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Accountable SMF</h3>
          <button
            type="button"
            onClick={() => drillFromDrawer("smf", owner.id)}
            className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition"
          >
            <div className="text-sm font-medium text-slate-900">{owner.name}</div>
            <div className="text-xs text-slate-500">{owner.functionLabel} · {owner.smfFunction}</div>
            <div className="text-[10px] text-emerald-700 mt-1">Open SMF detail →</div>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DRAWER CONTENT: Risk ─────────────────────────────────────────────────
function RiskDetailContent({ risk, drillFromDrawer }) {
  if (!risk) return <EmptyState message="Risk not found." />;
  const owner = getSMF(risk.accountableSMFId);
  const linkedIssues = issues.filter(i => i.linkedRiskIds.includes(risk.id));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{risk.title}</h2>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{risk.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat k="Domain" v={getCROCategory(risk.croCategoryId)?.label || "—"} />
        <Stat k="Inherent" v={risk.inherentRating.toUpperCase()} />
        <Stat k="Residual" v={risk.residualRating.toUpperCase()} tone={risk.residualRating === "high" ? "rose" : risk.residualRating === "medium" ? "amber" : "emerald"} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-baseline gap-3 mb-3">
          <div className={`text-4xl font-bold ${bandText(risk.residualScore >= 70 ? "red" : risk.residualScore >= 50 ? "amber" : "green")}`}>{risk.residualScore}</div>
          <div className="text-xs text-slate-500">Residual Exposure Score</div>
          <span className={`ml-auto text-xs font-medium ${trendTone(risk.trend)}`}>{trendArrow(risk.trend)} {risk.trend.replace("_", " ")}</span>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">RES Decomposition</div>
          {Object.entries(risk.resDecomposition).map(([k, v]) => {
            const isBand = ["red", "amber", "green"].includes(v);
            return (
              <div key={k} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-600">{k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}</span>
                {isBand
                  ? <StatusBadge tone={v} label={v.toUpperCase()} size="xs" />
                  : <span className="font-bold text-slate-900">{v}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Accountable SMF</h3>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="text-sm font-medium">{owner?.name}</div>
          <div className="text-xs text-slate-500">{owner?.functionLabel} · {owner?.smfFunction}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Linked Controls ({risk.linkedControlIds.length})</h3>
        <div className="space-y-1">
          {risk.linkedControlIds.map(cid => {
            const c = getControl(cid);
            if (!c) return null;
            return (
              <button key={cid} onClick={() => drillFromDrawer("control", cid)}
                className="w-full text-left p-3 rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{c.id}</div>
                    <div className="text-xs text-slate-600 truncate">{c.title}</div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-bold ${bandBg(c.ces.band)}`}>CES {c.ces.current}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {linkedIssues.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Open Issues ({linkedIssues.length})</h3>
          <div className="space-y-1">
            {linkedIssues.map(i => (
              <button key={i.id} onClick={() => drillFromDrawer("issue", i.id)}
                className="w-full text-left p-3 rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-500">{i.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${severityBadge(i.severity)}`}>{i.severity.toUpperCase()}</span>
                </div>
                <div className="text-xs text-slate-800 line-clamp-1">{i.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {risk.linkedObligationIds.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Linked Obligations</h3>
          <div className="flex flex-wrap gap-1">
            {risk.linkedObligationIds.map(oid => {
              const o = getObligation(oid);
              if (!o) return null;
              return (
                <button key={oid} onClick={() => drillFromDrawer("obligation", oid)}
                  className="px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200">
                  {o.citationShort}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DRAWER CONTENT: Control ──────────────────────────────────────────────
function ControlDetailContent({ control, drillFromDrawer }) {
  if (!control) return <EmptyState message="Control not found." />;
  const linkedInsights = aiInsights.filter(i => i.relatedEntityIds?.some(r => r.type === "control" && r.id === control.id));
  const recentInstances = control.recentInstanceIds.map(id => getControlInstance(id)).filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{control.title}</h2>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{control.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat k="Type" v={"—"} />
        <Stat k="Nature" v={"—"} />
        <Stat k="Frequency" v={control.frequency.replace("_", " ")} />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Three-Dimensional Effectiveness</h3>
        <ThreeDimSignalBars threeDim={control.threeDim} />
        <div className="mt-3 p-3 rounded-lg border border-indigo-200 bg-indigo-50/40">
          <div className="flex items-center justify-between">
            <div className="text-xs text-indigo-900">
              <div className="font-bold mb-0.5">Composite Effectiveness Score</div>
              <div className="text-[10px] text-indigo-700">CES = 0.30 × Operating + 0.25 × Catch + 0.20 × Evidence + …</div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${bandText(control.ces.band)}`}>{control.ces.current}</div>
              <div className={`text-[10px] ${trendTone(control.ces.trend)}`}>{trendArrow(control.ces.trend)} {control.ces.delta13w >= 0 ? "+" : ""}{control.ces.delta13w} pts (13w)</div>
            </div>
          </div>
        </div>
      </div>

      {control.observedVariantDriftFlag && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <span className="text-amber-700">⚠</span>
            <div>
              <div className="text-xs font-bold text-amber-900">Process Variant Drift Detected</div>
              <div className="text-xs text-amber-800 mt-0.5">{control.observedVariantNote}</div>
              <div className="text-[10px] text-amber-700 mt-1">Documented signature: <span className="font-mono">{control.documentedVariantSignature}</span></div>
            </div>
          </div>
        </div>
      )}

      {recentInstances.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Recent Control Instances</h3>
          <div className="space-y-1">
            {recentInstances.slice(0, 6).map(ci => {
              const evMissing = ci.evidenceIds.length === 0;
              return (
                <button key={ci.id} onClick={() => drillFromDrawer("evidence", evMissing ? ci.id : ci.evidenceIds[0])}
                  className="w-full text-left p-2 rounded border border-slate-200 hover:bg-slate-50 grid grid-cols-12 gap-2 text-xs items-center">
                  <span className="col-span-3 font-mono text-slate-700">{ci.id}</span>
                  <span className="col-span-3 text-slate-600">{ci.caseOrTransactionId}</span>
                  <span className="col-span-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ci.outcome === "pass" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{ci.outcome}</span>
                  </span>
                  <span className="col-span-2 text-slate-500 text-[10px]">EC {ci.evidenceCompletenessScore}%</span>
                  <span className="col-span-1 text-right text-indigo-600">→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Linked Obligations</h3>
        <div className="flex flex-wrap gap-1">
          {control.linkedObligationIds.map(oid => {
            const o = getObligation(oid);
            if (!o) return null;
            return (
              <button key={oid} onClick={() => drillFromDrawer("obligation", oid)}
                className="px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200">
                {o.citationShort} · {o.regulator}
              </button>
            );
          })}
        </div>
      </div>

      {linkedInsights.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">AI Insights</h3>
          <div className="space-y-2">
            {linkedInsights.map(i => (
              <button key={i.id} onClick={() => drillFromDrawer("aiInsight", i.id)}
                className="w-full text-left p-3 rounded border border-violet-200 bg-violet-50/30 hover:bg-violet-50">
                <div className="text-xs font-bold text-slate-900 mb-0.5">{i.title}</div>
                <div className="text-[11px] text-slate-600 line-clamp-2">{i.summary}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DRAWER CONTENT: Obligation ───────────────────────────────────────────
function ObligationDetailContent({ obligation, drillFromDrawer }) {
  if (!obligation) return <EmptyState message="Obligation not found." />;
  const linkedIssues = issues.filter(i => i.linkedObligationIds.includes(obligation.id));

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-bold tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{obligation.regulator}</span>
          <span className="text-xs font-mono text-slate-700">{obligation.citation}</span>
          {obligation.linkedPrescribedResponsibilities.map(pr => (
            <span key={pr} className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{pr}</span>
          ))}
          {obligation.consumerDutyRelevant && <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">CONSUMER DUTY</span>}
          {obligation.smcrRelevant && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">SMCR</span>}
        </div>
        <h2 className="text-base font-bold text-slate-900">{obligation.sourceInstrumentTitle}</h2>
        <p className="text-xs text-slate-700 mt-2 leading-relaxed">{obligation.requirementText}</p>
        <a href={obligation.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:underline mt-2 inline-block">View source instrument →</a>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-baseline gap-3 mb-3">
          <div className={`text-3xl font-bold ${bandText(obligation.ocs.band)}`}>{obligation.ocs.score}</div>
          <div className="text-xs text-slate-500">Obligation Coverage Score</div>
          <StatusBadge tone={obligation.ocs.band} label={obligation.ocs.coverageStatus.replace("_", " ").toUpperCase()} size="xs" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <KVRow k="Linked controls" v={obligation.ocs.linkedControlsCount} />
          <KVRow k="Mean linked CES" v={obligation.ocs.meanLinkedCES} />
          <KVRow k="Evidence freshness" v={`${obligation.ocs.evidenceFreshnessDays}d`} />
          <KVRow k="Evidence completeness" v={`${obligation.ocs.evidenceCompleteness}%`} />
        </div>
      </div>

      {obligation.ocs.coverageStatus === "thinly_covered" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <div className="text-xs font-bold text-amber-900 mb-1">⚠ Thinly Covered</div>
          <div className="text-xs text-amber-800">Only {obligation.ocs.linkedControlsCount} control(s) currently mitigate this obligation. Consider supplemental controls or compensating measures.</div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Evidence Expectation</h3>
        <ul className="space-y-1">
          {obligation.evidenceExpectation.map((e, i) => (
            <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">·</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Linked Controls ({obligation.linkedControlIds.length})</h3>
        <div className="space-y-1">
          {obligation.linkedControlIds.map(cid => {
            const c = getControl(cid);
            if (!c) return null;
            return (
              <button key={cid} onClick={() => drillFromDrawer("control", cid)}
                className="w-full text-left p-3 rounded border border-slate-200 hover:bg-slate-50 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{c.id}</div>
                  <div className="text-xs text-slate-600 truncate">{c.title}</div>
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-bold ${bandBg(c.ces.band)}`}>CES {c.ces.current}</div>
              </button>
            );
          })}
        </div>
      </div>

      {obligation.regulatoryChangeHistory.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Regulatory Change History</h3>
          <div className="space-y-1">
            {obligation.regulatoryChangeHistory.map((h, i) => (
              <div key={i} className="text-xs flex items-start gap-2 p-2 bg-slate-50 rounded">
                <span className="font-mono text-slate-500">v{h.version}</span>
                <span className="text-slate-500">{h.effectiveFrom}</span>
                <span className="text-slate-700 flex-1">{h.summary}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {linkedIssues.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Open Issues</h3>
          <div className="space-y-1">
            {linkedIssues.map(i => (
              <button key={i.id} onClick={() => drillFromDrawer("issue", i.id)}
                className="w-full text-left p-2 rounded border border-slate-200 hover:bg-slate-50 text-xs">
                <span className="font-mono text-slate-500 mr-2">{i.id}</span>
                <span>{i.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DRAWER CONTENT: Issue ────────────────────────────────────────────────
function IssueDetailContent({ issue, drillFromDrawer }) {
  if (!issue) return <EmptyState message="Issue not found." />;
  const owner = getActor(issue.ownerId);
  const smf = getSMF(issue.accountableSMFId);
  const remediations = remediationActions.filter(r => r.issueId === issue.id);
  const siblings = issue.siblingIssueIds.map(sid => getIssue(sid)).filter(Boolean);
  const linkedInsights = aiInsights.filter(i => i.relatedEntityIds?.some(r => r.type === "issue" && r.id === issue.id));

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${severityBadge(issue.severity)}`}>{issue.severity.toUpperCase()}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{issue.source.replace(/_/g, " ")}</span>
          <StatusBadge tone={issue.status === "closed" ? "green" : "amber"} label={issue.status.replace("_", " ")} size="xs" />
          {issue.regulatoryReportableFlag && <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">REGULATORY REPORTABLE</span>}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{issue.title}</h2>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{issue.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat k="Days open" v={issue.daysOpen} tone={issue.daysOpen > 60 ? "rose" : issue.daysOpen > 30 ? "amber" : "emerald"} />
        <Stat k="Raised" v={issue.raisedDate} />
        <Stat k="Target close" v={issue.targetCloseDate} />
      </div>

      {issue.rootCauseClusterId && (
        <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 p-4">
          <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-700 mb-1">Root Cause Cluster</div>
          <div className="text-base font-bold text-slate-900">{issue.rootCauseClusterName}</div>
          <div className="text-xs text-slate-700 mt-1">{issue.rootCause}</div>
          {issue.pastClusterSuccessRate && (
            <div className="mt-2 text-xs text-indigo-800 italic">📊 {issue.pastClusterSuccessRate}</div>
          )}
          {siblings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-indigo-200">
              <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-700 mb-1">Sibling issues in cluster ({siblings.length})</div>
              <div className="space-y-1">
                {siblings.map(s => (
                  <button key={s.id} onClick={() => drillFromDrawer("issue", s.id)}
                    className="w-full text-left p-2 bg-white rounded border border-indigo-200 hover:border-indigo-400 text-xs">
                    <span className="font-mono text-slate-500 mr-2">{s.id}</span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Owner & Accountable SMF</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-slate-200 p-2">
            <div className="text-[10px] text-slate-500">Owner</div>
            <div className="text-sm font-medium">{owner?.name || "—"}</div>
            <div className="text-[10px] text-slate-500">{owner?.role}</div>
          </div>
          <div className="rounded border border-slate-200 p-2">
            <div className="text-[10px] text-slate-500">Accountable SMF</div>
            <div className="text-sm font-medium">{smf?.name || "—"}</div>
            <div className="text-[10px] text-slate-500">{smf?.smfFunction}</div>
          </div>
        </div>
      </div>

      {issue.linkedControlInstanceIds.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Empirical Evidence ({issue.linkedControlInstanceIds.length} substantiating instances)</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {issue.linkedControlInstanceIds.slice(0, 6).map(ciId => {
              const ci = getControlInstance(ciId);
              if (!ci) return null;
              return (
                <button key={ciId} onClick={() => drillFromDrawer("evidence", ci.evidenceIds[0] || ciId)}
                  className="w-full text-left p-2 rounded border border-slate-200 hover:bg-slate-50 text-xs flex items-center gap-2">
                  <span className="font-mono text-slate-600">{ci.id}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-700 truncate">{ci.caseOrTransactionId}</span>
                  <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${ci.evidenceIds.length === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                    {ci.evidenceIds.length === 0 ? "missing" : "incomplete"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {remediations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Remediation Actions ({remediations.length})</h3>
          <div className="space-y-2">
            {remediations.map(r => {
              const aOwner = getActor(r.ownerId);
              return (
                <div key={r.id} className="p-3 rounded border border-slate-200">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{r.id}</span>
                    <StatusBadge tone={r.status === "closed" ? "green" : r.status === "slipped" ? "red" : "amber"} label={r.status.replace("_", " ")} size="xs" />
                  </div>
                  <div className="text-xs text-slate-800 mb-1">{r.description}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{aOwner?.name} · due {r.dueDate}</span>
                    {r.validationStatus && <span className={r.validationStatus === "validated" ? "text-emerald-600 font-bold" : ""}>{r.validationStatus}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {linkedInsights.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">AI Insights</h3>
          {linkedInsights.map(i => (
            <button key={i.id} onClick={() => drillFromDrawer("aiInsight", i.id)}
              className="w-full text-left p-3 mb-2 rounded border border-violet-200 bg-violet-50/30 hover:bg-violet-50">
              <div className="text-xs font-bold text-slate-900 mb-0.5">{i.title}</div>
              <div className="text-[11px] text-slate-600 line-clamp-2">{i.summary}</div>
            </button>
          ))}
        </div>
      )}

      {issue.linkedRiskIds.length + issue.linkedObligationIds.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Linked Entities</h3>
          <div className="flex flex-wrap gap-1">
            {issue.linkedRiskIds.map(rid => (
              <button key={rid} onClick={() => drillFromDrawer("risk", rid)}
                className="px-2 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200">
                Risk · {rid}
              </button>
            ))}
            {issue.linkedObligationIds.map(oid => (
              <button key={oid} onClick={() => drillFromDrawer("obligation", oid)}
                className="px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200">
                Obligation · {getObligation(oid)?.citationShort || oid}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DRAWER CONTENT: Evidence ─────────────────────────────────────────────
function EvidenceDetailContent({ entityId }) {
  // Resolve: either evidence record id, or control instance id (for missing-evidence placeholder)
  let evidence = getEvidence(entityId);
  let placeholderInstance = null;
  if (!evidence) {
    const ci = getControlInstance(entityId);
    if (ci) placeholderInstance = ci;
  }

  if (placeholderInstance) {
    const ci = placeholderInstance;
    const c = getControl(ci.controlId);
    const step = getProcessStep(ci.stepId);
    return (
      <div className="space-y-4">
        <div className="rounded-lg border-2 border-rose-300 bg-rose-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠</span>
            <div>
              <div className="text-base font-bold text-rose-900">Evidence Missing</div>
              <div className="text-xs text-rose-700">Control fired but evidence was not captured.</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <KVRow k="Control instance" v={ci.id} />
            <KVRow k="Case / Tx" v={ci.caseOrTransactionId} />
            <KVRow k="Control" v={`${c?.id} · ${c?.title}`} />
            <KVRow k="Step" v={step?.name} />
            <KVRow k="Operator" v={getActor(ci.operatorId)?.name} />
            <KVRow k="Outcome" v={ci.outcome} tone="rose" />
          </div>
          {ci.missingFields?.length > 0 && (
            <div className="mt-3 p-3 bg-white rounded border border-rose-200">
              <div className="text-[10px] uppercase tracking-wider font-bold text-rose-700 mb-1">Missing required fields</div>
              <ul className="space-y-0.5">
                {ci.missingFields.map((f, i) => <li key={i} className="text-xs text-rose-900">· {f}</li>)}
              </ul>
            </div>
          )}
          <div className="mt-2 text-[10px] text-rose-700">Expected standard: <span className="font-mono">{ci.expectedEvidenceStandardId}</span></div>
        </div>
      </div>
    );
  }

  if (!evidence) return <EmptyState message="Evidence not found." />;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded">{evidence.evidenceType.toUpperCase()}</span>
          {evidence.s166Ready && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">s.166 READY</span>}
          {evidence.consumerDutyRelevant && <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">CONSUMER DUTY</span>}
        </div>
        <h2 className="text-base font-bold text-slate-900 break-all">{evidence.id}</h2>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Payload preview</div>
        <pre className="text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">{evidence.payloadPreview}</pre>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Provenance</h3>
        <div className="space-y-2 text-xs">
          <KVRow k="Source system" v={evidence.sourceSystem} />
          <KVRow k="Created" v={new Date(evidence.createdTs).toLocaleString("en-GB")} />
          <KVRow k="Ingested" v={new Date(evidence.ingestedTs).toLocaleString("en-GB")} />
          <KVRow k="Collection" v={evidence.collectionMethod} />
          <KVRow k="Hash" v={<span className="font-mono text-[10px]">{evidence.payloadHash}</span>} />
          <KVRow k="Hash verified" v={evidence.hashVerified ? "✓ Yes" : "✗ No"} tone={evidence.hashVerified ? "green" : "red"} />
          <KVRow k="Chain of custody" v={evidence.chainOfCustodyStatus} tone={evidence.chainOfCustodyStatus === "intact" ? "green" : "red"} />
          <KVRow k="Retention" v={`${evidence.retentionClass.replace("_", " ")} · expires ${evidence.retentionExpiry}`} />
          <KVRow k="Standard" v={evidence.evidenceStandardId} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Evidence Completeness</h3>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-baseline justify-between mb-2">
            <div className={`text-3xl font-bold ${bandText(evidence.evidenceCompletenessScore >= 80 ? "green" : evidence.evidenceCompletenessScore >= 60 ? "amber" : "red")}`}>{evidence.evidenceCompletenessScore}%</div>
            <span className="text-[10px] text-slate-500">{evidence.evidenceFreshnessDays}d old</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${bandBar(evidence.evidenceCompletenessScore >= 80 ? "green" : evidence.evidenceCompletenessScore >= 60 ? "amber" : "red")}`} style={{ width: `${evidence.evidenceCompletenessScore}%` }} />
          </div>
          {evidence.missingFields.length > 0 && (
            <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
              <div className="text-[10px] uppercase tracking-wider font-bold text-amber-800 mb-1">Missing fields</div>
              <ul className="text-xs text-amber-900">
                {evidence.missingFields.map((f, i) => <li key={i}>· {f}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Regulator Readiness</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded border text-center ${evidence.regulatorReady ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
            <div className="text-[10px] uppercase tracking-wider font-bold">Regulator</div>
            <div className="text-sm font-bold mt-1">{evidence.regulatorReady ? "✓ Ready" : "Pending"}</div>
          </div>
          <div className={`p-2 rounded border text-center ${evidence.s166Ready ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
            <div className="text-[10px] uppercase tracking-wider font-bold">s.166</div>
            <div className="text-sm font-bold mt-1">{evidence.s166Ready ? "✓ Ready" : "Pending"}</div>
          </div>
        </div>
      </div>

      {evidence.linkedAuditPackIds.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Linked Monitoring Reports</h3>
          <div className="space-y-1">
            {evidence.linkedAuditPackIds.map(pid => {
              const p = getAuditPack(pid);
              if (!p) return null;
              return (
                <div key={pid} className="p-2 rounded border border-slate-200 text-xs">
                  <div className="font-mono text-slate-700">{p.id}</div>
                  <div className="text-[10px] text-slate-500">{p.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DRAWER CONTENT: SMF ──────────────────────────────────────────────────
function SMFDetailContent({ smf, setSelectedSMFId, setActiveScreen, closeDrawer }) {
  if (!smf) return <EmptyState message="SMF not found." />;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">{smf.smfFunction}</span>
          {smf.prescribedResponsibilities.map(pr => (
            <span key={pr} className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{pr}</span>
          ))}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{smf.name}</h2>
        <div className="text-sm text-slate-700">{smf.functionLabel}</div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4">
        <div className="flex items-baseline gap-3 mb-2">
          <div className={`text-4xl font-bold ${bandText(smf.rss.band)}`}>{smf.rss.score}</div>
          <div className="text-xs text-slate-500">Reasonable Steps Score</div>
          <StatusBadge tone={smf.rss.band} label={smf.rss.band.toUpperCase()} size="xs" />
        </div>
        <div className="space-y-1.5">
          {Object.entries(smf.rss.components).map(([k, v]) => {
            const t = v >= 80 ? "green" : v >= 60 ? "amber" : "red";
            return (
              <div key={k}>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-600">{k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}</span>
                  <span className={`font-bold ${bandText(t)}`}>{v}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${bandBar(t)}`} style={{ width: `${v}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat k="Processes" v={smf.accountableProcessIds.length} />
        <Stat k="Controls" v={smf.accountableControlIds.length} />
        <Stat k="Obligations" v={smf.accountableObligationIds.length} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <KVRow k="Last attestation" v={smf.lastAttestationDate} />
        <KVRow k="Next due" v={smf.nextAttestationDue} />
        <KVRow k="Conduct breaches" v={smf.conductRuleBreaches} tone={smf.conductRuleBreaches === 0 ? "green" : "red"} />
        <KVRow k="Appointed" v={smf.appointmentDate} />
      </div>

      <button onClick={() => { setSelectedSMFId(smf.id); setActiveScreen("smcrWorkspace"); closeDrawer(); }}
        className="w-full py-2 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded">
        Open in SMCR Workspace →
      </button>
    </div>
  );
}

// ─── DRAWER CONTENT: AuditPack ────────────────────────────────────────────
function AuditPackDetailContent({ pack, setSelectedPackId, setActiveScreen, closeDrawer }) {
  if (!pack) return <EmptyState message="Pack not found." />;
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">{pack.scopeType.replace(/_/g, " ").toUpperCase()}</span>
          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{pack.targetAudience.toUpperCase()}</span>
        </div>
        <h2 className="text-base font-bold text-slate-900">{pack.title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <KVRow k="Window" v={`${pack.timeWindowStart} → ${pack.timeWindowEnd}`} />
        <KVRow k="As-of" v={pack.asOfStateDate} />
        <KVRow k="Total entities" v={pack.composition.totalEntities.toLocaleString()} />
        <KVRow k="Readiness" v={pack.readinessStatus.replace("_", " ")} tone="amber" />
      </div>
      <div className="text-xs text-slate-700 leading-relaxed line-clamp-6">{pack.generatedNarrative}</div>
      <button onClick={() => { setSelectedPackId(pack.id); setActiveScreen("monitoringReportBuilder"); closeDrawer(); }}
        className="w-full py-2 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded">
        Open in Pack Builder →
      </button>
    </div>
  );
}

// ─── DRAWER CONTENT: AI Insight ───────────────────────────────────────────
function AIInsightDetailContent({ insight, drillFromDrawer }) {
  if (!insight) return <EmptyState message="Insight not found." />;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-bold tracking-wider bg-violet-100 text-violet-800 px-2 py-0.5 rounded">AI · {insight.type.replace("_", " ")}</span>
          <StatusBadge tone={insight.severity === "high" ? "red" : insight.severity === "medium" ? "amber" : "green"} label={insight.severity.toUpperCase()} size="xs" />
          <span className="text-[10px] text-slate-500">conf {Math.round(insight.confidence * 100)}%</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{insight.title}</h2>
        <p className="text-xs text-slate-700 mt-2 leading-relaxed">{insight.summary}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Model Lineage</h3>
        <div className="rounded-lg border border-slate-200 p-3 space-y-1 text-xs">
          <KVRow k="Model" v={insight.modelId} />
          <KVRow k="Version" v={insight.modelVersion} />
          <KVRow k="Generated" v={new Date(insight.generatedAt).toLocaleString("en-GB")} />
          <KVRow k="Independence" v={
            !insight.independenceLineage.inputsFromLOD1 && !insight.independenceLineage.inputsFromLOD2 ? "✓ 3LoD-clean" : "Mixed"
          } tone={!insight.independenceLineage.inputsFromLOD1 && !insight.independenceLineage.inputsFromLOD2 ? "green" : "amber"} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Methodology</h3>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 leading-relaxed">
          {insight.methodology}
        </div>
      </div>

      {insight.sourceRecordIds?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Source Records ({insight.sourceRecordIds.length})</h3>
          <div className="space-y-1">
            {insight.sourceRecordIds.map((s, i) => (
              <button key={i} onClick={() => drillFromDrawer(s.type, s.id)}
                className="w-full text-left p-2 rounded border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-xs flex items-center gap-2">
                <EntityTypeBadge type={s.type} />
                <span className="font-mono text-slate-600">{s.id}</span>
                <span className="text-slate-700 truncate flex-1">{s.label}</span>
                <span className="text-indigo-600">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {insight.counterfactual && (
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4">
          <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 mb-1">Counterfactual</div>
          <div className="text-xs text-emerald-900 leading-relaxed">{insight.counterfactual}</div>
        </div>
      )}

      {insight.inputsNotSeen?.length > 0 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-800 mb-1">Inputs Not Seen by Model</div>
          <ul className="text-xs text-amber-900 space-y-0.5">
            {insight.inputsNotSeen.map((x, i) => <li key={i}>· {x}</li>)}
          </ul>
          <div className="mt-2 text-[10px] text-amber-700 italic">Human judgement should weight these factors before acting on this insight.</div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">Human Action</h3>
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-600">Status</span>
            <StatusBadge tone={insight.humanActionStatus === "acknowledged" || insight.humanActionStatus === "actioned" ? "green" : "amber"} label={insight.humanActionStatus.replace(/_/g, " ")} size="xs" />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded">Acknowledge</button>
            <button className="flex-1 py-2 text-xs font-medium bg-white border border-slate-200 hover:bg-slate-50 rounded">Reject with rationale</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────
function Stat({ k, v, sub, tone = "slate" }) {
  const colors = { slate: "text-slate-900", emerald: "text-emerald-700", amber: "text-amber-700", rose: "text-rose-700" };
  return (
    <div className="p-2 rounded bg-slate-50 border border-slate-200">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{k}</div>
      <div className={`text-lg font-bold ${colors[tone] || "text-slate-900"}`}>{v}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function KVRow({ k, v, tone }) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{k}</span>
      <span className={`text-xs font-medium ${tone ? bandText(tone) : "text-slate-800"}`}>{v}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="p-12 text-center">
      <div className="text-3xl mb-2">📭</div>
      <div className="text-sm text-slate-500">{message}</div>
    </div>
  );
}