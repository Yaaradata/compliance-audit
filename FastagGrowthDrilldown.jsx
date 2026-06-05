import React from "react";

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
 *   1. Growth score + north-star trend + headline driver
 *   2. Growth-driver decomposition  (the centerpiece: what is actually driving growth)
 *   3. Acquisition funnel + CAC
 *   4. Acquisition channel / issuer mix
 *   5. Annual Pass spotlight (the hot lever)
 *   6. Usage & monetization depth (LTV proxy)
 *   7. Segment & geographic growth
 *   8. Forward growth levers + actions
 *
 * Figures are illustrative at an issuer-business scale; national context shown where noted.
 * Self-contained: inline styling + injected <style>. Drop into any React app.
 */

/* ----------------------------- THEME TOKENS ----------------------------- */
const C = {
  bg: "#0a0a0c",
  panel: "#121215",
  panelAlt: "#171719",
  card: "#141417",
  border: "rgba(255,255,255,0.07)",
  borderSoft: "rgba(255,255,255,0.04)",
  text: "#f4f4f6",
  textDim: "#9a9aa3",
  textFaint: "#6b6b73",
  red: "#ff4d52",
  amber: "#f5a623",
  green: "#34d399",
  blue: "#4aa8ff",
  teal: "#2dd4bf",
};

/* ------------------------------ STYLE BLOCK ----------------------------- */
const styleTag = `
  .gd-root *{box-sizing:border-box;}
  .gd-root{
    background:radial-gradient(1200px 600px at 15% -10%, rgba(52,211,153,0.06), transparent 60%),
               radial-gradient(1000px 500px at 92% 0%, rgba(74,168,255,0.05), transparent 55%),
               ${C.bg};
    color:${C.text}; font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;
    min-height:100vh; padding:16px 22px 44px; letter-spacing:.1px;
  }
  .gd-panel{ background:linear-gradient(180deg, ${C.panelAlt}, ${C.panel});
    border:1px solid ${C.border}; border-radius:16px; }
  .gd-card{ background:linear-gradient(180deg, ${C.card}, #0f0f12);
    border:1px solid ${C.border}; border-radius:14px; padding:16px 18px; }
  .gd-faint{ color:${C.textFaint}; } .gd-dim{ color:${C.textDim}; }
  .gd-label{ font-size:10px; letter-spacing:1.4px; text-transform:uppercase; color:${C.textFaint}; }
  .gd-row{ display:flex; justify-content:space-between; align-items:center; }
  .gd-badge{ font-size:9.5px; font-weight:700; letter-spacing:.6px; padding:4px 8px; border-radius:6px;
    display:inline-flex; align-items:center; gap:5px; }
  .gd-back{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; color:${C.textDim};
    font-size:12px; padding:6px 12px; border-radius:8px; border:1px solid ${C.border};
    background:rgba(255,255,255,0.02); transition:.15s; }
  .gd-back:hover{ color:${C.text}; border-color:rgba(255,255,255,0.18); }
  .gd-sechead{ display:flex; align-items:center; gap:10px; margin:0 0 14px; }
  .gd-sechead .n{ width:22px; height:22px; border-radius:7px; display:grid; place-items:center;
    font-size:11px; font-weight:700; background:rgba(52,211,153,0.14); color:${C.green}; }
  .gd-sechead h3{ margin:0; font-size:14px; font-weight:600; }
  .gd-th{ font-size:10px; letter-spacing:.8px; text-transform:uppercase; color:${C.textFaint};
    text-align:left; padding:0 10px 9px; font-weight:600; }
  .gd-td{ font-size:12.5px; padding:11px 10px; border-top:1px solid ${C.borderSoft}; vertical-align:middle; }
  .gd-up{ color:${C.green}; font-weight:600; } .gd-down{ color:${C.red}; font-weight:600; }
  .gd-track{ height:8px; border-radius:5px; background:rgba(255,255,255,0.06); overflow:hidden; }
  .gd-fill{ height:100%; border-radius:5px; }
  .gd-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .gd-grid3{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  .gd-grid4{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .gd-kpi{ padding:13px 15px; border:1px solid ${C.borderSoft}; border-radius:11px; }
  .gd-kpi .v{ font-size:23px; font-weight:700; line-height:1; }
  .gd-aibox{ border:1px solid ${C.borderSoft}; border-radius:11px; padding:12px 13px 12px 15px;
    background:linear-gradient(180deg, rgba(255,255,255,0.015), transparent); position:relative; }
  .gd-aibox:before{ content:""; position:absolute; left:0; top:8px; bottom:8px; width:2px; border-radius:2px;
    background:linear-gradient(180deg, var(--ac, ${C.green}), transparent); }
  @media(max-width:1100px){ .gd-grid2{grid-template-columns:1fr;} .gd-grid3{grid-template-columns:1fr;} .gd-grid4{grid-template-columns:repeat(2,1fr);} }
`;

