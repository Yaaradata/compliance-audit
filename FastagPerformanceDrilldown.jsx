import React from "react";

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
 *   4. Consumer vs Partner contribution  (requested)
 *   5. Operational throughput & efficiency
 *   6. AI involvement  (requested)
 *   7. Wallet float & liquidity (the hidden engine)
 *   8. Risk / health flags + outlook
 *
 * Figures illustrative at a mid-size issuer scale; national context noted inline.
 * Self-contained: inline styling + injected <style>. Drop into any React app.
 */

/* ----------------------------- THEME TOKENS ----------------------------- */
const C = {
  bg: "#0a0a0c", panel: "#121215", panelAlt: "#171719", card: "#141417",
  border: "rgba(255,255,255,0.07)", borderSoft: "rgba(255,255,255,0.04)",
  text: "#f4f4f6", textDim: "#9a9aa3", textFaint: "#6b6b73",
  red: "#ff4d52", amber: "#f5a623", green: "#34d399", blue: "#4aa8ff",
  teal: "#2dd4bf", violet: "#a78bfa",
};

/* ------------------------------ STYLE BLOCK ----------------------------- */
const styleTag = `
  .pf-root *{box-sizing:border-box;}
  .pf-root{
    background:radial-gradient(1200px 600px at 15% -10%, rgba(74,168,255,0.06), transparent 60%),
               radial-gradient(1000px 500px at 92% 0%, rgba(52,211,153,0.05), transparent 55%),
               ${C.bg};
    color:${C.text}; font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;
    min-height:100vh; padding:16px 22px 44px; letter-spacing:.1px;
  }
  .pf-panel{ background:linear-gradient(180deg, ${C.panelAlt}, ${C.panel});
    border:1px solid ${C.border}; border-radius:16px; }
  .pf-card{ background:linear-gradient(180deg, ${C.card}, #0f0f12);
    border:1px solid ${C.border}; border-radius:14px; padding:16px 18px; }
  .pf-faint{ color:${C.textFaint}; } .pf-dim{ color:${C.textDim}; }
  .pf-label{ font-size:10px; letter-spacing:1.4px; text-transform:uppercase; color:${C.textFaint}; }
  .pf-row{ display:flex; justify-content:space-between; align-items:center; }
  .pf-badge{ font-size:9.5px; font-weight:700; letter-spacing:.6px; padding:4px 8px; border-radius:6px;
    display:inline-flex; align-items:center; gap:5px; }
  .pf-back{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; color:${C.textDim};
    font-size:12px; padding:6px 12px; border-radius:8px; border:1px solid ${C.border};
    background:rgba(255,255,255,0.02); transition:.15s; }
  .pf-back:hover{ color:${C.text}; border-color:rgba(255,255,255,0.18); }
  .pf-sechead{ display:flex; align-items:center; gap:10px; margin:0 0 14px; }
  .pf-sechead .n{ width:22px; height:22px; border-radius:7px; display:grid; place-items:center;
    font-size:11px; font-weight:700; }
  .pf-sechead h3{ margin:0; font-size:14px; font-weight:600; }
  .pf-up{ color:${C.green}; font-weight:600; } .pf-down{ color:${C.red}; font-weight:600; }
  .pf-track{ height:9px; border-radius:5px; background:rgba(255,255,255,0.06); overflow:hidden; }
  .pf-fill{ height:100%; border-radius:5px; }
  .pf-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .pf-grid3{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  .pf-grid6{ display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
  .pf-kpi{ padding:13px 15px; border:1px solid ${C.borderSoft}; border-radius:11px; background:rgba(255,255,255,0.012); }
  .pf-kpi .v{ font-size:21px; font-weight:700; line-height:1; }
  .pf-aibox{ border:1px solid ${C.borderSoft}; border-radius:11px; padding:12px 14px;
    background:linear-gradient(180deg, rgba(255,255,255,0.015), transparent); position:relative; }
  .pf-aibox:before{ content:""; position:absolute; left:0; top:8px; bottom:8px; width:2px; border-radius:2px;
    background:linear-gradient(180deg, var(--ac, ${C.blue}), transparent); }
  @media(max-width:1100px){ .pf-grid2{grid-template-columns:1fr;} .pf-grid3{grid-template-columns:1fr;}
    .pf-grid6{grid-template-columns:repeat(3,1fr);} }
`;

