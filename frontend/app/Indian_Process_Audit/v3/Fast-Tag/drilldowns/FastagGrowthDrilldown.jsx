import React, { useMemo, useState } from "react";
import { FastTagAiLogo } from "@/app/Indian_Process_Audit/_shared/FastTagAiLogo";
import { DrillOpsKpiGrid } from './fastTagDrillOpsKpi';
import { growthTheme } from './fastTagDrilldownTheme';
import {
  DrillCrumbBar,
  DrillPeriodFilter,
  InsightSectionHead,
  sortHeroTopicPanels,
} from './fastTagDrilldownUi';
import { DRILL_PERIOD_OPTIONS } from './fastTagDrillPeriod';
import { buildGrowthPeriodSnapshot } from './fastTagGrowthPeriodData';
import {
  GrowthChannelMixChart,
  GrowthDriversPassChart,
  GrowthLifecycleChart,
  GrowthRetentionChart,
  GrowthTransactionChart,
} from './fastTagGrowthCharts';

/**
 * FASTag — Head of Business
 * Drill-down page for the card: "What is driving FASTag growth?"
 *
 * Research-grounded framing (India NETC FASTag, late 2025 / early 2026):
 *   - Penetration is near-saturation (98%+ of NH toll is electronic), so growth
 *     has shifted from basic adoption to: the Annual Pass, reactivating the large
 *     dormant base (~5.9cr active of ~11.9cr issued), deepening usage/monetization,
 *     channel/issuer mix, and forward levers (GNSS free-flow, non-toll use cases).
 *
 * What a Head of Business looks for here (growth-owner lens):
 *   1. Growth score + north-star trend + YoY drivers
 *   2. Acquisition channel / issuer mix
 *   3. FASTag onboarding lifecycle (NETC stages)
 *   4. Transaction growth (actual usage)
 *   5. Retention growth (sustainability)
 *
 * Figures are illustrative at an issuer-business scale; national context shown where noted.
 * Self-contained: inline styling + injected <style>. Drop into any React app.
 */

const { C, styleTag } = growthTheme();

/* --------------------------------- DATA --------------------------------- */
// 2 — FASTag onboarding stages (issuer journey; monthly cohort)
const FASTAG_LIFECYCLE_STAGES = [
  {
    stage: "Eligibility",
    desc: "Vehicle type, issuer policy, and customer consent captured.",
    cohort: "1.84L",
    conv: "100%",
    growth: "+8% YoY",
    color: C.blue,
  },
  {
    stage: "OTP",
    desc: "Registered mobile verified; session bound to customer.",
    cohort: "1.77L",
    conv: "96%",
    growth: "−4 pts",
    color: C.teal,
  },
  {
    stage: "KYC",
    desc: "PAN, CKYCR pull, address proof within RBI KYC norms.",
    cohort: "1.64L",
    conv: "89%",
    growth: "−7 pts",
    color: C.green,
  },
  {
    stage: "Mapper",
    desc: "NPCI OV1T check; NETC mapper updated or conflict escalated.",
    cohort: "1.55L",
    conv: "84%",
    growth: "−5 pts",
    color: C.teal,
  },
  {
    stage: "Wallet",
    desc: "Minimum balance loaded via approved payment rail.",
    cohort: "1.38L",
    conv: "75%",
    growth: "−9 pts",
    color: C.amber,
    isBottleneck: true,
    note: "Biggest drop after KYC",
  },
  {
    stage: "Issuance",
    desc: "EPC generated; tag ID linked to wallet and VRN.",
    cohort: "1.32L",
    conv: "72%",
    growth: "−3 pts",
    color: C.blue,
  },
  {
    stage: "Fitment",
    desc: "Installer attestation; RFID read test recorded.",
    cohort: "1.27L",
    conv: "69%",
    growth: "−3 pts",
    color: C.green,
  },
  {
    stage: "Activation",
    desc: "Tag activated on NETC; settlement profile live; disputes logged.",
    cohort: "1.21L",
    conv: "66%",
    growth: "↑4 pts E2E",
    color: C.green,
    note: "Live on NETC",
  },
];

