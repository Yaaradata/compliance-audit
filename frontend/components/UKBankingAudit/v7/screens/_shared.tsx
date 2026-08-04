// @ts-nocheck
'use client';

import React, { useState, useMemo } from 'react';
import {
  personas,
  obligations,
  controls,
  groupSetRequirements,
  crsaAttestationLines,
  controlObjectives,
  riskAreas,
  crsaAttestationCycles,
  horizonScanItems,
  getObligation,
  getIssue,
  getKRI,
  getAppetite,
} from '@/components/UKBankingAudit/ukTraceRuntime';
import { PathToGreenStrip } from '@/components/UKBankingAudit/v7/PathToGreenStrip';
import {
  EDD_PAST_DUE_APPETITE,
  FC_TRAINING_POSTURE,
  NAME_SCREENING_SYSTEM_HEALTH,
  OPERATIONAL_WIDGET_SOURCES,
  TM_SYSTEM_HEALTH,
  TXN_SCREENING_SYSTEM_HEALTH,
  buildAmlAlertTiersByWeek,
  dataQualityForWindow,
  eddPastDueBand,
  fcTrainingOverdueBand,
  fcTrainingWidgetBand,
  outagesForWindow,
  systemHealthWorstBand,
} from '@/lib/ukbankingaudit/v7/mlroOperationalData';
import { TM_INVESTIGATIONS_SAR_CONVERSION } from '@/lib/ukbankingaudit/v7/exposureData';