/* ------------------------------- HELPERS -------------------------------- */
function TrendLine({ data, color = C.blue, w = 760, h = 88 }) {
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
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" />
      {pts.map(([x, yy], i) => i === pts.length - 1 && <circle key={i} cx={x - 1} cy={yy} r="3.5" fill={color} />)}
    </svg>
  );
}

// Donut for contribution split
function Donut({ segments, size = 132, thick = 18, centerTop, centerBottom }) {
  const r = (size - thick) / 2, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thick} />
      {segments.map((s, i) => {
        const len = (s.value / 100) * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={thick}
            strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="butt" />
        );
        offset += len;
        return el;
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="700" fill={C.text}>{centerTop}</text>
      <text x={cx} y={cy + 15} textAnchor="middle" fontSize="9" fill={C.textFaint} style={{ letterSpacing: 1 }}>{centerBottom}</text>
    </svg>
  );
}

function SectionHead({ n, title, right, color = C.blue }) {
  return (
    <div className="pf-row" style={{ marginBottom: 12 }}>
      <div className="pf-sechead" style={{ margin: 0 }}>
        <span className="n" style={{ background: `${color}24`, color }}>{n}</span>
        <h3>{title}</h3>
      </div>
      {right}
    </div>
  );
}

/* --------------------------------- DATA --------------------------------- */
const REV_TREND = [38, 41, 40, 44, 43, 46, 48, 47, 50, 49, 52]; // ₹Cr net revenue, monthly

const HEADLINE = [
  { label: "Toll Throughput (GTV)", v: "₹1,850Cr", d: "+19% YoY", color: C.text },
  { label: "Net Revenue (mo)", v: "₹52Cr", d: "+11% YoY", color: C.green },
  { label: "Operating Margin", v: "22%", d: "+2 pts", color: C.green },
  { label: "Active Tags", v: "84L", d: "+6% QoQ", color: C.text },
  { label: "Daily Transactions", v: "18.4L", d: "+8%", color: C.text },
  { label: "Net Op. Cash (mo)", v: "+₹16.2Cr", d: "+14%", color: C.teal },
];

const PNL = [
  { label: "Net Revenue", v: "₹52.0Cr", d: "+11%", up: true },
  { label: "Take Rate (of GTV)", v: "0.28%", d: "stable", up: true },
  { label: "Gross Margin", v: "61%", d: "+1 pt", up: true },
  { label: "EBITDA", v: "₹11.4Cr", d: "+18%", up: true },
  { label: "Cost / Active Tag", v: "₹44", d: "-6%", up: true },
  { label: "Rev / Active Tag", v: "₹62", d: "+4%", up: true },
];

const INFLOWS = [
  { k: "Toll txn commission / interchange", v: 28.0 },
  { k: "Float income (wallet + deposits)", v: 9.0 },
  { k: "Annual Pass (upfront, net)", v: 7.0 },
  { k: "Tag issuance + deposit fees", v: 4.0 },
  { k: "Non-toll (parking / fuel)", v: 3.4 },
  { k: "Co-brand / partner fees", v: 2.0 },
];
const OUTFLOWS = [
  { k: "Acquirer / partner share", v: 8.0 },
  { k: "Marketing / CAC", v: 6.0 },
  { k: "NPCI / NETC switch fees", v: 6.0 },
  { k: "Customer support / BPO", v: 5.0 },
  { k: "Tag procurement + logistics", v: 4.0 },
  { k: "Refunds & chargebacks", v: 3.2 },
  { k: "Tech / cloud / infra", v: 3.0 },
  { k: "KYC vendor", v: 2.0 },
];

const CONSUMER = [
  { k: "Float income", v: 9.0, color: C.green },
  { k: "Annual Pass", v: 7.0, color: C.teal },
  { k: "Consumer txn commission", v: 13.3, color: C.blue },
  { k: "Issuance + deposit", v: 4.0, color: C.violet },
];
const PARTNER = [
  { k: "Acquirer commission", v: 9.7, color: C.amber },
  { k: "Co-brand fees", v: 2.0, color: C.blue },
  { k: "Parking / fuel merchants", v: 3.4, color: C.teal },
  { k: "Merchant / aggregator", v: 3.6, color: C.violet },
];