/* ------------------------------- HELPERS -------------------------------- */
function TrendLine({ data, color = C.green, w = 760, h = 90 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const sx = w / (data.length - 1);
  const y = (v) => h - 10 - ((v - min) / (max - min || 1)) * (h - 24);
  const pts = data.map((v, i) => [i * sx, y(v)]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cxm = (x0 + x1) / 2;
    d += ` C ${cxm} ${y0}, ${cxm} ${y1}, ${x1} ${y1}`;
  }
  const id = "gl" + color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" />
      {pts.map(([x, yy], i) => i === pts.length - 1 && <circle key={i} cx={x - 1} cy={yy} r="3.5" fill={color} />)}
    </svg>
  );
}

function SectionHead({ n, title, right, color = C.green }) {
  return (
    <div className="gd-row" style={{ marginBottom: 12 }}>
      <div className="gd-sechead" style={{ margin: 0 }}>
        <span className="n" style={{ background: `${color}24`, color }}>{n}</span>
        <h3>{title}</h3>
      </div>
      {right}
    </div>
  );
}

/* --------------------------------- DATA --------------------------------- */
// North-star: monthly toll-transaction volume index (trending up ~+20% YoY)
const NORTHSTAR = [78, 80, 83, 82, 86, 88, 91, 90, 94, 97, 100, 104];

// 2 — growth-driver decomposition (contribution to +20% YoY revenue growth)
const DRIVERS = [
  { name: "New tag acquisition", val: 7.2, color: C.green, note: "new-vehicle + post-Paytm re-issuance" },
  { name: "Annual Pass uptake", val: 6.5, color: C.teal, note: "launched Aug'25, 31% attach on new personal tags" },
  { name: "Usage depth (txns / tag)", val: 3.0, color: C.blue, note: "more trips per active tag" },
  { name: "Dormant-tag reactivation", val: 2.1, color: C.amber, note: "16% of base dormant — recovery" },
  { name: "Non-toll cross-sell", val: 1.2, color: "#a78bfa", note: "parking, fuel, mall plazas" },
];

// 3 — acquisition funnel (monthly, issuer scale)
const FUNNEL = [
  { stage: "New tags issued", v: 184000, pct: 100 },
  { stage: "KYC activated", v: 156000, pct: 85 },
  { stage: "First recharge", v: 138000, pct: 75 },
  { stage: "First toll txn (7d)", v: 121000, pct: 66 },
];

// 4 — acquisition channel / issuer mix
const CHANNELS = [
  { ch: "Bank branches", share: 42, d: "+8%", color: C.green },
  { ch: "App / digital (My FASTag)", share: 29, d: "+21%", color: C.teal },
  { ch: "PoS — plaza / fuel station", share: 21, d: "+5%", color: C.blue },
  { ch: "Co-brand / partner", share: 8, d: "+34%", color: "#a78bfa" },
];

// 6 — usage & monetization
const USAGE = [
  { label: "Txns / Active Tag (mo)", v: "14.2", d: "+6%" },
  { label: "Recharge Frequency", v: "2.3/mo", d: "+9%" },
  { label: "Avg Wallet Balance", v: "₹612", d: "+4%" },
  { label: "Auto-Recharge Enrolled", v: "38%", d: "+31%" },
  { label: "Dormant Tags", v: "16%", d: "-2 pts" },
  { label: "Non-Toll Revenue", v: "₹3.4Cr", d: "+44%" },
];

