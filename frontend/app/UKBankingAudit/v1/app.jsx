import React, { useState, useMemo, useCallback } from "react";
import mockControlTraceData from "./mockdata";

const {
  personas, navigationItems, riskDomains, risks, controls, obligations,
  processes, processSteps, smfHolders, actors, kris, riskAppetiteMetrics,
  consumerOutcomes, importantBusinessServices, coverageGaps,
  controlInstances, evidenceRecords, exceptions, issues, remediationActions,
  tests, workpapers, auditPacks, aiInsights, auditTrailEvents, metrics,
} = mockControlTraceData;

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
// `stretch`: map to internal viewBox coords then scale SVG to 100% width (fills flex row).
const Sparkline = ({ series = [], band = "neutral", width = 120, height = 30, fill = false, stretch = false }) => {
  if (!series.length) return <div className="h-[30px]" />;
  const W = stretch ? Math.max(120, Number(width) || 400) : width;
  const H = height;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stroke = { red: "#e11d48", amber: "#d97706", green: "#059669", neutral: "#64748b" }[band] || "#64748b";
  const fillColor = { red: "#fee2e2", amber: "#fef3c7", green: "#d1fae5", neutral: "#f1f5f9" }[band] || "#f1f5f9";
  const points = series.map((v, i) => {
    const x = (i / (series.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const fillPath = `0,${H} ${points} ${W},${H}`;
  if (stretch) {
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        className="block max-w-full min-h-0"
        aria-hidden
      >
        {fill && <polygon points={fillPath} fill={fillColor} />}
        <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
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

const EntityTypeBadge = ({ type }) => {
  const map = { risk: "RISK", control: "CONTROL", obligation: "OBLIGATION", issue: "ISSUE", evidence: "EVIDENCE", smf: "SMF", auditPack: "AUDIT PACK", aiInsight: "AI INSIGHT" };
  const tone = { risk: "rose", control: "indigo", obligation: "purple", issue: "amber", evidence: "sky", smf: "emerald", auditPack: "slate", aiInsight: "violet" }[type] || "slate";
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

// ─── App Component ────────────────────────────────────────────────────────
export default function App() {
  const [activePersona, setActivePersona] = useState("cro");
  const [activeScreen, setActiveScreen] = useState("riskPosture");
  const [activeViewMode, setActiveViewMode] = useState("controls");
  const [drawer, setDrawer] = useState({ isOpen: false, entityType: null, entityId: null, sourceScreen: null, drillPath: [] });
  const [selectedTestId, setSelectedTestId] = useState("TEST-Q2-AML-002");
  const [selectedSMFId, setSelectedSMFId] = useState("SMF17-PRIYA-PATEL");
  const [selectedPackId, setSelectedPackId] = useState("AP-S165-FCC-001");
  const [timeTravel, setTimeTravel] = useState({ mode: "live", asOfDate: null });
  const [filterDomain, setFilterDomain] = useState(null);
  const [smfTrails, setSMFTrails] = useState(() => {
    // Local mutable state for SMF reasonable-steps trail to allow capture interactions
    const map = {};
    smfHolders.forEach(s => {
      map[s.id] = {
        awaiting: [...s.awaitingAcknowledgements],
        trail: [...s.reasonableStepsTrail],
        rss: { ...s.rss, components: { ...s.rss.components } },
      };
    });
    return map;
  });
  const [pendingDecisionId, setPendingDecisionId] = useState(null);
  const [decisionRationale, setDecisionRationale] = useState("");

  // Switch persona → default screen
  const switchPersona = (id) => {
    const p = findById(personas, id);
    setActivePersona(id);
    if (p) setActiveScreen(p.defaultScreen);
    setDrawer({ isOpen: false, entityType: null, entityId: null, sourceScreen: null, drillPath: [] });
  };

  const openDrawer = (entityType, entityId, sourceScreen) => {
    setDrawer({ isOpen: true, entityType, entityId, sourceScreen, drillPath: [] });
  };

  const drillFromDrawer = (entityType, entityId) => {
    setDrawer(prev => {
      const currentEntity = resolveEntity(prev.entityType, prev.entityId);
      const label = currentEntity?.title || currentEntity?.name || prev.entityId;
      return {
        ...prev,
        drillPath: [...prev.drillPath, { type: prev.entityType, id: prev.entityId, label }],
        entityType,
        entityId,
      };
    });
  };

  const drillBack = () => {
    setDrawer(prev => {
      if (!prev.drillPath.length) return { ...prev, isOpen: false };
      const last = prev.drillPath[prev.drillPath.length - 1];
      return { ...prev, entityType: last.type, entityId: last.id, drillPath: prev.drillPath.slice(0, -1) };
    });
  };

  const closeDrawer = () => setDrawer({ isOpen: false, entityType: null, entityId: null, sourceScreen: null, drillPath: [] });

  const resolveEntity = (type, id) => {
    if (!type || !id) return null;
    return ({ risk: getRisk, control: getControl, obligation: getObligation, issue: getIssue, evidence: getEvidence, smf: getSMF, auditPack: getAuditPack, aiInsight: getInsight }[type] || (() => null))(id);
  };

  // Capture SMF decision (mutates local state)
  const captureSMFDecision = (smfId, awaiting) => {
    if (!decisionRationale.trim()) return;
    setSMFTrails(prev => {
      const next = { ...prev };
      const cur = { ...next[smfId] };
      cur.awaiting = cur.awaiting.filter(a => a.targetId !== awaiting.targetId);
      const newEvent = {
        timestamp: new Date().toISOString(),
        eventType: "acknowledgement",
        label: `Acknowledged ${awaiting.targetType === "issue" ? awaiting.targetId : awaiting.targetType + " " + awaiting.targetId}: ${decisionRationale.slice(0, 80)}`,
        evidenceId: null,
      };
      cur.trail = [newEvent, ...cur.trail];
      cur.rss = {
        ...cur.rss,
        components: { ...cur.rss.components, issueAwareness: Math.min(100, cur.rss.components.issueAwareness + 14) },
      };
      cur.rss.score = Math.round(Object.values(cur.rss.components).reduce((s, v) => s + v, 0) / 7);
      cur.rss.band = cur.rss.score >= 80 ? "green" : cur.rss.score >= 60 ? "amber" : "red";
      next[smfId] = cur;
      return next;
    });
    setPendingDecisionId(null);
    setDecisionRationale("");
  };

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
          <button onClick={() => setTimeTravel(t => t.mode === "live" ? { mode: "asOf", asOfDate: "2026-03-31" } : { mode: "live", asOfDate: null })}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md">
            <span className={`h-1.5 w-1.5 rounded-full ${timeTravel.mode === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            {timeTravel.mode === "live" ? "Live · now" : `As of ${timeTravel.asOfDate}`}
          </button>

          {/* Independence mode */}
          {activePersona === "doer" && (
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
        {activeScreen === "riskPosture" && <CRORiskPostureCockpit openDrawer={openDrawer} setActiveScreen={setActiveScreen} setSelectedSMFId={setSelectedSMFId} smfTrails={smfTrails} />}
        {activeScreen === "controlUniverse" && <LeadershipControlUniverse activeViewMode={activeViewMode} setActiveViewMode={setActiveViewMode} openDrawer={openDrawer} filterDomain={filterDomain} setFilterDomain={setFilterDomain} />}
        {activeScreen === "complianceWorkspace" && <ComplianceAuditWorkspace setActiveScreen={setActiveScreen} setSelectedTestId={setSelectedTestId} setSelectedPackId={setSelectedPackId} />}
        {activeScreen === "populationTesting" && <PopulationTestWorkspace selectedTestId={selectedTestId} openDrawer={openDrawer} setActiveScreen={setActiveScreen} setSelectedPackId={setSelectedPackId} />}
        {activeScreen === "smcrWorkspace" && <SMCRReasonableStepsWorkspace selectedSMFId={selectedSMFId} setSelectedSMFId={setSelectedSMFId} smfTrails={smfTrails} pendingDecisionId={pendingDecisionId} setPendingDecisionId={setPendingDecisionId} decisionRationale={decisionRationale} setDecisionRationale={setDecisionRationale} captureSMFDecision={captureSMFDecision} openDrawer={openDrawer} setActiveScreen={setActiveScreen} setSelectedPackId={setSelectedPackId} />}
        {activeScreen === "auditPackBuilder" && <AuditPackBuilder selectedPackId={selectedPackId} setSelectedPackId={setSelectedPackId} openDrawer={openDrawer} />}
        {activeScreen === "aiInsights" && <AIInsightExplorer openDrawer={openDrawer} />}
      </main>

      {/* ── DRAWER ──────────────────────────────────────────────────────── */}
      {drawer.isOpen && (
        <DetailDrawer drawer={drawer} closeDrawer={closeDrawer} drillFromDrawer={drillFromDrawer} drillBack={drillBack} setActiveScreen={setActiveScreen} setSelectedSMFId={setSelectedSMFId} setSelectedPackId={setSelectedPackId} setSelectedTestId={setSelectedTestId} />
      )}
    </div>
  );
}

// ─── SCREEN: CRO Risk Posture Cockpit ─────────────────────────────────────
function CRORiskPostureCockpit({ openDrawer, setActiveScreen, setSelectedSMFId, smfTrails }) {
  const cro = personas.find(p => p.id === "cro");
  const cromSMF = cro?.smfId ? smfHolders.find(s => s.id === cro.smfId) : null;
  const trail = cromSMF ? smfTrails[cromSMF.id] : null;
  const inboxItems = metrics.byPersona.cro.inboxItems;

  return (
    <div className="space-y-6">
      {/* Hero RES */}
      <div className="grid grid-cols-12 gap-6 lg:items-stretch">
        <div className="col-span-12 lg:col-span-7 flex min-h-0">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm w-full flex flex-col min-h-[11rem]">
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">Enterprise Residual Exposure Score</div>
                <div className="flex items-baseline gap-3 mt-1">
                  <div className="text-5xl font-bold text-amber-600">{metrics.enterpriseRES.value}</div>
                  <StatusBadge tone={metrics.enterpriseRES.band} label={metrics.enterpriseRES.band.toUpperCase()} />
                  <span className="text-sm font-semibold text-rose-600">▲ {metrics.enterpriseRES.delta} this week</span>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">PRA SREP</div>
                  <div className="text-2xl font-bold text-slate-900">Cat {metrics.enterpriseRES.praSREPCategory}</div>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-3 mt-auto flex-shrink-0 w-full min-w-0">
              <div className="min-w-0 flex-1">
                <Sparkline
                  series={metrics.enterpriseRES.sparklineSeries}
                  band={metrics.enterpriseRES.band}
                  width={520}
                  height={52}
                  fill
                  stretch
                />
              </div>
              <div className="text-xs text-slate-500 pb-1 shrink-0 whitespace-nowrap">13 weeks</div>
            </div>
          </div>
        </div>

        {/* Reasonable Steps Snapshot */}
        <div className="col-span-12 lg:col-span-5 flex min-h-0">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm w-full h-full flex flex-col min-h-[11rem]">
            <div className="flex items-start justify-between mb-3 flex-shrink-0">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">My Reasonable Steps · SMF4</div>
                <div className="text-base font-semibold text-slate-900 mt-0.5">{cromSMF?.name || "—"}</div>
                <div className="text-xs text-slate-500">{cromSMF?.functionLabel}</div>
              </div>
              {trail && <StatusBadge tone={trail.rss.band} label={`RSS ${trail.rss.score}`} />}
            </div>
            {trail && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="grid grid-cols-2 gap-2 mb-4 flex-shrink-0">
                  <KVRow k="Awaiting acks" v={trail.awaiting.length} tone={trail.awaiting.length === 0 ? "green" : "amber"} />
                  <KVRow k="Last attestation" v={cromSMF.lastAttestationDate || "—"} />
                  <KVRow k="PR" v={cromSMF.prescribedResponsibilities.join(", ") || "—"} />
                  <KVRow k="Conduct breaches" v={cromSMF.conductRuleBreaches} tone={cromSMF.conductRuleBreaches === 0 ? "green" : "red"} />
                </div>
                <button onClick={() => { setSelectedSMFId(cromSMF.id); setActiveScreen("smcrWorkspace"); }}
                  className="w-full py-2 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-md mt-auto">
                  Open my Reasonable Steps Workspace →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What changed + Heatmap */}
      <div className="grid grid-cols-12 gap-6 lg:items-stretch">
        <div className="col-span-12 lg:col-span-7 flex min-h-0">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm w-full h-full flex flex-col min-h-[16rem]">
            <div className="flex items-center justify-between mb-3 gap-3 flex-shrink-0">
              <h3 className="text-sm font-semibold text-slate-900">Domain Heat Map</h3>
              <span className="text-[10px] text-slate-500 text-right shrink-0">click a domain to drill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 min-h-[10.5rem] sm:grid-rows-2">
              {riskDomains.map(d => (
                <button key={d.id} onClick={() => openDrawer("risk", d.primaryDriverRiskId, "riskPosture")}
                  className={`text-left p-3 rounded-lg border-2 hover:shadow-md transition h-full min-h-[5.25rem] flex flex-col justify-between ${bandBg(d.resBand)}`}>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="text-xs font-medium leading-snug">{d.label}</div>
                    <span className={`text-xs shrink-0 ${trendTone(d.trend)}`}>{trendArrow(d.trend)}</span>
                  </div>
                  <div className="text-2xl font-bold">{d.res}</div>
                  <Sparkline series={d.resSparklineSeries} band={d.resBand} width={90} height={20} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 flex min-h-0">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm w-full h-full flex flex-col min-h-[16rem]">
            <div className="flex items-center justify-between mb-3 gap-3 flex-shrink-0">
              <h3 className="text-sm font-semibold text-slate-900">What Changed This Week</h3>
              <span className="text-[10px] text-slate-500 text-right shrink-0">AI signals · top 3</span>
            </div>
            <div className="space-y-2 flex-1 flex flex-col min-h-0 justify-start">
              {aiInsights.filter(i => i.type === "what_changed" || i.type === "anomaly" || i.type === "root_cause").slice(0, 3).map(i => (
                <button key={i.id} onClick={() => openDrawer("aiInsight", i.id, "riskPosture")}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition shrink-0">
                  <div className="flex items-start gap-2 mb-1 w-full">
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded shrink-0">AI</span>
                    <StatusBadge tone={i.severity === "high" ? "red" : i.severity === "medium" ? "amber" : "green"} label={i.severity.toUpperCase()} size="xs" />
                    <span className="text-[10px] text-slate-500 ml-auto shrink-0 tabular-nums">conf {Math.round(i.confidence * 100)}%</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mb-0.5">{i.title}</div>
                  <div className="text-[11px] text-slate-600 line-clamp-2">{i.summary}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Material items inbox */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Material Items Awaiting Decision</h3>
          <p className="text-xs text-slate-500">CRO inbox · {metrics.byPersona.cro.inboxItems.length} items</p>
        </div>
        <div className="divide-y divide-slate-100">
          {inboxItems.map(item => (
            <button key={item.id} onClick={() => openDrawer(item.targetEntityType === "issue" ? "issue" : item.targetEntityType === "auditPack" ? "auditPack" : "aiInsight", item.targetEntityId, "riskPosture")}
              className="w-full text-left px-5 py-3 hover:bg-slate-50 transition flex items-start gap-3">
              <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${bandDot(item.severity === "critical" || item.severity === "high" ? "red" : item.severity === "medium" ? "amber" : "neutral")}`} />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.type.replace("_", " ")} · {item.ageDays}d open · → {item.targetEntityId}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${severityBadge(item.severity)}`}>{item.severity.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Leadership Control Universe ──────────────────────────────────
function LeadershipControlUniverse({ activeViewMode, setActiveViewMode, openDrawer, filterDomain, setFilterDomain }) {
  const filtered = useMemo(() => {
    if (!filterDomain) return controls;
    return controls.filter(c => {
      const r = getRisk(c.linkedRiskIds[0]);
      return r?.domain === filterDomain;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Control Universe & Obligation Coverage</h2>
          <p className="text-xs text-slate-500">SMF16/17 leadership view · {controls.length} controls · {obligations.length} obligations</p>
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
        {riskDomains.slice(0, 5).map(d => (
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

const DimCell = ({ dim }) => (
  <div className="col-span-2 flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${bandBar(dim.band)}`} style={{ width: `${dim.current}%` }} />
    </div>
    <div className={`text-xs font-bold w-8 text-right ${bandText(dim.band)}`}>{dim.current}</div>
  </div>
);

// ─── SCREEN: Compliance / Audit Workspace ─────────────────────────────────
function ComplianceAuditWorkspace({ setActiveScreen, setSelectedTestId, setSelectedPackId }) {
  const testabilityBuckets = useMemo(() => {
    return {
      population: controls.filter(c => c.judgementDependence === "none"),
      hybrid: controls.filter(c => c.judgementDependence === "partial"),
      sample_only: controls.filter(c => c.judgementDependence === "full"),
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Compliance Officer / Audit Manager Workspace</h2>
        <p className="text-xs text-slate-500">2LoD Compliance · {tests.length} tests · {workpapers.length} workpapers · {auditPacks.length} audit packs</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Test Pipeline */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Test Pipeline</h3>
              <span className="text-[10px] text-slate-500">{tests.length} active</span>
            </div>
            <div className="divide-y divide-slate-100">
              {tests.map(t => {
                const c = getControl(t.controlId);
                return (
                  <button key={t.id} onClick={() => { setSelectedTestId(t.id); setActiveScreen("populationTesting"); }}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 transition grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-4">
                      <div className="text-sm font-semibold text-slate-900">{t.id}</div>
                      <div className="text-xs text-slate-600 truncate">{c?.title}</div>
                    </div>
                    <div className="col-span-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${t.method === "population" ? "bg-emerald-100 text-emerald-800" : t.method.startsWith("sample") ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{t.method.replace("_", " ")}</span>
                    </div>
                    <div className="col-span-2 text-xs text-slate-700">N={t.populationSize}</div>
                    <div className="col-span-2 text-xs">
                      {t.exceptionCount > 0 ? <span className="text-rose-600 font-semibold">{t.exceptionCount} exceptions</span> : <span className="text-emerald-600 font-semibold">No exceptions</span>}
                    </div>
                    <div className="col-span-2 text-right">
                      <StatusBadge tone={t.status === "done" ? "green" : t.status === "in_progress" ? "amber" : "neutral"} label={t.status.replace("_", " ")} size="xs" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workpapers */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold">Workpapers in Progress</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {workpapers.map(w => (
                <div key={w.id} className="px-5 py-3 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <div className="text-sm font-semibold text-slate-900">{w.id}</div>
                    <div className="text-xs text-slate-600 line-clamp-1">{w.generatedSummary}</div>
                  </div>
                  <div className="col-span-2 text-xs text-slate-600">{w.controlId}</div>
                  <div className="col-span-2 text-xs">
                    {w.aiAssistanceLineage && <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">AI · {w.aiAssistanceLineage.humanEditsCount} edits</span>}
                  </div>
                  <div className="col-span-3 text-right">
                    <StatusBadge tone={w.status === "signed_off" || w.status === "archived" ? "green" : w.status === "draft" ? "amber" : "neutral"} label={w.status.replace("_", " ")} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Audit Packs */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold">Audit Packs in Progress</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {auditPacks.map(p => (
                <button key={p.id} onClick={() => { setSelectedPackId(p.id); setActiveScreen("auditPackBuilder"); }}
                  className="w-full text-left px-5 py-3 hover:bg-slate-50">
                  <div className="text-xs font-semibold text-slate-900 line-clamp-1">{p.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{p.scopeType.replace(/_/g, " ")}</span>
                    <StatusBadge tone={p.readinessStatus === "ready_to_send" ? "green" : "amber"} label={p.readinessStatus.replace("_", " ")} size="xs" />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.composition.totalEntities.toLocaleString()} entities</div>
                </button>
              ))}
            </div>
          </div>

          {/* Population testability */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Population Testability</h3>
            <div className="space-y-2">
              {[
                { key: "population", label: "100% Population", tone: "green", data: testabilityBuckets.population },
                { key: "hybrid", label: "Hybrid", tone: "amber", data: testabilityBuckets.hybrid },
                { key: "sample_only", label: "Sample Only", tone: "neutral", data: testabilityBuckets.sample_only },
              ].map(b => (
                <div key={b.key} className={`p-2 rounded border ${bandBg(b.tone)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{b.label}</span>
                    <span className="text-sm font-bold">{b.data.length}</span>
                  </div>
                  <div className="text-[10px] mt-0.5">{b.data.map(c => c.id).join(", ") || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

          {/* Workpaper preview */}
          {workpaper && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Workpaper · {workpaper.id}</h3>
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
                <button onClick={() => { setSelectedPackId("AP-S165-FCC-001"); setActiveScreen("auditPackBuilder"); }}
                  className="flex-1 py-2 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-md">
                  Add to Audit Pack →
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
function SMCRReasonableStepsWorkspace({ selectedSMFId, setSelectedSMFId, smfTrails, pendingDecisionId, setPendingDecisionId, decisionRationale, setDecisionRationale, captureSMFDecision, openDrawer, setActiveScreen, setSelectedPackId }) {
  const smf = getSMF(selectedSMFId);
  if (!smf) return <EmptyState message="Select an SMF." />;
  const live = smfTrails[selectedSMFId];
  const rss = live.rss;

  const rssComponents = [
    { key: "oversightCadenceEvidence", label: "Oversight Cadence" },
    { key: "escalationEvidence", label: "Escalation" },
    { key: "attestationFreshness", label: "Attestation Freshness" },
    { key: "issueAwareness", label: "Issue Awareness" },
    { key: "decisionLogCompleteness", label: "Decision Log" },
    { key: "mrmAlignment", label: "MRM Alignment" },
    { key: "sorAlignment", label: "SoR Alignment" },
  ];

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
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">RSS Decomposition</h3>
            <div className="space-y-2">
              {rssComponents.map(c => {
                const v = rss.components[c.key];
                const t = v >= 80 ? "green" : v >= 60 ? "amber" : "red";
                return (
                  <div key={c.key}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-700">{c.label}</span>
                      <span className={`font-bold ${bandText(t)}`}>{v}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${bandBar(t)}`} style={{ width: `${v}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

          <button onClick={() => { setSelectedPackId("AP-S165-FCC-001"); setActiveScreen("auditPackBuilder"); }}
            className="w-full p-3 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md">
            Generate s.166 Reasonable Steps Pack →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: AuditPack Builder ────────────────────────────────────────────
function AuditPackBuilder({ selectedPackId, setSelectedPackId, openDrawer }) {
  const pack = getAuditPack(selectedPackId);
  if (!pack) return <EmptyState message="Select an audit pack." />;

  const compositionRows = [
    { key: "controls", label: "Controls", entityType: "control", data: pack.composition.controls },
    { key: "obligations", label: "Obligations", entityType: "obligation", data: pack.composition.obligations },
    { key: "evidence", label: "Evidence", entityType: "evidence", data: pack.composition.evidence },
    { key: "issues", label: "Issues", entityType: "issue", data: pack.composition.issues },
    { key: "workpapers", label: "Workpapers", entityType: null, data: pack.composition.workpapers },
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
                  <button key={row.key} onClick={() => row.entityType && sample[0] && openDrawer(row.entityType, sample[0], "auditPackBuilder")}
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
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Generated Narrative</h3>
                <p className="text-[10px] text-slate-500">AI-drafted with per-paragraph citations · model {pack.narrativeLineage.model} v{pack.narrativeLineage.modelVersion}</p>
              </div>
              <span className="text-[10px] font-bold tracking-wider bg-violet-100 text-violet-800 px-2 py-0.5 rounded">AI · {pack.narrativeLineage.perParagraphCitationCount} CITATIONS</span>
            </div>
            <div className="p-5 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {pack.generatedNarrative}
            </div>
            {pack.narrativeLineage.inputsNotSeen.length > 0 && (
              <div className="mx-5 mb-5 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold mb-1">Inputs Not Seen by AI</div>
                <ul className="text-xs text-amber-900 space-y-0.5">
                  {pack.narrativeLineage.inputsNotSeen.map((x, i) => <li key={i}>· {x}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md">Route to Internal Review →</button>
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
        </div>
      </div>
    </>
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
        <Stat k="Domain" v={risk.domain.replace("_", " ")} />
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
        <Stat k="Type" v={control.controlType} />
        <Stat k="Nature" v={control.controlNature} />
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
          <h3 className="text-sm font-semibold mb-2">Linked Audit Packs</h3>
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
      <button onClick={() => { setSelectedPackId(pack.id); setActiveScreen("auditPackBuilder"); closeDrawer(); }}
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