// 2 — issuance channel mix & growth (monthly new tags)
const CHANNELS = [
  {
    ch: "App / digital (My FASTag)",
    share: 24,
    volume: "44K",
    mom: "+12%",
    yoy: "+21%",
    shareChg: "+5 pts",
    color: C.teal,
    isFast: true,
    trend: [19, 21, 22, 23, 23, 24],
    note: "Fastest share gain",
  },
  {
    ch: "Co-brand / partner",
    share: 7,
    volume: "13K",
    mom: "+18%",
    yoy: "+34%",
    shareChg: "+2 pts",
    color: C.violet,
    isFast: true,
    trend: [5, 5, 6, 6, 7, 7],
    note: "Highest YoY velocity",
  },
  {
    ch: "Bank branches",
    share: 34,
    volume: "63K",
    mom: "+3%",
    yoy: "+8%",
    shareChg: "+2 pts",
    color: C.green,
    trend: [36, 37, 38, 38, 39, 34],
  },
  {
    ch: "PoS — plaza / fuel",
    share: 16,
    volume: "29K",
    mom: "+4%",
    yoy: "+5%",
    shareChg: "+1 pt",
    color: C.blue,
    trend: [18, 18, 19, 19, 20, 16],
  },
  {
    ch: "Dealer / agent network",
    share: 12,
    volume: "22K",
    mom: "+6%",
    yoy: "+11%",
    shareChg: "+1 pt",
    color: C.amber,
    trend: [10, 10, 11, 11, 12, 12],
  },
  {
    ch: "Fleet B2B portal",
    share: 5,
    volume: "9K",
    mom: "+14%",
    yoy: "+22%",
    shareChg: "+1 pt",
    color: "#4f46e5",
    trend: [3, 4, 4, 4, 5, 5],
  },
  {
    ch: "e-commerce / marketplace",
    share: 2,
    volume: "4K",
    mom: "+9%",
    yoy: "+28%",
    shareChg: "+1 pt",
    color: C.orange,
    trend: [1, 1, 1, 2, 2, 2],
  },
];

const GROWTH_TOPIC_PANELS = [
  {
    id: "positive",
    buttonLabel: "Positives",
    title: "Positives",
    tone: "positive",
    items: [
      { label: "Annual Pass", detail: "+6.5% YoY volume contribution; 31% attach on new personal tags." },
      { label: "New acquisition", detail: "+7.2% from new tags and post-Paytm re-issuance flows." },
      { label: "Usage depth", detail: "+3.0% from more trips per active tag and auto-recharge." },
    ],
  },
  {
    id: "negative",
    buttonLabel: "Negative",
    title: "Negatives",
    tone: "negative",
    items: [
      { label: "Dormant base", detail: "16% of tags idle — +2.1% recovery opportunity if reactivated." },
      { label: "Lifecycle drop", detail: "Biggest leak at Wallet after KYC (−9 pts); eligibility→activation 66% E2E." },
      { label: "Commercial mix", detail: "Fleet segment 34% share but Annual Pass variant still limited." },
    ],
  },
  {
    id: "critical",
    buttonLabel: "Critical",
    title: "Critical",
    tone: "critical",
    items: [
      { label: "GNSS pilot", detail: "Free-flow tolling readiness on 2 corridors — throughput upside." },
      { label: "Non-toll", detail: "Parking, fuel, mall plazas — +44% non-toll revenue run-rate." },
      { label: "Co-brand", detail: "Partner channel +34% — fastest-growing issuance route." },
    ],
  },
];