// 7 — segment + geo
const SEGMENTS = [
  { seg: "Personal vehicles", share: 66, d: "+18%", color: C.green },
  { seg: "Commercial / fleet", share: 34, d: "+12%", color: C.blue },
];
const GEO = [
  { st: "Maharashtra", g: "+24%" }, { st: "Uttar Pradesh", g: "+21%" },
  { st: "Gujarat", g: "+19%" }, { st: "Tamil Nadu", g: "+17%" }, { st: "Karnataka", g: "+15%" },
];

// 8 — forward levers + actions
const LEVERS = [
  { act: "Expand Annual Pass attach at issuance (target 45% on new personal tags)", owner: "Growth / Product", impact: "+₹40Cr ARR", sev: "High" },
  { act: "Reactivation campaign on 16% dormant base (auto-recharge + waiver)", owner: "CRM / Lifecycle", impact: "+2.1% volume", sev: "High" },
  { act: "Annual Pass variant for commercial fleets / corridors", owner: "B2B Sales", impact: "Untapped 34% segment", sev: "Med" },
  { act: "GNSS / free-flow tolling pilot readiness on 2 corridors", owner: "Tech / NHAI liaison", impact: "Future-proof + throughput", sev: "Med" },
  { act: "Scale non-toll use cases — parking, fuel, mall plazas", owner: "Partnerships", impact: "+44% non-toll rev", sev: "Med" },
];

const sev = (s) => (s === "High" ? C.green : s === "Med" ? C.amber : C.blue);
const fmt = (n) => n.toLocaleString("en-IN");

/* ------------------------------- SECTIONS ------------------------------- */
function Header({ onBack }) {
  return (
    <div className="gd-panel" style={{ padding: "20px 22px", marginBottom: 18 }}>
      <div className="gd-row" style={{ marginBottom: 14 }}>
        <div className="gd-row" style={{ justifyContent: "flex-start", gap: 12 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
            background: "rgba(52,211,153,0.14)", color: C.green, fontSize: 15 }}>↗</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>What is driving FASTag growth?</div>
            <div className="gd-label" style={{ marginTop: 4 }}>Acquisition · Annual Pass · Usage depth · Forward levers</div>
          </div>
        </div>
        <div className="gd-back" onClick={onBack}>‹ Back to board</div>
      </div>

      <div className="gd-row" style={{ alignItems: "flex-end" }}>
        <div style={{ minWidth: 170 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}>66</div>
          <div style={{ color: C.green, fontSize: 13, fontWeight: 600, marginTop: 6 }}>▲ 4 pts WoW</div>
          <div className="gd-faint" style={{ fontSize: 10.5, marginTop: 4 }}>Growth index · toll volume +20% YoY</div>
        </div>
        <div style={{ flex: 1, marginLeft: 24 }}>
          <div className="gd-label" style={{ marginBottom: 4 }}>North-star · monthly toll-transaction volume (indexed)</div>
          <TrendLine data={NORTHSTAR} />
        </div>
      </div>

      <div className="gd-aibox" style={{ marginTop: 16 }}>
        <div className="gd-label" style={{ color: C.green, marginBottom: 6, display: "flex", gap: 6, alignItems: "center" }}>
          <span>▦</span> WHAT'S DRIVING IT
        </div>
        <div className="gd-dim" style={{ fontSize: 12, lineHeight: 1.55 }}>
          With NH penetration near-saturation (98%+ electronic), growth is now led by the
          <span style={{ color: C.text }}> Annual Pass</span> and deeper usage, not basic adoption. New acquisition
          and Annual Pass uptake together contribute ~14 of the 20 points of YoY volume growth; reactivating the
          16% dormant tag base is the largest untapped lever.
        </div>
      </div>
    </div>
  );
}

function DriverDecomp() {
  const maxV = Math.max(...DRIVERS.map((d) => d.val));
  const total = DRIVERS.reduce((s, d) => s + d.val, 0);
  return (
    <div className="gd-panel" style={{ padding: "18px 20px", marginBottom: 18 }}>
      <SectionHead n="1" title="Growth-driver decomposition"
        right={<span className="gd-faint" style={{ fontSize: 10.5 }}>contribution to +{total.toFixed(0)}% YoY volume</span>} />
      {DRIVERS.map((d, i) => (
        <div key={i} style={{ marginBottom: 15 }}>
          <div className="gd-row" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12.5 }}>{d.name}
              <span className="gd-faint" style={{ fontSize: 10.5, marginLeft: 8 }}>{d.note}</span>
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: d.color }}>+{d.val}%</span>
          </div>
          <div className="gd-track"><div className="gd-fill" style={{ width: `${(d.val / maxV) * 100}%`, background: d.color }} /></div>
        </div>
      ))}
    </div>
  );
}

