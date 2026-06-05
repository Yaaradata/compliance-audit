import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { FastTagAiLogo } from "@/app/Indian_Process_Audit/_shared/FastTagAiLogo";
import { performanceTheme } from './fastTagDrilldownTheme';
import {
  ChartHint,
  DrillCrumbBar,
  DrillPeriodFilter,
  InsightSectionHead,
  sortHeroTopicPanels,
} from './fastTagDrilldownUi';
import { DRILL_PERIOD_OPTIONS } from './fastTagDrillPeriod';
import { buildPerformancePeriodSnapshot } from './fastTagPerformancePeriodData';
import { FastTagHobSettlementPanel } from './FastTagHobSettlementPanel';

const FastTagPerformanceRegionSection = dynamic(
  () => import('../FastTagPerformanceRegionSection'),
  { ssr: false },
);

/**
 * FASTag — Head of Business
 * Drill-down page for the card: "How is the overall FASTag business performing?"
 *
 * Flagship performance view. A FASTag issuer-business is a prepaid-float +
 * transaction-rails business: money flows plaza -> acquirer -> NPCI/NETC switch
 * -> issuer -> customer wallet on daily (T+1) settlement cycles. So the real
 * performance levers are: wallet float & float income, the thin take-rate on
 * toll rails, Annual Pass upfront cash, and how much cost AI removes from
 * reconciliation / fraud / support.
 *
 * Sections (what a Head of Business most needs):
 *   1. Performance score + headline KPI strip + net-revenue trend
 *   2. Financial performance / P&L snapshot
 *   3. Cash Inflow & Outflow  (requested)
 *   4. Toll ledger flow & closing entries (HoB cash quality)
 *   5. Operational throughput & efficiency
 *   6. AI involvement  (requested)
 *   7. Wallet float & liquidity (the hidden engine)
 *   8. Risk / health flags + outlook
 *
 * Figures illustrative at a mid-size issuer scale; national context noted inline.
 * Self-contained: inline styling + injected <style>. Drop into any React app.
 */

const { C, styleTag } = performanceTheme();

/* ------------------------------- HELPERS -------------------------------- */
function TrendLine({ data, color = C.blue, w = 760, h = 56, offsetY = 0 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const sx = w / (data.length - 1);
  const padTop = 8;
  const padBottom = 10;
  const y = (v) =>
    offsetY + h - padTop - ((v - min) / (max - min || 1)) * (h - padTop - padBottom);
  const pts = data.map((v, i) => [i * sx, y(v)]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cxm = (x0 + x1) / 2;
    d += ` C ${cxm} ${y0}, ${cxm} ${y1}, ${x1} ${y1}`;
  }
  const id = "pl" + color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
      {pts.map(([x, yy], i) => i === pts.length - 1 && <circle key={i} cx={x - 1} cy={yy} r="3.5" fill={color} />)}
    </svg>
  );
}