/** AI read-out blocks keyed to Positives / Negative / Critical topic buttons. */
const HERO_AI_BY_TOPIC = {
  positive: {
    title: "Positives",
    toneClass: "gd-hero-ai-positive",
    blocks: [
      {
        tone: "ok",
        label: "Annual Pass",
        points: [
          "+6.5% YoY volume contribution; 31% attach on new personal tags",
          "Launched Aug'25 — strongest mix lever this quarter",
          "Bundle with auto-recharge on top highway corridors",
        ],
      },
      {
        tone: "ok",
        label: "Acquisition",
        points: [
          "+7.2% from new tags and post-Paytm re-issuance flows",
          "Digital channel +21% — fastest share gain",
          "Co-brand +34% YoY — highest velocity route",
        ],
      },
      {
        tone: "info",
        label: "Usage depth",
        points: [
          "+3.0% from more trips per active tag and auto-recharge",
          "Txns / active tag at 14.2 (+6%)",
          "Toll volume index +20% YoY with NH near-saturation",
        ],
      },
    ],
  },
  negative: {
    title: "Negatives",
    toneClass: "gd-hero-ai-negative",
    blocks: [
      {
        tone: "warn",
        label: "Signal",
        points: [
          "NH penetration near-saturation — growth is mix and depth, not basic adoption",
          "Annual Pass and new tags explain most of the +20% YoY lift",
          "Volume index steady; gap is wallet load and dormancy recovery",
        ],
      },
      {
        tone: "warn",
        label: "Dormant base",
        points: [
          "16% of tags idle — largest unused lever this quarter",
          "+2.1% recovery opportunity if reactivated",
          "Bigger than any single acquisition channel",
        ],
      },
      {
        tone: "warn",
        label: "Lifecycle",
        points: [
          "Biggest leak at Wallet after KYC (−9 pts)",
          "Eligibility→activation 66% E2E",
          "Fleet segment 34% share but Annual Pass variant still limited",
        ],
      },
    ],
  },
  critical: {
    title: "Critical",
    toneClass: "gd-hero-ai-critical",
    blocks: [
      {
        tone: "warn",
        label: "GNSS",
        points: [
          "Free-flow tolling readiness on 2 corridors — throughput upside",
          "Capex and operating model shift vs plaza settlement",
          "Lock partner terms before corridor go-live",
        ],
      },
      {
        tone: "info",
        label: "Non-toll",
        points: [
          "Parking, fuel, mall plazas — +44% non-toll revenue run-rate",
          "Cross-sell where take-rate beats pure highway MDR",
          "Attach on corridors with rising digital share",
        ],
      },
      {
        tone: "info",
        label: "Focus",
        points: [
          "Push Annual Pass attach at issuance",
          "Auto-recharge on corridors where digital share rises fastest",
          "Partner channel +34% — protect co-brand referral tiers",
        ],
      },
    ],
  },
};

function shortHeroKpiLabel(label) {
  if (/toll volume/i.test(label)) return "Toll index";
  if (/new tags/i.test(label)) return "New tags";
  if (/annual pass/i.test(label)) return "Pass attach";
  if (/digital channel/i.test(label)) return "Digital";
  if (/txns \/ active/i.test(label)) return "Txns/tag";
  if (/non-toll/i.test(label)) return "Non-toll";
  return label;
}

function scaleLifecycleCohort(cohort, scale) {
  const m = cohort.match(/^([\d.]+)(L|K)$/);
  if (!m) return cohort;
  const n = Math.round(parseFloat(m[1]) * scale * 100) / 100;
  return `${n}${m[2]}`;
}

function scaleLifecycleStages(stages, scale) {
  if (scale >= 0.99) return stages;
  return stages.map((s) => ({
    ...s,
    cohort: scaleLifecycleCohort(s.cohort, scale),
  }));
}