function Funnel() {
  return (
    <div className="gd-card">
      <div className="gd-sechead"><span className="n">2</span><h3>Acquisition funnel + CAC</h3></div>
      {FUNNEL.map((f, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div className="gd-row" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>{f.stage}</span>
            <span style={{ fontSize: 11.5 }}><b>{fmt(f.v)}</b> <span className="gd-faint">· {f.pct}%</span></span>
          </div>
          <div className="gd-track" style={{ height: 22, borderRadius: 7 }}>
            <div className="gd-fill" style={{ width: `${f.pct}%`, borderRadius: 7,
              background: `linear-gradient(90deg, ${C.green}, ${C.teal})`, opacity: 0.35 + (f.pct / 100) * 0.6 }} />
          </div>
        </div>
      ))}
      <div className="gd-row" style={{ marginTop: 14 }}>
        <div className="gd-kpi" style={{ flex: 1, marginRight: 8 }}>
          <div className="gd-label">CAC / Active Tag</div>
          <div className="v" style={{ marginTop: 6 }}>₹142</div>
          <div className="gd-up" style={{ fontSize: 10.5, marginTop: 3 }}>↓ 7% (improving)</div>
        </div>
        <div className="gd-kpi" style={{ flex: 1, marginLeft: 8 }}>
          <div className="gd-label">Activation → Usage</div>
          <div className="v" style={{ marginTop: 6 }}>66%</div>
          <div className="gd-up" style={{ fontSize: 10.5, marginTop: 3 }}>↑ 4 pts</div>
        </div>
      </div>
    </div>
  );
}

function Channels() {
  return (
    <div className="gd-card">
      <div className="gd-sechead"><span className="n">3</span><h3>Acquisition channel / issuer mix</h3></div>
      {CHANNELS.map((c, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div className="gd-row" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>{c.ch}</span>
            <span style={{ fontSize: 11.5 }}><b>{c.share}%</b> <span className="gd-up" style={{ fontSize: 10.5, marginLeft: 4 }}>{c.d}</span></span>
          </div>
          <div className="gd-track"><div className="gd-fill" style={{ width: `${c.share * 2}%`, background: c.color }} /></div>
        </div>
      ))}
      <div className="gd-faint" style={{ fontSize: 10.5, marginTop: 2 }}>
        Digital + co-brand growing fastest; bank-neutral NHAI tag dominates volume.
      </div>
    </div>
  );
}