const OPS = [
  { label: "Txn Success Rate", v: "99.1%", d: "+0.3 pt" },
  { label: "Settlement TAT", v: "T+1", d: "99.4% in-cycle" },
  { label: "Avg Toll Ticket", v: "₹98", d: "+5%" },
  { label: "Plaza Read Accuracy", v: "99.2%", d: "+0.4 pt" },
  { label: "Active / Issued", v: "84%", d: "dormant 16%" },
  { label: "Recharge / Tag (mo)", v: "2.3", d: "+9%" },
];

const AI = [
  { label: "Fraud / Leakage Prevented", v: "₹4.8Cr", sub: "double-deduction, card-testing", color: C.green },
  { label: "Auto-Reconciliation", v: "88%", sub: "settlements auto-matched", color: C.blue },
  { label: "Support Auto-Resolution", v: "61%", sub: "tickets deflected by AI", color: C.teal },
  { label: "Opex Saved (mo)", v: "₹3.1Cr", sub: "vs manual ops", color: C.green },
  { label: "Cash-Flow Forecast Acc.", v: "94%", sub: "T+7 prediction", color: C.blue },
  { label: "Dormancy Prediction", v: "79%", sub: "precision @ 30d", color: C.teal },
];

const FLOAT = [
  { label: "Prepaid Float Balance", v: "₹740Cr", d: "+7%" },
  { label: "Security Deposit Liability", v: "₹168Cr", d: "+3%" },
  { label: "Float Income Yield", v: "6.8%", d: "annualized" },
  { label: "Idle / Dormant Balance", v: "₹86Cr", d: "reactivate" },
];

const FLAGS = [
  { t: "Dormant tags at 16% — ₹86Cr idle float not transacting", sev: "Med", color: C.amber },
  { t: "Top acquirer concentration 38% of partner volume", sev: "Med", color: C.amber },
  { t: "Refund / chargeback leakage trending +124% WoW", sev: "High", color: C.red },
  { t: "GNSS free-flow transition — capex & model shift ahead", sev: "Watch", color: C.blue },
];

const sev = (s) => (s === "High" ? C.red : s === "Med" ? C.amber : s === "Watch" ? C.blue : C.green);
const sumv = (a) => a.reduce((s, x) => s + x.v, 0);