/* ------------------------------- SECTIONS ------------------------------- */
function Header({ snap }) {
  const [activeTopic, setActiveTopic] = useState("positive");
  const topicPanels = sortHeroTopicPanels(GROWTH_TOPIC_PANELS);
  const aiReadout = HERO_AI_BY_TOPIC[activeTopic] ?? HERO_AI_BY_TOPIC.positive;

  return (
    <div className="gd-panel gd-hero-panel">
      <div className="gd-hero-layout">
        <div className="gd-hero-left">
          <div className="gd-hero-metrics">
            <DrillOpsKpiGrid prefix="gd" kpis={snap.headline} shortLabel={shortHeroKpiLabel} />
          </div>
        </div>

        <div
          className={`gd-hero-ai gd-hero-ai-expanded ${aiReadout.toneClass}`}
          aria-label={`AI Insights — ${aiReadout.title}`}
        >
          <div className="gd-hero-ai-head">
            <div className="gd-hero-ai-head-main">
              <span className="gd-label gd-hero-ai-title inline-flex items-center gap-1.5">
                <FastTagAiLogo />
                AI Insights
              </span>
              <div
                className="gd-hero-ai-topic-btns"
                role="group"
                aria-label="Growth signal topics"
              >
                {topicPanels.map((panel) => (
                  <button
                    key={panel.id}
                    type="button"
                    className={`gd-hero-topic-btn gd-hero-topic-btn-${panel.tone}${
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
            <span className="gd-faint gd-hero-ai-confidence">IA read-out · 87% confidence</span>
          </div>
          <div className="gd-hero-ai-grid">
            {aiReadout.blocks.map((block) => (
              <div key={block.label} className={`gd-hero-ai-card ${block.tone}`}>
                <b>{block.label}</b>
                <ul className="gd-hero-ai-points">
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

function DriversAndPass({ snap }) {
  return (
    <div className="gd-panel gd-panel--highlight gd-panel--drivers">
      <InsightSectionHead
        prefix="gd"
        n="1"
        accent={C.teal}
        insight={snap.driversInsight}
        right={
          <>
            <span className="gd-badge" style={{ color: C.teal, background: `${C.teal}14`, border: `1px solid ${C.teal}40` }}>
              Hot lever
            </span>
            <span className="gd-faint" style={{ fontSize: 10, marginLeft: 8 }}>
              {snap.driversTotalLabel}
            </span>
          </>
        }
      />
      <GrowthDriversPassChart drivers={snap.drivers} />
    </div>
  );
}

function Funnel({ snap }) {
  const stages = useMemo(
    () => scaleLifecycleStages(FASTAG_LIFECYCLE_STAGES, snap.lifecycleScale),
    [snap.lifecycleScale],
  );
  return (
    <div className="gd-panel">
      <InsightSectionHead prefix="gd" n="3" accent={C.green} insight={snap.funnelInsight} />
      <GrowthLifecycleChart stages={stages} />
    </div>
  );
}

function Channels({ snap }) {
  return (
    <div className="gd-panel">
      <InsightSectionHead prefix="gd" n="2" accent={C.teal} insight={snap.channelsInsight} />
      <GrowthChannelMixChart channels={CHANNELS} />
    </div>
  );
}

function TransactionGrowth({ snap }) {
  return (
    <div className="gd-panel">
      <InsightSectionHead prefix="gd" n="4" accent={C.blue} insight={snap.txnInsight} />
      <GrowthTransactionChart monthly={snap.transactionMonthly} />
    </div>
  );
}

function RetentionGrowth({ snap }) {
  return (
    <div className="gd-panel">
      <InsightSectionHead prefix="gd" n="5" accent={C.amber} insight={snap.retentionInsight} />
      <GrowthRetentionChart monthly={snap.retentionMonthly} />
    </div>
  );
}

/* --------------------------------- ROOT --------------------------------- */
export default function FastagGrowthDrilldown({ onBack = () => {} }) {
  const [period, setPeriod] = useState("month");
  const snap = useMemo(() => buildGrowthPeriodSnapshot(period), [period]);

  return (
    <div className="gd-root">
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />

      <DrillCrumbBar
        prefix="gd"
        onBack={onBack}
        periodFilter={
          <DrillPeriodFilter
            prefix="gd"
            value={period}
            onChange={setPeriod}
            options={DRILL_PERIOD_OPTIONS}
          />
        }
      >
        <span className="gd-crumb-icon" aria-hidden>
          ◷
        </span>
        <span className="gd-crumb-text">What is driving FASTag growth?</span>
      </DrillCrumbBar>

      <div className="gd-stack">
        <Header snap={snap} />

        <div className="gd-grid2">
          <div className="gd-col-stack">
            <DriversAndPass snap={snap} />
            <Channels snap={snap} />
            <TransactionGrowth snap={snap} />
          </div>
          <div className="gd-col-stack">
            <Funnel snap={snap} />
            <RetentionGrowth snap={snap} />
          </div>
        </div>
      </div>
    </div>
  );
}