function AnnualPass() {
  const kpis = [
    { label: "Passes Activated (ours)", v: "1.9L", sub: "₹3,000 / 200 trips" },
    { label: "Attach on New Personal Tags", v: "31%", sub: "↑ from 12% at launch" },
    { label: "Txns Enabled", v: "86L", sub: "non-stop, no balance check" },
    { label: "Pass Revenue", v: "₹57Cr", sub: "upfront, low servicing" },
  ];
  return (
    <div className="gd-panel" style={{ padding: "18px 20px", marginBottom: 18, borderColor: "rgba(45,212,191,0.25)" }}>
      <SectionHead n="4" color={C.teal} title="Annual Pass spotlight — the breakout lever"
        right={<span className="gd-badge" style={{ color: C.teal, background: `${C.teal}1f`, border: `1px solid ${C.teal}55` }}>HOT LEVER</span>} />
      <div className="gd-grid4">
        {kpis.map((k, i) => (
          <div className="gd-kpi" key={i} style={{ borderColor: "rgba(45,212,191,0.18)" }}>
            <div className="gd-label">{k.label}</div>
            <div className="v" style={{ marginTop: 7, color: C.teal }}>{k.v}</div>
            <div className="gd-faint" style={{ fontSize: 10, marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="gd-dim" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 13 }}>
        National backdrop: ~42 lakh passes activated since Aug 2025, enabling ~19 crore transactions; ~25% of
        non-commercial vehicles now transact via the pass — a large, still-early adoption curve to capture share in.
      </div>
    </div>
  );
}

function Usage() {
  return (
    <div className="gd-card">
      <div className="gd-sechead"><span className="n">5</span><h3>Usage &amp; monetization depth</h3></div>
      <div className="gd-grid3">
        {USAGE.map((u, i) => (
          <div className="gd-kpi" key={i}>
            <div className="gd-label">{u.label}</div>
            <div className="v" style={{ marginTop: 6, fontSize: 19 }}>{u.v}</div>
            <div className="gd-up" style={{ fontSize: 10.5, marginTop: 3 }}>↑ {u.d}</div>
          </div>
        ))}
      </div>
      <div className="gd-faint" style={{ fontSize: 10.5, marginTop: 12 }}>Per-tag usage & wallet behaviour = the LTV engine behind revenue growth.</div>
    </div>
  );
}

function SegmentGeo() {
  return (
    <div className="gd-card">
      <div className="gd-sechead"><span className="n">6</span><h3>Segment &amp; geographic growth</h3></div>
      {SEGMENTS.map((s, i) => (
        <div key={i} style={{ marginBottom: 13 }}>
          <div className="gd-row" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>{s.seg}</span>
            <span style={{ fontSize: 11.5 }}><b>{s.share}%</b> <span className="gd-up" style={{ fontSize: 10.5, marginLeft: 4 }}>{s.d}</span></span>
          </div>
          <div className="gd-track"><div className="gd-fill" style={{ width: `${s.share}%`, background: s.color }} /></div>
        </div>
      ))}
      <div className="gd-label" style={{ margin: "14px 0 8px" }}>Top growth corridors (YoY volume)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {GEO.map((g, i) => (
          <span key={i} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 20,
            background: "rgba(52,211,153,0.12)", color: C.green, border: `1px solid ${C.green}33` }}>
            {g.st} <b>{g.g}</b>
          </span>
        ))}
      </div>
      <div className="gd-faint" style={{ fontSize: 10.5, marginTop: 12 }}>+18 new toll plazas onboarded this quarter.</div>
    </div>
  );
}

function Levers() {
  return (
    <div className="gd-panel" style={{ padding: "18px 20px" }}>
      <SectionHead n="7" title="Forward growth levers &amp; actions" />
      {LEVERS.map((l, i) => (
        <div key={i} className="gd-row" style={{ alignItems: "flex-start", gap: 12, padding: "11px 0",
          borderTop: i ? `1px solid ${C.borderSoft}` : "none" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: sev(l.sev), marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>{l.act}</div>
            <div className="gd-faint" style={{ fontSize: 10.5, marginTop: 3 }}>
              {l.owner} · <span style={{ color: C.green }}>{l.impact}</span>
            </div>
          </div>
          <span className="gd-badge" style={{ color: sev(l.sev), background: `${sev(l.sev)}1f`, border: `1px solid ${sev(l.sev)}55` }}>
            {l.sev} priority
          </span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- ROOT --------------------------------- */
export default function FastagGrowthDrilldown({ onBack = () => {} }) {
  return (
    <div className="gd-root">
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />

      <div className="gd-label" style={{ color: C.amber, fontWeight: 700, fontSize: 11, marginBottom: 12 }}>
        ⚡ EXECUTIVE PULSE · FASTAG · GROWTH DRILL-DOWN
      </div>

      {/* 1 — header + north star + what's driving it */}
      <Header onBack={onBack} />

      {/* 2 — driver decomposition (centerpiece) */}
      <DriverDecomp />

      {/* 3 + 4 — funnel / channel mix */}
      <div className="gd-grid2" style={{ marginBottom: 18 }}>
        <Funnel />
        <Channels />
      </div>

      {/* 5 — annual pass spotlight */}
      <AnnualPass />

      {/* 6 + 7 — usage depth / segment + geo */}
      <div className="gd-grid2" style={{ marginBottom: 18 }}>
        <Usage />
        <SegmentGeo />
      </div>

      {/* 8 — forward levers + actions */}
      <Levers />
    </div>
  );
}