/** 100% stacked strip — cash composition */
function StackedCashStrip({ rows, colors }) {
  const total = rows.reduce((s, x) => s + x.v, 0);
  return (
    <div className="pf-cash-strip" role="img" aria-label="Cash composition strip">
      {rows.map((r, i) => {
        const pct = (r.v / total) * 100;
        return (
          <div
            key={r.k}
            className="pf-cash-seg"
            style={{ width: `${pct}%`, background: colors[i % colors.length] }}
            title={`${r.k}: ₹${r.v.toFixed(1)}Cr (${pct.toFixed(0)}%)`}
          >
            {pct >= 11 ? <span>{pct.toFixed(0)}%</span> : null}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- DATA --------------------------------- */
/** AI read-out blocks keyed to Positives / Negative / Critical topic buttons. */
const HERO_AI_BY_TOPIC = {
  positive: {
    title: "Positives",
    toneClass: "pf-hero-ai-positive",
    blocks: [
      {
        tone: "ok",
        label: "Revenue",
        points: [
          "Net revenue ₹52Cr (+11% YoY); March run-rate back above festival week",
          "Toll commission + float income holding net margin",
          "Prioritise corridors with strongest recharge-to-toll recovery",
        ],
      },
      {
        tone: "ok",
        label: "Margin",
        points: [
          "Operating margin 22% (+2 pts) vs manual baseline",
          "Take-rate stable; float yield offsets acquirer share on top lanes",
          "Protect margin with slab renegotiation before Q2 peak",
        ],
      },
      {
        tone: "info",
        label: "Volume",
        points: [
          "Toll GTV ₹1,850Cr (+19% YoY); daily txn steady at 18.4L",
          "Active tags 84L (+5% QoQ) — throughput without issuance spike",
          "Shift sales focus to fleet B2B and Annual Pass attach",
        ],
      },
    ],
  },
  negative: {
    title: "Negatives",
    toneClass: "pf-hero-ai-negative",
    blocks: [
      {
        tone: "warn",
        label: "Signal",
        points: [
          "Health index ▼3 pts WoW — recharge-to-toll softened post-festival",
          "Toll demand flat; gap is wallet top-up, not trip volume",
          "Action: push auto-recharge on top 5 highway corridors",
        ],
      },
      {
        tone: "warn",
        label: "Float",
        points: [
          "Dormant tags 16% of fleet (was 12%); ₹86Cr idle float idle",
          "Largest recovery lever vs any single acquisition channel",
          "Target highway commuters first in reactivation campaigns",
        ],
      },
      {
        tone: "warn",
        label: "Fleets",
        points: [
          "12 fleet accounts flagged for wallet-recharge friction",
          "B2B recharge success fastest path to lift recharge-to-toll",
          "Assign KAM touch on all 12 within this week",
        ],
      },
    ],
  },
  critical: {
    title: "Critical",
    toneClass: "pf-hero-ai-critical",
    blocks: [
      {
        tone: "warn",
        label: "Leakage",
        points: [
          "Refund / chargeback leakage +124% WoW",
          "Double-deduction + plaza recon = top preventable outflows",
          "Expand AI deflection on dispute queues this sprint",
        ],
      },
      {
        tone: "warn",
        label: "Concentration",
        points: [
          "Lead acquirer 38% of partner volume — concentration risk",
          "Renegotiate volume slabs before Q2 peak travel",
          "Diversify issuance to co-brand + digital channels",
        ],
      },
      {
        tone: "info",
        label: "Capex",
        points: [
          "GNSS free-flow pilots on 2 corridors — model shift ahead",
          "Capex and opex step-up vs current plaza settlement",
          "Lock partner terms and corridor spend before go-live",
        ],
      },
    ],
  },
};

const HERO_TOPIC_PANELS = [
  {
    id: "positive",
    buttonLabel: "Positives",
    title: "Positives",
    tone: "positive",
    items: [
      { label: "Net revenue", detail: "₹52Cr (+11% YoY); March run-rate recovering after festival week." },
      { label: "Op. margin", detail: "22% (+2 pts); toll commission and float income holding." },
      { label: "Toll GTV", detail: "₹1,850Cr (+19% YoY); daily volume steady at 18.4L." },
    ],
  },
  {
    id: "negative",
    buttonLabel: "Negative",
    title: "Negatives",
    tone: "negative",
    items: [
      { label: "Health index", detail: "Down 3 pts vs last week — recharge-to-transaction ratio softened." },
      { label: "Dormant tags", detail: "16% of fleet (up from 12%); ₹86Cr idle float not transacting." },
      { label: "Fleet friction", detail: "12 fleet accounts flagged for wallet-recharge friction." },
    ],
  },
  {
    id: "critical",
    buttonLabel: "Critical",
    title: "Critical",
    tone: "critical",
    items: [
      { label: "Refund leak", detail: "Refund / chargeback leakage up +124% vs last week." },
      { label: "Acquirer mix", detail: "Top acquirer concentration at 38% of partner volume." },
      { label: "GNSS capex", detail: "GNSS free-flow transition — capex and operating model shift ahead." },
    ],
  },
];

const CASH_IN_COLORS = [C.green, C.teal, "#34d399", C.blue, "#60a5fa", C.violet];
const CASH_OUT_COLORS = [C.red, C.amber, "#f97316", "#fb7185", "#e879f9", "#a78bfa", C.textFaint, "#94a3b8"];

const CASH_FLOW_AI = {
  inflow: {
    insight:
      "Toll commission and wallet float income carry most inflow. Annual Pass upfront cash is the fastest-growing line. Co-brand and non-toll rails are still small versus retail toll volume.",
    improve: [
      "Bundle Annual Pass with auto-recharge on your top corridors to lock more upfront float.",
      "Push parking and closed-loop toll attach where take-rate beats pure highway MDR.",
      "Renegotiate co-brand referral tiers with banks that already issue most new tags.",
    ],
  },
  outflow: {
    insight:
      "Acquirer share and marketing are the two largest outflow lines. NETC switch and support costs are steady, but refunds rose with dispute volume. Tech spend is scaling slower than transaction growth.",
    improve: [
      "Use volume slabs on the lead acquirer to trim partner share without slowing issuance.",
      "Move part of marketing from broad retail CAC to fleet B2B and Annual Pass where payback is shorter.",
      "Expand AI deflection on refunds and double-deduction cases to cut support and chargeback outflow.",
    ],
  },
};

const sumv = (a) => a.reduce((s, x) => s + x.v, 0);
const round1 = (n) => Math.round(n * 10) / 10;

function shortHeroKpiLabel(label) {
  if (/toll throughput/i.test(label)) return "Toll GTV";
  if (/net revenue/i.test(label)) return "Net rev";
  if (/active tags/i.test(label)) return "Active tags";
  if (/daily transactions|transactions \(24h\)/i.test(label)) return "Daily txn";
  return label;
}

function heroKpiDeltaTone(delta) {
  if (!delta) return "flat";
  if (/▼|↓|−|-\s*\d|flat|0%/i.test(delta)) return "down";
  if (/▲|↑|\+/i.test(delta)) return "up";
  return "flat";
}

/** Per-KPI micro trend series (fits inside compact card). */
function heroKpiSparkData(label, snap) {
  if (/toll throughput/i.test(label)) return [82, 84, 86, 88, 91, 94];
  if (/net revenue/i.test(label)) return snap.revTrend.slice(-6);
  if (/active tags/i.test(label)) return [78, 79, 80, 81, 83, 84];
  if (/daily transactions|transactions \(24h\)/i.test(label)) return [16.0, 16.4, 17.0, 17.6, 18.0, 18.4];
  return [50, 52, 54, 56, 58, 60];
}

function KpiMicroSpark({ data, color, flexible = false }) {
  const w = flexible ? 120 : 40;
  const h = flexible ? 14 : 12;
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const sx = w / Math.max(1, data.length - 1);
  const y = (v) => h - 1.5 - ((v - min) / span) * (h - 3);
  const pts = data.map((v, i) => `${(i * sx).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <div className={`pf-kpi-micro-spark-wrap${flexible ? " pf-kpi-micro-spark-wrap--flex" : ""}`}>
      <svg
        className="pf-kpi-micro-spark"
        width={flexible ? "100%" : w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ------------------------------- SECTIONS ------------------------------- */
function Header({ snap }) {
  const [activeTopic, setActiveTopic] = useState("positive");
  const topicPanels = sortHeroTopicPanels(HERO_TOPIC_PANELS);
  const aiReadout = HERO_AI_BY_TOPIC[activeTopic] ?? HERO_AI_BY_TOPIC.positive;

  return (
    <div className="pf-panel pf-hero-panel">
      <div className="pf-hero-layout">
        <div className="pf-hero-left">
          <span className="pf-hero-icon" aria-hidden>◷</span>
          <div className="pf-hero-title-stack">
            <div className="pf-hero-title-text">How is the overall FASTag business performing?</div>
            <div className="pf-label pf-hero-subtitle">
              Revenue · cash · consumer vs partner · float · {snap.caption}
            </div>
          </div>
          <div className="pf-hero-metrics">
            <div className="pf-hero-kpis">
              {snap.headline.map((k) => {
                const deltaTone = heroKpiDeltaTone(k.d);
                const sparkData = heroKpiSparkData(k.label, snap);
                return (
                  <div className={`pf-kpi pf-kpi-stat pf-kpi--${k.tone}`} key={k.label}>
                    <span className="pf-kpi-stat-accent" aria-hidden />
                    <div className="pf-kpi-stat-body">
                      <div className="pf-kpi-stat-label-row">
                        <span className="pf-kpi-stat-label" title={k.label}>
                          {shortHeroKpiLabel(k.label)}
                        </span>
                        <span className={`pf-kpi-delta pf-kpi-delta--${deltaTone}`}>{k.d}</span>
                      </div>
                      <div className="pf-kpi-stat-value-row">
                        <span className="pf-kpi-stat-value" style={{ color: k.color }}>
                          {k.v}
                        </span>
                        <KpiMicroSpark data={sparkData} color={k.color} flexible />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`pf-hero-ai pf-hero-ai-expanded ${aiReadout.toneClass}`}
          aria-label={`AI Insights — ${aiReadout.title}`}
        >
          <div className="pf-hero-ai-head">
            <div className="pf-hero-ai-head-main">
              <span className="pf-label pf-hero-ai-title inline-flex items-center gap-1.5">
                <FastTagAiLogo />
                AI Insights
              </span>
              <div
                className="pf-hero-ai-topic-btns"
                role="group"
                aria-label="Performance signal topics"
              >
                {topicPanels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    className={`pf-hero-topic-btn pf-hero-topic-btn-${panel.tone}${
                      activeTopic === panel.id ? " active" : ""
                    }`}
                    aria-pressed={activeTopic === panel.id}
                    onClick={() => setActiveTopic(panel.id)}
                  >
                    {panel.buttonLabel}
                  </button>
                ))}
              </div>
            </div>
            <span className="pf-faint pf-hero-ai-confidence">IA read-out · 87% confidence</span>
          </div>
          <div className="pf-hero-ai-grid">
            {aiReadout.blocks.map((block) => (
              <div key={block.label} className={`pf-hero-ai-card ${block.tone}`}>
                <b>{block.label}</b>
                <ul className="pf-hero-ai-points">
                  {block.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CashFlowAiDrillBody({ isInflow, totalCr }) {
  const flowKey = isInflow ? "inflow" : "outflow";
  const data = CASH_FLOW_AI[flowKey];

  return (
    <div className="pf-cash-ai-drill-body" aria-live="polite">
      <p className="pf-cash-ai-drill-insight">{data.insight}</p>
      <div className="pf-label pf-cash-ai-improve-label">How to improve</div>
      <ul className="pf-cash-ai-improve-list">
        {data.improve.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="pf-faint pf-cash-ai-drill-meta">Based on ₹{totalCr.toFixed(1)}Cr {isInflow ? "inflow" : "outflow"} mix · IA read-out</p>
    </div>
  );
}

function CashFlowAiPopover({ isInflow, totalCr, onClose }) {
  const flowLabel = isInflow ? "Inflow" : "Outflow";
  const toneClass = isInflow ? "pf-cash-ai-popover-inflow" : "pf-cash-ai-popover-outflow";

  return (
    <>
      <button type="button" className="pf-cash-ai-backdrop" aria-label="Close AI insights" onClick={onClose} />
      <div
        id="pf-cash-ai-popover"
        className={`pf-cash-ai-popover ${toneClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-cash-ai-popover-title"
      >
        <div className="pf-cash-ai-popover-head">
          <div className="pf-cash-ai-popover-title-wrap">
            <FastTagAiLogo className="pf-cash-ai-popover-icon shrink-0 text-sm" />
            <h4 id="pf-cash-ai-popover-title" className="pf-cash-ai-popover-title">
              AI · {flowLabel} insights
            </h4>
          </div>
          <button type="button" className="pf-cash-ai-popover-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <CashFlowAiDrillBody isInflow={isInflow} totalCr={totalCr} />
      </div>
    </>
  );
}

function CashFlow({ snap }) {
  const [view, setView] = useState("inflow");
  const [aiOpen, setAiOpen] = useState(false);
  const inTot = sumv(snap.inflows), outTot = sumv(snap.outflows);
  const isInflow = view === "inflow";
  const rows = isInflow ? snap.inflows : snap.outflows;
  const total = isInflow ? inTot : outTot;
  const color = isInflow ? C.green : C.red;
  useEffect(() => {
    if (!aiOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setAiOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiOpen]);

  return (
    <div className="pf-panel pf-cash-panel">
      <InsightSectionHead
        prefix="pf"
        n="1"
        accent={C.teal}
        insight={snap.cashInsight}
        right={
          <div className="pf-contrib-toggle" role="group" aria-label="Cash flow view">
            <button
              type="button"
              className={isInflow ? "active" : ""}
              onClick={() => setView("inflow")}
              aria-pressed={isInflow}
            >
              Inflow
            </button>
            <button
              type="button"
              className={!isInflow ? "active" : ""}
              onClick={() => setView("outflow")}
              aria-pressed={!isInflow}
            >
              Outflow
            </button>
            <button
              type="button"
              className={`pf-toggle-ai${aiOpen ? " active" : ""}`}
              onClick={() => setAiOpen((open) => !open)}
              aria-pressed={aiOpen}
              aria-expanded={aiOpen}
              aria-controls={aiOpen ? "pf-cash-ai-popover" : undefined}
              aria-label={`AI insights for ${isInflow ? "inflow" : "outflow"}`}
              title="AI insights"
            >
              <FastTagAiLogo className="pf-toggle-ai-icon text-sm" />
            </button>
          </div>
        }
      />

      <div className="pf-cash-viz">
        <div className="pf-row" style={{ marginBottom: 8 }}>
          <span className="pf-label" style={{ color }}>
            ● {isInflow ? "Inflows" : "Outflows"} composition
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, color }}>₹{total.toFixed(1)}Cr</span>
        </div>
        <StackedCashStrip rows={rows} colors={isInflow ? CASH_IN_COLORS : CASH_OUT_COLORS} />
        <div className="pf-cash-legend">
          {rows.map((item, i) => {
            const pct = ((item.v / total) * 100).toFixed(0);
            return (
              <div key={item.k} className="pf-cash-legend-item">
                <span className="pf-cash-swatch" style={{ background: (isInflow ? CASH_IN_COLORS : CASH_OUT_COLORS)[i % 8] }} />
                <span className="pf-cash-legend-label">{item.k}</span>
                <span className="pf-cash-legend-val">₹{item.v.toFixed(1)}Cr</span>
                <span className="pf-faint">{pct}%</span>
              </div>
            );
          })}
        </div>
        {!isInflow ? (
          <ChartHint prefix="pf">
            Acquirer share and marketing are the top outflows — still below total inflows.
          </ChartHint>
        ) : null}
      </div>

      {aiOpen ? <CashFlowAiPopover isInflow={isInflow} totalCr={total} onClose={() => setAiOpen(false)} /> : null}
    </div>
  );
}

function Contribution({ snap, cases = [] }) {
  const [view, setView] = useState("consumer");
  const cTot = sumv(snap.consumer), pTot = sumv(snap.partner), all = cTot + pTot;
  const cPct = Math.round((cTot / all) * 100), pPct = 100 - cPct;

  const isConsumer = view === "consumer";
  const rows = isConsumer ? snap.consumer : snap.partner;
  const total = isConsumer ? cTot : pTot;
  const sharePct = isConsumer ? cPct : pPct;
  const accent = isConsumer ? C.green : C.amber;
  const title = isConsumer ? "Consumer" : "Partner";

  return (
    <div className="pf-panel pf-contrib-panel">
      <InsightSectionHead
        prefix="pf"
        n="2"
        accent={C.violet}
        insight={snap.contribInsight}
        className="pf-contrib-head"
        right={
          <div className="pf-contrib-toggle" role="group" aria-label="Revenue contribution view">
            <button
              type="button"
              className={isConsumer ? "active" : ""}
              onClick={() => setView("consumer")}
              aria-pressed={isConsumer}
            >
              Consumer
            </button>
            <button
              type="button"
              className={!isConsumer ? "active" : ""}
              onClick={() => setView("partner")}
              aria-pressed={!isConsumer}
            >
              Partner
            </button>
          </div>
        }
      />

      <div className="pf-contrib-table-wrap">
        <table className="pf-contrib-table">
          <thead>
            <tr>
              <th className="pf-th">Revenue line</th>
              <th className="pf-th pf-contrib-th-num">Amount (₹Cr)</th>
              <th className="pf-th pf-contrib-th-num">MoM</th>
              <th className="pf-th">Volume / basis</th>
              <th className="pf-th pf-contrib-th-num">% of {title}</th>
              <th className="pf-th pf-contrib-th-num">% of net</th>
            </tr>
          </thead>
          <tbody>
            {[...rows].sort((a, b) => b.v - a.v).map((r) => {
              const segPct = ((r.v / total) * 100).toFixed(0);
              const netPct = ((r.v / all) * 100).toFixed(0);
              const momUp = r.mom?.startsWith("+");
              const momDown = r.mom?.startsWith("-");
              return (
                <tr key={r.k}>
                  <td className="pf-td pf-contrib-line-cell">
                    <span className="pf-contrib-swatch" style={{ background: r.color }} aria-hidden />
                    <span className="pf-contrib-line-text">
                      <span className="pf-contrib-line-name">{r.k}</span>
                      {r.sub ? <span className="pf-contrib-line-sub">{r.sub}</span> : null}
                    </span>
                  </td>
                  <td className="pf-td pf-contrib-td-num">₹{r.v.toFixed(1)}</td>
                  <td
                    className={`pf-td pf-contrib-td-num pf-contrib-mom${
                      momUp ? " pf-contrib-mom-up" : momDown ? " pf-contrib-mom-down" : ""
                    }`}
                  >
                    {r.mom ?? "—"}
                  </td>
                  <td className="pf-td pf-contrib-td-basis">{r.basis ?? "—"}</td>
                  <td className="pf-td pf-contrib-td-num">{segPct}%</td>
                  <td className="pf-td pf-contrib-td-num">{netPct}%</td>
                </tr>
              );
            })}
            <tr className="pf-contrib-total-row">
              <td className="pf-td pf-contrib-line-cell">
                <strong>{title} total</strong>
              </td>
              <td className="pf-td pf-contrib-td-num">
                <strong style={{ color: accent }}>₹{total.toFixed(1)}</strong>
              </td>
              <td className="pf-td pf-contrib-td-num">—</td>
              <td className="pf-td pf-contrib-td-basis">
                <span className="pf-faint">{rows.length} revenue lines</span>
              </td>
              <td className="pf-td pf-contrib-td-num">
                <strong>100%</strong>
              </td>
              <td className="pf-td pf-contrib-td-num">
                <strong>{sharePct}%</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RegionalPerformance({ cases = [] }) {
  return (
    <div className="pf-panel pf-region-panel">
      <FastTagPerformanceRegionSection cases={cases} compact />
    </div>
  );
}

function HobSettlementPanel({ snap }) {
  const data = snap.hobSettlement;

  return (
    <div className="pf-panel pf-hob-settle-panel">
      <InsightSectionHead
        prefix="pf"
        n="4"
        accent={C.amber}
        insight={data.insight}
        right={
          <span className="pf-badge" style={{ color: C.amber, background: `${C.amber}14`, border: `1px solid ${C.amber}40` }}>
            {data.badge}
          </span>
        }
      />
      <FastTagHobSettlementPanel data={data} />
    </div>
  );
}

/* --------------------------------- ROOT --------------------------------- */
export default function FastagPerformanceDrilldown({ onBack = () => {}, cases = [] }) {
  const [period, setPeriod] = useState("month");
  const snap = useMemo(() => buildPerformancePeriodSnapshot(period), [period]);

  return (
    <div className="pf-root">
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />

      <DrillCrumbBar
        prefix="pf"
        color={C.violet}
        onBack={onBack}
        periodFilter={
          <DrillPeriodFilter
            prefix="pf"
            value={period}
            onChange={setPeriod}
            options={DRILL_PERIOD_OPTIONS}
          />
        }
      >
        ⚡ FASTag · overall business performance
      </DrillCrumbBar>

      <div className="pf-stack">
        <Header snap={snap} />

        <div className="pf-grid2 pf-grid2-cash-region">
          <div className="pf-grid2-col-stack">
            <CashFlow snap={snap} />
            <RegionalPerformance cases={cases} />
          </div>
          <div className="pf-grid2-col-stack">
            <Contribution snap={snap} cases={cases} />
            <HobSettlementPanel snap={snap} />
          </div>
        </div>

      </div>
    </div>
  );
}