/** Mini appetite bar — same grammar as ExposureLens CountTile / EDD past-due. */
function MiniAppetiteBar({ value, appetite, over }) {
  const scale = Math.max(value, appetite, 0.01) * 1.3;
  const fillPct = Math.min(100, (value / scale) * 100);
  const tickPct = Math.min(100, (appetite / scale) * 100);
  return (
    <>
      <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={over ? "h-full rounded-full bg-rose-400" : "h-full rounded-full bg-slate-400"}
          style={{ width: `${fillPct}%` }}
        />
        <div className="absolute top-0 bottom-0 w-px bg-slate-900" style={{ left: `${tickPct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[9px] text-slate-400">appetite {appetite}</span>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${over ? "text-rose-600" : "text-emerald-600"}`}>
          {over ? "OVER" : "WITHIN"}
        </span>
      </div>
    </>
  );
}

/**
 * Systems & data health — shared UI for TM / txn screening / name screening.
 * Outages and data-quality issues render as separate lists; both windows shown.
 */
function SystemHealthBlock({ health }) {
  const band = systemHealthWorstBand(health);
  const windows = health.windows || [];
  return (
    <div className="mt-4">
      <div className={`rounded-lg border bg-white p-3 ${bandBg(band)}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">
              Systems &amp; data health
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{health.systemName}</h4>
            <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
              Coverage gap when the system is down — nothing screened for the outage duration.
            </p>
          </div>
          <StatusBadge tone={band} label={band.toUpperCase()} />
        </div>

        {windows.map((w) => {
          const outages = outagesForWindow(health, w.id);
          const dqIssues = dataQualityForWindow(health, w.id);
          return (
            <div key={w.id} className="mt-2 rounded-md border border-slate-200 bg-white/80 p-2.5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{w.label}</span>
                <span className="text-[9px] text-slate-400">
                  {w.from} → {w.to}
                </span>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Outages
              </div>
              {outages.length === 0 ? (
                <p className="text-[11px] text-slate-500 mb-2">No outages in this window.</p>
              ) : (
                <ul className="mb-2 space-y-1.5">
                  {outages.map((o) => (
                    <li key={`${o.escalationRef}-${o.start}`} className="rounded border border-slate-100 bg-slate-50/80 px-2 py-1.5 text-[11px]">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${o.backfilled ? "bg-amber-500" : "bg-rose-500"}`} />
                        <span className="font-semibold text-slate-800">
                          {Math.round(o.durationMinutes / 60 * 10) / 10}h outage
                        </span>
                        <span className="text-slate-600">
                          {o.alertsOrItemsMissed.toLocaleString("en-GB")} items unscored
                        </span>
                        <span className={`ml-auto text-[9px] font-bold uppercase tracking-wider ${o.backfilled ? "text-amber-700" : "text-rose-700"}`}>
                          {o.backfilled ? "Backfilled" : "Not backfilled"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-500">
                        {o.start.replace("T", " ").replace("Z", " UTC")} → {o.end.replace("T", " ").replace("Z", " UTC")}
                        {" · "}{o.loggedBy} · {o.escalationRef}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Data quality issues
              </div>
              {dqIssues.length === 0 ? (
                <p className="text-[11px] text-slate-500">No data-quality issues in this window.</p>
              ) : (
                <ul className="space-y-1.5">
                  {dqIssues.map((dq) => (
                    <li key={dq.id} className="rounded border border-slate-100 bg-slate-50/80 px-2 py-1.5 text-[11px]">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span className="font-mono text-[10px] text-slate-600">{dq.id}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          dq.status === "open" ? "text-rose-700" : dq.status === "mitigated" ? "text-amber-700" : "text-emerald-700"
                        }`}>
                          {dq.status}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto">{dq.detectedDate}</span>
                      </div>
                      <div className="mt-0.5 text-slate-800">{dq.description}</div>
                      <div className="mt-0.5 text-[10px] text-slate-500">{dq.impact}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <div className="mt-2 border-t border-slate-200/80 pt-1.5">
          <span className="block text-[10px] leading-snug text-slate-500">{health.sourceLabel}</span>
        </div>
      </div>
      {band === "red" || band === "amber" ? (
        <PathToGreenStrip entityRef={health.pathToGreenRef} />
      ) : null}
    </div>
  );
}

export const bandBg = (band) => ({
  red: "bg-rose-50 border-rose-300 text-rose-900",
  amber: "bg-amber-50 border-amber-300 text-amber-900",
  green: "bg-emerald-50 border-emerald-300 text-emerald-900",
  neutral: "bg-slate-50 border-slate-300 text-slate-700",
}[band] || "bg-slate-50 border-slate-300 text-slate-700");

export const bandDot = (band) => ({
  red: "bg-rose-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  neutral: "bg-slate-400",
}[band] || "bg-slate-400");

export const bandText = (band) => ({
  red: "text-rose-700",
  amber: "text-amber-700",
  green: "text-emerald-700",
  neutral: "text-slate-600",
}[band] || "text-slate-600");

export const bandBar = (band) => ({
  red: "bg-rose-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  neutral: "bg-slate-400",
}[band] || "bg-slate-400");

export const Sparkline = ({ series = [], band = "neutral", width = 120, height = 30, fill = false }) => {
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
export const StatusBadge = ({ tone = "neutral", label, size = "sm" }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${size === "xs" ? "text-[10px]" : "text-xs"} font-medium ${bandBg(tone)}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${bandDot(tone)}`} />
    {label}
  </span>
);

export const RACMRefBadge = ({ racmRef, size = "sm" }) => {
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
export const CoverageMetric = ({ mode = "full", populationSize = 0, size = "md" }) => {
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

export const EntityTypeBadge = ({ type }) => {
  const map = {
    risk: "RISK", control: "CONTROL", obligation: "OBLIGATION", issue: "ISSUE", evidence: "EVIDENCE",
    smf: "SMF", auditPack: "MONITORING REPORT", aiInsight: "AI INSIGHT", kri: "KRI",
    precedent: "PRECEDENT", derivation: "DERIVATION", statusEvidence: "STATUS EVIDENCE", crsaRef: "CRSA",
  };
  const tone = {
    risk: "rose", control: "indigo", obligation: "purple", issue: "amber", evidence: "sky",
    smf: "emerald", auditPack: "slate", aiInsight: "violet", kri: "cyan",
    precedent: "rose", derivation: "slate", statusEvidence: "sky", crsaRef: "indigo",
  }[type] || "slate";
  return <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider bg-${tone}-100 text-${tone}-800 border border-${tone}-200`}>{map[type] || type}</span>;
};

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

const NATURE_AND_APPROACH = {
  manual_preventative:    { id: 'manual_preventative',    label: 'Manual - Preventative' },
  manual_detective:       { id: 'manual_detective',       label: 'Manual - Detective' },
  manual_corrective:      { id: 'manual_corrective',      label: 'Manual - Corrective' },
  automatic_preventative: { id: 'automatic_preventative', label: 'Automatic - Preventative' },
  automatic_detective:    { id: 'automatic_detective',    label: 'Automatic - Detective' },
  automatic_corrective:   { id: 'automatic_corrective',   label: 'Automatic - Corrective' },
  not_applicable:         { id: 'not_applicable',         label: 'Not Applicable' },
};

export const PersonaStubLanding = ({ accent, persona, subhead, ownedByPass }) => {
  // Visually distinct per persona (accent class set; same minimal shape).
  // Minimal, low-noise — explicitly NOT a real screen yet.
  return (
    <div className="space-y-6">
      <div className={`rounded-xl border ${accent.border} ${accent.bg} p-6 shadow-sm`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{persona.label}</h1>
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

export const RiskAreaTile = ({ area, cycle, onClick, isActive }) => {
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

export const HorizonScannerPanel = ({ items = [] }) => (
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

export const FindingsLedger = ({ findings = [], openDrawer }) => (
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
export const QuarterlyReportGenerator = ({ cycle, onClose }) => {
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

export const MLRO_DRILL_TARGETS = {
  // AML.01.05.02 — MLRO Reporting (the focal red line; capacity narrative
  // surfaces here). AML.01.07.01 — FCA Annual FC Report / FIU regime.
  alertBacklog: { gsrId: 'GSR-AML-05-02', cycleId: 'CYC-Q2-2026-AML' },
  sarTimeliness: { gsrId: 'GSR-AML-07-01', cycleId: 'CYC-Q2-2026-AML' },
  eddPipeline: { gsrId: 'GSR-AML-05-02', cycleId: 'CYC-Q2-2026-AML' },
};

// FinancialCrimeKRIStrip — horizontal ribbon of FC-attached KRIs.
export const FinancialCrimeKRIStrip = ({ kriList, openDrawer }) => (
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

// AlertBacklogVsAppetite — primary widget. L1/L2/L3 tier backlogs vs appetite,
// with capacity-vs-demand nested as the causal "why", plus TM→SAR conversion
// (single source: TM_INVESTIGATIONS_SAR_CONVERSION). Click drills to AML.01.05.02.
export const AlertBacklogVsAppetite = ({ alertSeries, appetiteMetric, capacitySeries, onDrill }) => {
  const tiered = buildAmlAlertTiersByWeek(alertSeries || []);
  const last = tiered[tiered.length - 1] || { openBacklog: 0, slaBreaches: 0, generated: 0, dispositioned: 0, tiers: [], worstBand: "green" };
  const first = tiered[0] || last;
  const backlogDelta = (last.openBacklog || 0) - (first.openBacklog || 0);
  const breachWeek = (appetiteMetric?.breachEvents || [])[0];
  const backlogSeries = tiered.map(p => p.openBacklog);
  const slaSeries = tiered.map(p => p.slaBreaches);
  const widgetBand = last.worstBand || "green";
  const sar = TM_INVESTIGATIONS_SAR_CONVERSION;

  return (
    <div>
      <div className={`w-full rounded-xl border-2 p-5 shadow-sm ${bandBg(widgetBand)}`}>
        <button type="button" onClick={onDrill} className="w-full text-left hover:opacity-95 transition">
          <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">AML Programme Posture · Primary widget</div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">L1 / L2 / L3 alert backlog vs. appetite</h2>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-2xl">
                Three investigation tiers, each against its own appetite. Capacity is fixed while demand has risen —
                backlog concentrates in L2. Aggregate backlog crossed the {appetiteMetric?.amberThreshold ?? "—"}% programme appetite threshold.
              </p>
            </div>
            <StatusBadge
              tone={widgetBand}
              label={`${widgetBand === "red" ? "OUT OF APPETITE" : widgetBand === "amber" ? "APPROACHING" : "WITHIN"} · ${appetiteMetric?.current ?? "—"}${appetiteMetric?.metric?.includes("%") ? "%" : ""}`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
            <div className="rounded-md bg-white border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Backlog (current)</div>
              <div className={`text-3xl font-bold mt-0.5 ${widgetBand === "red" ? "text-rose-700" : "text-slate-900"}`}>
                {last.openBacklog?.toLocaleString("en-GB") ?? "—"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {backlogDelta >= 0 ? "+" : ""}{backlogDelta.toLocaleString("en-GB")} vs 13 weeks ago
              </div>
            </div>
            <div className="rounded-md bg-white border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">SLA breaches (this wk)</div>
              <div className={`text-3xl font-bold mt-0.5 ${widgetBand === "red" ? "text-rose-700" : "text-slate-900"}`}>
                {last.slaBreaches?.toLocaleString("en-GB") ?? "—"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">vs. {first.slaBreaches} 13 wks ago</div>
            </div>
            <div className="rounded-md bg-white border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Generated (this wk)</div>
              <div className="text-3xl font-bold text-slate-900 mt-0.5">{last.generated?.toLocaleString("en-GB") ?? "—"}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">vs. dispositioned {last.dispositioned?.toLocaleString("en-GB") ?? "—"}</div>
            </div>
            <div className="rounded-md bg-white border border-slate-200 p-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Appetite breach</div>
              <div className={`text-base font-bold mt-1 ${widgetBand === "red" ? "text-rose-700" : "text-slate-900"}`}>
                {breachWeek ? `${appetiteMetric?.currentBand?.toUpperCase()} ${appetiteMetric?.current}%` : "—"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {breachWeek ? `breach ${breachWeek.fromBand}→${breachWeek.toBand}` : "—"}
              </div>
            </div>
          </div>

          {/* L1 / L2 / L3 tier rows — each against its own appetite */}
          <div className="mt-4 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Investigation tiers · backlog vs appetite
            </div>
            {(last.tiers || []).map((tier) => {
              const scale = Math.max(tier.backlog, tier.appetite) * 1.3;
              const fillPct = Math.min(100, (tier.backlog / scale) * 100);
              const tickPct = Math.min(100, (tier.appetite / scale) * 100);
              const over = tier.backlog > tier.appetite;
              return (
                <div key={tier.id} className={`rounded-md border bg-white p-3 ${bandBg(tier.band)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-900">
                        {tier.id} · {tier.label}
                      </div>
                      <div className="text-[10px] text-slate-500">{tier.slaLabel} · {tier.slaBreaches} SLA breaches this wk</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xl font-bold tabular-nums ${over ? "text-rose-700" : "text-slate-900"}`}>
                        {tier.backlog.toLocaleString("en-GB")}
                      </div>
                      <StatusBadge tone={tier.band} label={tier.band.toUpperCase()} />
                    </div>
                  </div>
                  <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={over ? "h-full rounded-full bg-rose-400" : "h-full rounded-full bg-slate-400"}
                      style={{ width: `${fillPct}%` }}
                    />
                    <div className="absolute top-0 bottom-0 w-px bg-slate-900" style={{ left: `${tickPct}%` }} />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-400">appetite {tier.appetite}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${over ? "text-rose-600" : "text-emerald-600"}`}>
                      {over ? "OVER" : "WITHIN"}
                    </span>
                  </div>
                  <div className="mt-1.5 border-t border-slate-200/80 pt-1">
                    <span className="block text-[10px] leading-snug text-slate-500">{tier.sourceLabel}</span>
                  </div>
                </div>
              );
            })}
            <div className="text-[10px] text-slate-500">
              Tier backlogs sum to programme backlog {last.openBacklog?.toLocaleString("en-GB")}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-md bg-white border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Open backlog · 13 wk</span>
                <span className="text-[10px] text-rose-700 font-semibold">↗ {tiered.length} weeks</span>
              </div>
              <Sparkline series={backlogSeries} band={widgetBand} width={420} height={48} fill />
            </div>
            <div className="rounded-md bg-white border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">SLA breaches · 13 wk</span>
                <span className="text-[10px] text-rose-700 font-semibold">↗ accelerating</span>
              </div>
              <Sparkline series={slaSeries} band={widgetBand} width={420} height={48} fill />
            </div>
          </div>

          {/* TM → SAR conversion — moved from Client Risk View; single source */}
          <div className="mt-4 rounded-md border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Alert → SAR conversion
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-slate-700">{sar.label}</div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Informational</span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div>
                <span className="text-2xl font-bold tabular-nums text-slate-900">{sar.count.toLocaleString("en-GB")}</span>
                <span className="ml-1.5 text-[10px] uppercase tracking-wide text-slate-400">SARs</span>
              </div>
              <div>
                <span className="text-2xl font-bold tabular-nums text-slate-900">{sar.pct}%</span>
                <span className="ml-1.5 text-[10px] text-slate-400">of {sar.investigations.toLocaleString("en-GB")} investigations</span>
              </div>
            </div>
            <div className="mt-2 border-t border-slate-100 pt-1.5">
              <span className="block text-[10px] leading-snug text-slate-500">{sar.sourceLabel}</span>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-200/80 pt-1.5">
            <span className="block text-[10px] leading-snug text-slate-500">{OPERATIONAL_WIDGET_SOURCES.alertBacklog}</span>
          </div>

          <div className="mt-4 text-[11px] font-medium opacity-80">
            Drill into AML.01.05.02 (MLRO Reporting) Per-Requirement Attestation View →
          </div>
        </button>

        {/* Capacity vs demand — causal panel nested inside Widget 2 (not a peer). */}
        <div className="mt-4 border-t border-slate-200/80 pt-4">
          <CapacityVsDemandGauge series={capacitySeries || []} nested />
        </div>

        {/* TM system health — technology signal next to the process it degrades. */}
        <div className="border-t border-slate-200/80 pt-1">
          <SystemHealthBlock health={TM_SYSTEM_HEALTH} />
        </div>
      </div>
      {widgetBand === "red" || widgetBand === "amber" ? (
        <PathToGreenStrip entityRef="TM Alerts Closed in SLA" />
      ) : null}
    </div>
  );
};

// SARTimelinessBand — % SARs filed within statutory POCA s.330 window.
export const SARTimelinessBand = ({ series, onDrill }) => {
  const last = series[series.length - 1] || {};
  const seriesValues = series.map(p => p.pctOnTime);
  return (
    <div>
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
        <div className="mt-2 border-t border-slate-200/80 pt-1.5">
          <span className="block text-[10px] leading-snug text-slate-500">{OPERATIONAL_WIDGET_SOURCES.sarTimeliness}</span>
        </div>
        <div className="mt-2 text-[11px] font-medium opacity-80">
          Drill into AML.01.07.01 (FCA Annual FC Report / FIU regime) →
        </div>
      </button>
      {last.band === "red" || last.band === "amber" ? (
        <PathToGreenStrip entityRef="sar-timeliness" />
      ) : null}
    </div>
  );
};

// EDDPipelineStatus — high-risk customer review pipeline.
export const EDDPipelineStatus = ({ items, onDrill }) => {
  const counts = items.reduce((acc, it) => {
    acc[it.status] = (acc[it.status] || 0) + 1;
    if (it.band === "red") acc.red = (acc.red || 0) + 1;
    return acc;
  }, {});
  const pastDue = counts.past_due || 0;
  const inProgress = counts.in_progress || 0;
  const awaiting = counts.awaiting_decision || 0;
  const appetiteCfg = EDD_PAST_DUE_APPETITE;
  const totalBand = eddPastDueBand(pastDue, appetiteCfg);
  const appetite = appetiteCfg.appetite;
  const appetiteScale = Math.max(pastDue, appetite) * 1.3;
  const appetiteFillPct = Math.min(100, (pastDue / appetiteScale) * 100);
  const appetiteTickPct = Math.min(100, (appetite / appetiteScale) * 100);
  return (
    <div>
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
            <div className={`text-2xl font-bold tabular-nums ${pastDue > appetite ? "text-rose-700" : "text-slate-900"}`}>{pastDue}</div>
            {/* Same AppetiteBar grammar as ExposureLens CountTile — do not fork the style. */}
            <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={pastDue > appetite ? "h-full rounded-full bg-rose-400" : "h-full rounded-full bg-slate-400"}
                style={{ width: `${appetiteFillPct}%` }}
              />
              <div className="absolute top-0 bottom-0 w-px bg-slate-900" style={{ left: `${appetiteTickPct}%` }} />
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[9px] text-slate-400">appetite {appetite}</span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider ${
                  pastDue > appetite ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {pastDue > appetite ? "OVER" : "WITHIN"}
              </span>
            </div>
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
        <div className="mt-2 border-t border-slate-200/80 pt-1.5">
          <span className="block text-[10px] leading-snug text-slate-500">{appetiteCfg.sourceLabel}</span>
        </div>
        <div className="mt-2 text-[11px] font-medium opacity-80">
          Drill into AML.01.05.02 attestation (capacity is the why) →
        </div>
      </button>
      {totalBand === "red" || totalBand === "amber" ? (
        <PathToGreenStrip entityRef="EDD Completed on Time" />
      ) : null}
    </div>
  );
};

// SanctionsScreeningPosture — OFSI freeze/block breaches, list-update lag,
// payments hold time. Data from v7 overlay (mockDataV7); V2 snapshot untouched.
export const SanctionsScreeningPosture = ({ metrics }) => {
  const m = metrics || {};
  const p = m.payments || {};
  const c = m.customers || {};
  const r = m.reportingStatus || {};
  const freeze = r.ofsiFreezeReports || {};
  const ofsiBlock = r.ofsiBlockReports || {};
  const ofacUs = r.ofacUsBlockingReports || {};
  const listUpdates = m.listUpdates || [];
  const hold = p.holdTime || null;
  const postureBand = m.postureBand || "green";

  return (
    <div>
      <div className={`w-full rounded-xl border-2 p-4 shadow-sm ${bandBg(postureBand)}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">
              Sanctions posture · OFSI / UN / EU
              {ofacUs.jurisdictionLabel ? " · US OFAC (separate)" : ""}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Screening &amp; reporting</h3>
          </div>
          <StatusBadge tone={postureBand} label={postureBand?.toUpperCase()} />
        </div>
        <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{m.postureNarrative}</p>

        {/* Payments hold time — first-class metric (Sanctions + Consumer Duty) */}
        {hold ? (
          <div className={`mt-3 rounded-md border bg-white p-3 ${bandBg(hold.band)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Payments hold time
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Sanctions · Consumer Duty
                </div>
              </div>
              <StatusBadge tone={hold.band} label={hold.band.toUpperCase()} />
            </div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${hold.averageHoldHours > hold.appetiteHours ? "text-rose-700" : "text-slate-900"}`}>
              {hold.averageHoldHours}
              <span className="ml-1 text-sm font-semibold text-slate-500">hours</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {p.holdsThisPeriod} holds · {p.truePositives} TP · {p.blockedTransactions} blocked ·{" "}
              {p.screenedThisPeriod?.toLocaleString("en-GB")} payments screened
            </div>
            <MiniAppetiteBar
              value={hold.averageHoldHours}
              appetite={hold.appetiteHours}
              over={hold.averageHoldHours > hold.appetiteHours}
            />
            <div className="mt-1.5 border-t border-slate-200/80 pt-1">
              <span className="block text-[10px] leading-snug text-slate-500">{hold.sourceLabel}</span>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded bg-white/70 border border-slate-200 p-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Payments screened</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{p.screenedThisPeriod?.toLocaleString("en-GB")}</div>
            <div className="text-[10px] text-slate-500">{p.holdsThisPeriod} holds · {p.truePositives} TP · {p.blockedTransactions} blocked</div>
          </div>
          <div className="rounded bg-white/70 border border-slate-200 p-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Customers screened</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">{c.screenedAtOnboarding?.toLocaleString("en-GB")}</div>
            <div className="text-[10px] text-slate-500">{c.truePositives} TP · {c.falsePositives} FP · {c.screenedOnListUpdate?.toLocaleString("en-GB")} on list update</div>
          </div>
        </div>

        {/* OFSI freeze — breach count vs appetite 0 */}
        <div className={`mt-3 rounded-md border bg-white p-3 ${bandBg((freeze.breachCount ?? 0) > 0 ? "red" : "green")}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                OFSI freeze report timeliness
              </div>
              <div className="text-[11px] text-slate-700 mt-0.5">
                {freeze.submitted}/{freeze.dueThisPeriod} submitted · last {freeze.lastSubmitted}
              </div>
            </div>
            <StatusBadge
              tone={(freeze.breachCount ?? 0) > 0 ? "red" : "green"}
              label={`${freeze.breachCount ?? 0} BREACH`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tabular-nums ${(freeze.breachCount ?? 0) > 0 ? "text-rose-700" : "text-slate-900"}`}>
              {freeze.breachCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-500">breaches · appetite {freeze.appetite ?? 0}</span>
          </div>
          <MiniAppetiteBar
            value={freeze.breachCount ?? 0}
            appetite={freeze.appetite ?? 0}
            over={(freeze.breachCount ?? 0) > (freeze.appetite ?? 0)}
          />
          {(freeze.reports || []).length > 0 ? (
            <ul className="mt-2 space-y-1 text-[10px] text-slate-600">
              {freeze.reports.map((rep) => (
                <li key={rep.id} className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${rep.daysLate > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
                  <span className="font-mono">{rep.id}</span>
                  <span className="ml-auto font-semibold">
                    {rep.daysLate > 0 ? `${rep.daysLate}d late` : "on time"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-1.5 border-t border-slate-200/80 pt-1">
            <span className="block text-[10px] leading-snug text-slate-500">{freeze.sourceLabel || "Sanctions team"}</span>
          </div>
        </div>

        {/* OFSI block reports — UK regime (not OFAC) */}
        <div className={`mt-2 rounded-md border bg-white p-3 ${bandBg((ofsiBlock.breachCount ?? 0) > 0 ? "red" : "green")}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                OFSI block reports
              </div>
              <div className="text-[11px] text-slate-700 mt-0.5">
                UK reporting obligation · {ofsiBlock.submitted}/{ofsiBlock.dueThisPeriod} submitted · last {ofsiBlock.lastSubmitted}
              </div>
            </div>
            <StatusBadge
              tone={(ofsiBlock.breachCount ?? 0) > 0 ? "red" : "green"}
              label={`${ofsiBlock.breachCount ?? 0} BREACH`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-slate-900">{ofsiBlock.breachCount ?? 0}</span>
            <span className="text-[10px] text-slate-500">breaches · appetite {ofsiBlock.appetite ?? 0}</span>
          </div>
          <MiniAppetiteBar
            value={ofsiBlock.breachCount ?? 0}
            appetite={ofsiBlock.appetite ?? 0}
            over={(ofsiBlock.breachCount ?? 0) > (ofsiBlock.appetite ?? 0)}
          />
          <div className="mt-1.5 border-t border-slate-200/80 pt-1">
            <span className="block text-[10px] leading-snug text-slate-500">{ofsiBlock.sourceLabel || "Sanctions team"}</span>
          </div>
        </div>

        {/* US OFAC — separate jurisdiction, not a stand-in for OFSI */}
        {ofacUs.jurisdictionLabel ? (
          <div className="mt-2 rounded-md border border-slate-200 bg-white/70 p-2.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${(ofacUs.breachCount ?? 0) > 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
              <span className="font-semibold text-slate-800">{ofacUs.jurisdictionLabel} blocking reports</span>
              <span className="text-slate-600">
                {ofacUs.dueThisPeriod} due · {ofacUs.breachCount ?? 0} breaches
              </span>
              <span className="text-slate-500 ml-auto">last {ofacUs.lastSubmitted}</span>
            </div>
            <span className="mt-1 block text-[10px] leading-snug text-slate-500">{ofacUs.sourceLabel}</span>
          </div>
        ) : null}

        {/* List update lag — publication → bank ingestion */}
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
            List update lag · publication → bank ingestion
          </div>
          <div className="space-y-2">
            {listUpdates.map((u) => (
              <div key={u.id} className={`rounded-md border bg-white p-2.5 ${bandBg(u.band)}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-900 truncate">{u.listName}</div>
                    <div className="text-[10px] text-slate-500">
                      {u.regulator} · pub {u.publishedAt?.replace("T", " ").replace("Z", " UTC")} → in{" "}
                      {u.ingestedAt?.replace("T", " ").replace("Z", " UTC")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-bold tabular-nums ${u.lagHours > u.appetiteHours ? "text-rose-700" : "text-slate-900"}`}>
                      {u.lagHours}
                      <span className="text-[10px] font-semibold text-slate-500 ml-0.5">h</span>
                    </div>
                    <StatusBadge tone={u.band} label={u.band.toUpperCase()} />
                  </div>
                </div>
                <MiniAppetiteBar
                  value={u.lagHours}
                  appetite={u.appetiteHours}
                  over={u.lagHours > u.appetiteHours}
                />
                <div className="mt-1 border-t border-slate-200/80 pt-1">
                  <span className="block text-[10px] leading-snug text-slate-500">{u.sourceLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${(r.nonComplianceWaivers?.open ?? 0) === 0 ? "bg-emerald-500" : "bg-amber-500"} flex-shrink-0`} />
            <span className="text-slate-700">Non-compliance waivers:</span>
            <span className="font-semibold text-slate-900">{r.nonComplianceWaivers?.open} open</span>
          </div>
        </div>

        <div className="mt-2 border-t border-slate-200/80 pt-1.5">
          <span className="block text-[10px] leading-snug text-slate-500">{OPERATIONAL_WIDGET_SOURCES.sanctions}</span>
        </div>

        {/* Screening systems health — txn and name kept separate (two systems, two failure modes). */}
        <div className="mt-2 border-t border-slate-200/80 pt-1">
          <SystemHealthBlock health={TXN_SCREENING_SYSTEM_HEALTH} />
          <SystemHealthBlock health={NAME_SCREENING_SYSTEM_HEALTH} />
        </div>
      </div>
      {postureBand === "red" || postureBand === "amber" ? (
        <PathToGreenStrip entityRef="SCTN.01.01.01" />
      ) : null}
    </div>
  );
};

/**
 * FinancialCrimeTrainingPosture — firm-wide % from AP-MLRO-2025 narrative (98.4%);
 * overdue + high-risk split are LMS overlay fields (v7 only).
 */
export const FinancialCrimeTrainingPosture = ({ posture = FC_TRAINING_POSTURE }) => {
  const p = posture;
  const band = fcTrainingWidgetBand(p);
  const overdueBand = fcTrainingOverdueBand(p.overduePct, p.overdueAppetitePct, p.overdueRedThresholdPct);
  const highRiskBand = fcTrainingOverdueBand(
    p.highRisk.overduePct,
    p.overdueAppetitePct,
    p.overdueRedThresholdPct,
  );
  const overdueOver = p.overduePct > p.overdueAppetitePct;
  const highRiskOver = p.highRisk.overduePct > p.overdueAppetitePct;
  // Completion bar: higher is better — tick at programme target.
  const completionScale = 100 * 1.05;
  const completionFill = Math.min(100, (p.trainedPct / completionScale) * 100);
  const completionTick = Math.min(100, (p.programmeTargetPct / completionScale) * 100);

  return (
    <div>
      <div className={`w-full rounded-xl border-2 p-4 shadow-sm ${bandBg(band)}`}>
        <div className="flex items-start justify-between mb-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">
              Financial crime training · CO-AML-12 / CO-FRD-01 / CO-ABC-03 / CO-PTE-03
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">Programme completion &amp; overdue</h3>
            <p className="text-[11px] text-slate-700 mt-1 leading-relaxed max-w-2xl">
              Firm-wide attestation is the figure already in the MLRO Annual Report
              ({p.narrativeSource}). Overdue headcount is from the LMS overlay; high-risk
              roles use the ABC.01.03.01 advanced-training cohort basis (benchmark {p.highRisk.advancedTrainingBenchmarkPct}%).
            </p>
          </div>
          <StatusBadge tone={band} label={band.toUpperCase()} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
          {/* Firm-wide trained % — pack figure */}
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Staff trained (firm-wide)
            </div>
            <div className="text-3xl font-bold tabular-nums text-slate-900 mt-0.5">
              {p.trainedPct}
              <span className="text-base font-semibold text-slate-500">%</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {p.trainedCount.toLocaleString("en-GB")} of {p.populationInScope.toLocaleString("en-GB")} · target{" "}
              {p.programmeTargetPct}%
              {p.programmeTargetConfigurable ? " (configurable)" : ""}
            </div>
            <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-400" style={{ width: `${completionFill}%` }} />
              <div className="absolute top-0 bottom-0 w-px bg-slate-900" style={{ left: `${completionTick}%` }} />
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[9px] text-slate-400">target {p.programmeTargetPct}%</span>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                p.trainedPct >= p.programmeTargetPct ? "text-emerald-600" : "text-rose-600"
              }`}>
                {p.trainedPct >= p.programmeTargetPct ? "WITHIN" : "UNDER"}
              </span>
            </div>
          </div>

          {/* Overdue vs appetite */}
          <div className={`rounded-md border bg-white p-3 ${bandBg(overdueBand)}`}>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Overdue
            </div>
            <div className={`text-3xl font-bold tabular-nums mt-0.5 ${overdueOver ? "text-rose-700" : "text-slate-900"}`}>
              {p.overduePct}
              <span className="text-base font-semibold text-slate-500">%</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {p.overdueCount.toLocaleString("en-GB")} people · appetite {p.overdueAppetitePct}%
              {p.overdueAppetiteConfigurable ? " (configurable)" : ""}
            </div>
            <MiniAppetiteBar value={p.overduePct} appetite={p.overdueAppetitePct} over={overdueOver} />
          </div>

          {/* High-risk role split */}
          <div className={`rounded-md border bg-white p-3 ${bandBg(highRiskBand)}`}>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              High-risk roles overdue
            </div>
            <div className={`text-3xl font-bold tabular-nums mt-0.5 ${highRiskOver ? "text-rose-700" : "text-slate-900"}`}>
              {p.highRisk.overdueCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {p.highRisk.overduePct}% of {p.highRisk.population.toLocaleString("en-GB")} high-risk ·{" "}
              {p.otherRoles.overdueCount} other-role overdue
            </div>
            <MiniAppetiteBar
              value={p.highRisk.overduePct}
              appetite={p.overdueAppetitePct}
              over={highRiskOver}
            />
            <div className="mt-1.5 text-[10px] text-slate-500 leading-snug">
              Advanced training benchmark {p.highRisk.advancedTrainingBenchmarkPct}% ({p.highRisk.racmRef}) —
              regulatory exposure sits here.
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
          <span>Linked: {p.linkedGsrRefs.join(" · ")}</span>
        </div>
        <div className="mt-2 border-t border-slate-200/80 pt-1.5">
          <span className="block text-[10px] leading-snug text-slate-500">{p.sourceLabel}</span>
        </div>
      </div>
      {band === "red" || band === "amber" ? (
        <PathToGreenStrip entityRef={p.pathToGreenRef} />
      ) : null}
    </div>
  );
};

// CapacityVsDemandGauge — dual-line capacity (flat) vs demand (rising).
// Custom mini-SVG since the existing Sparkline only supports a single series.
// When nested=true, renders as the causal explanation inside AlertBacklogVsAppetite.
export const CapacityVsDemandGauge = ({ series, nested = false }) => {
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
  const shell = nested
    ? "w-full rounded-lg border border-slate-200 bg-white p-4"
    : `w-full rounded-xl border-2 p-4 shadow-sm ${bandBg(gap > 0 ? "red" : "green")}`;
  return (
    <div className={shell}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">
            {nested ? "Why the backlog · capacity vs demand" : "L1/L2 disposition team · capacity vs demand"}
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            {nested ? "Demand exceeds fixed disposition capacity" : "The why behind the alert backlog"}
          </h3>
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

export const COVERAGE_LENSES = [
  { id: 'forward',   label: 'Forward',        sub: 'Obligation → Controls' },
  { id: 'crsa',      label: 'CRSA Coverage',  sub: 'Group Set Requirement → Controls' },
  { id: 'reverse',   label: 'Reverse',        sub: 'Control → Obligations + GSRs' },
  { id: 'gaps',      label: 'Coverage Gaps',  sub: 'Single weak control' },
  { id: 'regchange', label: 'Reg-change Impact', sub: 'Horizon item → downstream lineage' },
];

// Forward lens — preserves the existing 3-bucket Obligation Coverage panel.
export const ForwardCoverageLens = ({ openDrawer }) => {
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
export const CRSACoverageLens = ({ openDrawer, setSelectedGSRId, setActiveScreen }) => {
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
export const ReverseCoverageQuery = ({ openDrawer, setSelectedGSRId, setActiveScreen }) => {
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
export const CoverageGapPanel = ({ setSelectedGSRId, setActiveScreen }) => {
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
export const RegChangeImpactLineage = ({ openDrawer }) => {
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

export function EmptyState({ message }) {
  return (
    <div className="p-12 text-center">
      <div className="text-3xl mb-2">📭</div>
      <div className="text-sm text-slate-500">{message}</div>
    </div>
  );
}