/* ------------------------------- SECTIONS ------------------------------- */
function Header({ onBack }) {
  return (
    <div className="pf-panel" style={{ padding: "20px 22px", marginBottom: 18 }}>
      <div className="pf-row" style={{ marginBottom: 16 }}>
        <div className="pf-row" style={{ justifyContent: "flex-start", gap: 12 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
            background: "rgba(74,168,255,0.14)", color: C.blue, fontSize: 15 }}>◷</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>How is the overall FASTag business performing?</div>
            <div className="pf-label" style={{ marginTop: 4 }}>P&amp;L · Cash flow · Contribution · AI · Float</div>
          </div>
        </div>
        <div className="pf-back" onClick={onBack}>‹ Back to board</div>
      </div>

      <div className="pf-row" style={{ alignItems: "flex-end", marginBottom: 16 }}>
        <div style={{ minWidth: 160 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}>72</div>
          <div style={{ color: C.red, fontSize: 13, fontWeight: 600, marginTop: 6 }}>▼ 3 pts WoW</div>
          <div className="pf-faint" style={{ fontSize: 10.5, marginTop: 4 }}>Business-health index</div>
        </div>
        <div style={{ flex: 1, marginLeft: 24 }}>
          <div className="pf-label" style={{ marginBottom: 4 }}>Net revenue trend · ₹Cr / month</div>
          <TrendLine data={REV_TREND} />
        </div>
      </div>

      <div className="pf-grid6">
        {HEADLINE.map((k, i) => (
          <div className="pf-kpi" key={i}>
            <div className="pf-label">{k.label}</div>
            <div className="v" style={{ marginTop: 6, color: k.color }}>{k.v}</div>
            <div className="pf-up" style={{ fontSize: 10, marginTop: 3 }}>{k.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PnL() {
  return (
    <div className="pf-panel" style={{ padding: "18px 20px", marginBottom: 18 }}>
      <SectionHead n="1" title="Financial performance / P&L snapshot" />
      <div className="pf-grid6">
        {PNL.map((k, i) => (
          <div className="pf-kpi" key={i}>
            <div className="pf-label">{k.label}</div>
            <div className="v" style={{ marginTop: 6, fontSize: 19 }}>{k.v}</div>
            <div className="pf-up" style={{ fontSize: 10, marginTop: 3 }}>↑ {k.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CashFlow() {
  const inTot = sumv(INFLOWS), outTot = sumv(OUTFLOWS), net = inTot - outTot;
  const maxBar = Math.max(...INFLOWS.map((x) => x.v), ...OUTFLOWS.map((x) => x.v));
  const Bar = ({ item, color }) => (
    <div style={{ marginBottom: 10 }}>
      <div className="pf-row" style={{ marginBottom: 5 }}>
        <span style={{ fontSize: 11.5 }}>{item.k}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color }}>₹{item.v.toFixed(1)}Cr</span>
      </div>
      <div className="pf-track" style={{ height: 7 }}><div className="pf-fill" style={{ width: `${(item.v / maxBar) * 100}%`, background: color }} /></div>
    </div>
  );
  return (
    <div className="pf-panel" style={{ padding: "18px 20px", marginBottom: 18 }}>
      <SectionHead n="2" color={C.teal} title="Cash inflow & outflow (monthly)"
        right={<span className="pf-faint" style={{ fontSize: 10.5 }}>business cash, excl. pass-through float</span>} />
      <div className="pf-grid2">
        <div>
          <div className="pf-row" style={{ marginBottom: 12 }}>
            <span className="pf-label" style={{ color: C.green }}>● Inflows</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>₹{inTot.toFixed(1)}Cr</span>
          </div>
          {INFLOWS.map((x, i) => <Bar key={i} item={x} color={C.green} />)}
        </div>
        <div>
          <div className="pf-row" style={{ marginBottom: 12 }}>
            <span className="pf-label" style={{ color: C.red }}>● Outflows</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>₹{outTot.toFixed(1)}Cr</span>
          </div>
          {OUTFLOWS.map((x, i) => <Bar key={i} item={x} color={C.red} />)}
        </div>
      </div>
      <div className="pf-aibox" style={{ marginTop: 6, "--ac": C.teal }}>
        <div className="pf-row">
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Net operating cash flow</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: C.teal }}>+₹{net.toFixed(1)}Cr</span>
        </div>
        <div className="pf-faint" style={{ fontSize: 10.5, marginTop: 4 }}>
          Settlement on T+1 NETC cut-off cycles. ₹1,920Cr gross recharge float flows through but nets to zero (spent on tolls); business cash is the take above.
        </div>
      </div>
    </div>
  );
}

function Contribution() {
  const cTot = sumv(CONSUMER), pTot = sumv(PARTNER), all = cTot + pTot;
  const cPct = Math.round((cTot / all) * 100), pPct = 100 - cPct;
  const Side = ({ title, rows, total, pct, accent }) => (
    <div className="pf-card">
      <div className="pf-row" style={{ marginBottom: 14 }}>
        <Donut
          segments={rows.map((r) => ({ value: (r.v / total) * 100, color: r.color }))}
          centerTop={`${pct}%`} centerBottom={title.toUpperCase()} />
        <div style={{ flex: 1, marginLeft: 16 }}>
          <div className="pf-label">{title} contribution</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: accent }}>₹{total.toFixed(1)}Cr</div>
          <div className="pf-faint" style={{ fontSize: 10.5, marginTop: 2 }}>of ₹{all.toFixed(1)}Cr net revenue</div>
        </div>
      </div>
      {rows.map((r, i) => (
        <div className="pf-row" key={i} style={{ padding: "6px 0" }}>
          <span style={{ fontSize: 11.5 }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: r.color, marginRight: 8 }} />{r.k}</span>
          <span style={{ fontSize: 11.5, fontWeight: 600 }}>₹{r.v.toFixed(1)}Cr</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ marginBottom: 18 }}>
      <SectionHead n="3" color={C.violet} title="Consumer vs partner contribution"
        right={<span className="pf-faint" style={{ fontSize: 10.5 }}>{cPct}% consumer · {pPct}% partner</span>} />
      <div className="pf-grid2">
        <Side title="Consumer" rows={CONSUMER} total={cTot} pct={cPct} accent={C.green} />
        <Side title="Partner" rows={PARTNER} total={pTot} pct={pPct} accent={C.amber} />
      </div>
    </div>
  );
}

function Ops() {
  return (
    <div className="pf-card">
      <div className="pf-sechead"><span className="n" style={{ background: `${C.blue}24`, color: C.blue }}>4</span><h3>Throughput &amp; efficiency</h3></div>
      <div className="pf-grid3">
        {OPS.map((o, i) => (
          <div className="pf-kpi" key={i}>
            <div className="pf-label">{o.label}</div>
            <div className="v" style={{ marginTop: 6, fontSize: 18 }}>{o.v}</div>
            <div className="pf-faint" style={{ fontSize: 9.5, marginTop: 3 }}>{o.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatLiquidity() {
  return (
    <div className="pf-card">
      <div className="pf-sechead"><span className="n" style={{ background: `${C.green}24`, color: C.green }}>5</span><h3>Wallet float &amp; liquidity</h3></div>
      <div className="pf-grid2" style={{ gap: 12 }}>
        {FLOAT.map((f, i) => (
          <div className="pf-kpi" key={i}>
            <div className="pf-label">{f.label}</div>
            <div className="v" style={{ marginTop: 6, fontSize: 18 }}>{f.v}</div>
            <div className="pf-up" style={{ fontSize: 9.5, marginTop: 3 }}>{f.d}</div>
          </div>
        ))}
      </div>
      <div className="pf-faint" style={{ fontSize: 10.5, marginTop: 12 }}>
        Float is the hidden engine: ₹740Cr prepaid balance earns yield while sitting between recharge and toll.
      </div>
    </div>
  );
}

function AIPanel() {
  return (
    <div className="pf-panel" style={{ padding: "18px 20px", marginBottom: 18, borderColor: "rgba(74,168,255,0.25)" }}>
      <SectionHead n="6" color={C.blue} title="AI involvement in the business"
        right={<span className="pf-badge" style={{ color: C.blue, background: `${C.blue}1f`, border: `1px solid ${C.blue}55` }}>≈ ₹7.9Cr / mo BENEFIT</span>} />
      <div className="pf-grid6">
        {AI.map((a, i) => (
          <div className="pf-kpi" key={i} style={{ borderColor: "rgba(74,168,255,0.16)" }}>
            <div className="pf-label">{a.label}</div>
            <div className="v" style={{ marginTop: 7, fontSize: 19, color: a.color }}>{a.v}</div>
            <div className="pf-faint" style={{ fontSize: 9, marginTop: 3, lineHeight: 1.3 }}>{a.sub}</div>
          </div>
        ))}
      </div>
      <div className="pf-dim" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 13 }}>
        AI now runs continuous settlement reconciliation, real-time fraud/leakage detection, and front-line support
        deflection — together contributing ~₹7.9Cr/month (fraud prevented + opex saved) and lifting margin ~2 pts.
      </div>
    </div>
  );
}

function Flags() {
  return (
    <div className="pf-panel" style={{ padding: "18px 20px" }}>
      <SectionHead n="7" color={C.amber} title="Risk / health flags & outlook" />
      {FLAGS.map((f, i) => (
        <div key={i} className="pf-row" style={{ alignItems: "flex-start", gap: 12, padding: "11px 0",
          borderTop: i ? `1px solid ${C.borderSoft}` : "none" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: f.color, marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.4 }}>{f.t}</div>
          <span className="pf-badge" style={{ color: f.color, background: `${f.color}1f`, border: `1px solid ${f.color}55` }}>{f.sev}</span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------- ROOT --------------------------------- */
export default function FastagPerformanceDrilldown({ onBack = () => {} }) {
  return (
    <div className="pf-root">
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />

      <div className="pf-label" style={{ color: C.amber, fontWeight: 700, fontSize: 11, marginBottom: 12 }}>
        ⚡ EXECUTIVE PULSE · FASTAG · PERFORMANCE DRILL-DOWN
      </div>

      {/* 1 — header + KPI strip + trend */}
      <Header onBack={onBack} />

      {/* 2 — P&L */}
      <PnL />

      {/* 3 — cash inflow & outflow */}
      <CashFlow />

      {/* 4 — consumer vs partner contribution */}
      <Contribution />

      {/* 5 + 6 — ops / float */}
      <div className="pf-grid2" style={{ marginBottom: 18 }}>
        <Ops />
        <FloatLiquidity />
      </div>

      {/* 7 — AI involvement */}
      <AIPanel />

      {/* 8 — risk flags + outlook */}
      <Flags />
    </div>
  );
}
