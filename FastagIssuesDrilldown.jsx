import React from "react";

/**
 * FASTag — Head of Business
 * Drill-down page for the card: "Is Customer and Partners are happy?"
 *
 * Opens when the score card's chevron is clicked. Business-first framing:
 * every section ladders up to "is this friction costing us customers / revenue / growth?"
 *
 * Sections:
 *   1. Score header + why-it-moved (full width)
 *   2. Issue → growth-impact map (anchor block)
 *   3. Complaint & dispute breakdown
 *   4. Resolution / SLA summary (high-level)
 *   5. Partner / acquirer scorecard (anchor block)
 *   6. Churn & at-risk linkage
 *   7. Reputation / sentiment
 *   8. Root-cause clusters + recommended actions (footer)
 *
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
  redDeep: "#b21f24",
  amber: "#f5a623",
  amberDeep: "#a86c0a",
  green: "#34d399",
  blue: "#4aa8ff",
};

/* ------------------------------ STYLE BLOCK ----------------------------- */
const styleTag = `
  .dd-root *{box-sizing:border-box;}
  .dd-root{
    background:radial-gradient(1200px 600px at 15% -10%, rgba(255,77,82,0.07), transparent 60%),
               radial-gradient(1000px 500px at 92% 0%, rgba(245,166,35,0.05), transparent 55%),
               ${C.bg};
    color:${C.text};
    font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif;
    min-height:100vh; padding:16px 22px 44px; letter-spacing:.1px;
  }
  .dd-panel{ background:linear-gradient(180deg, ${C.panelAlt}, ${C.panel});
    border:1px solid ${C.border}; border-radius:16px; }
  .dd-card{ background:linear-gradient(180deg, ${C.card}, #0f0f12);
    border:1px solid ${C.border}; border-radius:14px; padding:16px 18px; }
  .dd-faint{ color:${C.textFaint}; }
  .dd-dim{ color:${C.textDim}; }
  .dd-label{ font-size:10px; letter-spacing:1.4px; text-transform:uppercase; color:${C.textFaint}; }
  .dd-row{ display:flex; justify-content:space-between; align-items:center; }
  .dd-badge{ font-size:9.5px; font-weight:700; letter-spacing:.6px; padding:4px 8px;
    border-radius:6px; display:inline-flex; align-items:center; gap:5px; }
  .dd-divider{ height:1px; background:${C.borderSoft}; margin:12px 0; }
  .dd-back{ display:inline-flex; align-items:center; gap:7px; cursor:pointer;
    color:${C.textDim}; font-size:12px; padding:6px 12px; border-radius:8px;
    border:1px solid ${C.border}; background:rgba(255,255,255,0.02); transition:.15s; }
  .dd-back:hover{ color:${C.text}; border-color:rgba(255,255,255,0.18); }
  .dd-sechead{ display:flex; align-items:center; gap:10px; margin:0 0 12px; }
  .dd-sechead .n{ width:22px; height:22px; border-radius:7px; display:grid; place-items:center;
    font-size:11px; font-weight:700; background:rgba(255,77,82,0.13); color:${C.red}; }
  .dd-sechead h3{ margin:0; font-size:14px; font-weight:600; }
  .dd-th{ font-size:10px; letter-spacing:.8px; text-transform:uppercase; color:${C.textFaint};
    text-align:left; padding:0 10px 9px; font-weight:600; }
  .dd-td{ font-size:12.5px; padding:11px 10px; border-top:1px solid ${C.borderSoft}; vertical-align:middle; }
  .dd-up{ color:${C.red}; font-weight:600; }
  .dd-down{ color:${C.green}; font-weight:600; }
  .dd-grid4{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .dd-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .dd-kpi .v{ font-size:24px; font-weight:700; line-height:1; }
  .dd-bar-track{ height:8px; border-radius:5px; background:rgba(255,255,255,0.06); overflow:hidden; }
  .dd-bar-fill{ height:100%; border-radius:5px; }
  .dd-chip{ font-size:10px; padding:3px 8px; border-radius:20px; font-weight:600; }
  .dd-aibox{ border:1px solid ${C.borderSoft}; border-radius:11px; padding:12px 13px 12px 15px;
    background:linear-gradient(180deg, rgba(255,255,255,0.015), transparent); position:relative; }
  .dd-aibox:before{ content:""; position:absolute; left:0; top:8px; bottom:8px; width:2px; border-radius:2px;
    background:linear-gradient(180deg, var(--ac, ${C.red}), transparent); }
  @media(max-width:1100px){ .dd-grid4{grid-template-columns:repeat(2,1fr);} .dd-grid2{grid-template-columns:1fr;} }
`;

/* ------------------------------- HELPERS -------------------------------- */
function TrendLine({ data, color = C.red, w = 760, h = 90 }) {
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
  const id = "tl" + color.replace(/[^a-z0-9]/gi, "");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" />
      {pts.map(([x, yy], i) => i === pts.length - 1 && (
        <circle key={i} cx={x - 1} cy={yy} r="3.5" fill={color} />
      ))}
    </svg>
  );
}

function SectionHead({ n, title, right }) {
  return (
    <div className="dd-row" style={{ marginBottom: 12 }}>
      <div className="dd-sechead" style={{ margin: 0 }}>
        <span className="n">{n}</span>
        <h3>{title}</h3>
      </div>
      {right}
    </div>
  );
}

const sevColor = (s) => (s === "Critical" ? C.red : s === "High" ? C.amber : C.green);

/* --------------------------------- DATA --------------------------------- */
const TREND = [70, 68, 71, 66, 69, 64, 67, 63, 65, 60, 59];

const IMPACT = [
  { issue: "Double deduction", vol: "1,420", volD: "+38%", affected: "8,900 tags", risk: "₹47L", churn: "High", sev: "Critical" },
  { issue: "Blacklist on low balance", vol: "980", volD: "+62%", affected: "6,200 tags", risk: "₹31L", churn: "High", sev: "Critical" },
  { issue: "Recharge / wallet failure", vol: "1,180", volD: "+24%", affected: "4,800 wallets", risk: "₹28L", churn: "Med", sev: "High" },
  { issue: "KYC / activation stall", vol: "760", volD: "+17%", affected: "4,300 tags", risk: "₹18L", churn: "Med", sev: "High" },
  { issue: "Tag mis-read at plaza", vol: "540", volD: "+9%", affected: "2,100 tags", risk: "₹9L", churn: "Low", sev: "Watch" },
];

const BREAKDOWN = [
  { cat: "Double deduction", pct: 27, d: "+38%", color: C.red },
  { cat: "Recharge failure", pct: 22, d: "+24%", color: C.red },
  { cat: "Blacklist / low balance", pct: 19, d: "+62%", color: C.amber },
  { cat: "KYC / activation", pct: 14, d: "+17%", color: C.amber },
  { cat: "Plaza mis-read", pct: 10, d: "+9%", color: C.blue },
  { cat: "Others", pct: 8, d: "-3%", color: C.textFaint },
];

const SLA_KPI = [
  { label: "Resolved in Promise", v: "51%", sub: "target 80%", color: C.red },
  { label: "Beyond SLA", v: "56", sub: "cases overdue", color: C.amber },
  { label: "Avg Resolution", v: "78h", sub: "vs 48h promise", color: C.red },
  { label: "Repeat Contact", v: "44%", sub: "+6 pts WoW", color: C.amber },
];

const PARTNERS = [
  { name: "Acquirer Bank A", role: "Toll acquirer", sla: 62, err: "4.8%", cases: "640", exp: "₹22L", sev: "Critical" },
  { name: "Payment Gateway", role: "Recharge / UPI", sla: 71, err: "3.1%", cases: "410", exp: "₹14L", sev: "High" },
  { name: "Issuing Bank B", role: "Tag issuance", sla: 88, err: "1.2%", cases: "120", exp: "₹4L", sev: "Watch" },
  { name: "BPO Vendor Beta", role: "KYC / support", sla: 58, err: "6.0%", cases: "310", exp: "₹11L", sev: "Critical" },
];

const SENTIMENT = [40, 44, 42, 50, 48, 58, 62, 70, 66, 78, 84];

const ROOTCAUSE = [
  { cause: "Plaza reader / acquirer reconciliation", share: 34, color: C.red },
  { cause: "Payment gateway timeouts", share: 26, color: C.amber },
  { cause: "Vendor KYC backlog", share: 22, color: C.amber },
  { cause: "Process / first-response gap", share: 18, color: C.blue },
];

const ACTIONS = [
  { act: "Auto-reverse duplicate charges + acquirer reconciliation SLA", owner: "Ops + Acquirer A", impact: "₹47L recovered, churn -high", sev: "Critical" },
  { act: "Fail-over gateway + proactive recharge-fail notifications", owner: "Payments", impact: "₹28L protected", sev: "Critical" },
  { act: "KAM retention outreach to 12 at-risk fleet accounts", owner: "Sales / KAM", impact: "₹4.2M spend retained", sev: "Critical" },
  { act: "Publish auto-recharge FAQ + influencer comms on blacklist", owner: "Marketing / CX", impact: "Reputation + new-acq drag", sev: "High" },
  { act: "Reroute high-value KYC off Vendor Beta to in-house pod", owner: "CX Ops", impact: "₹18L activation unblocked", sev: "High" },
];

/* ------------------------------- SECTIONS ------------------------------- */
function Header({ onBack }) {
  return (
    <div className="dd-panel" style={{ padding: "20px 22px", marginBottom: 18 }}>
      <div className="dd-row" style={{ marginBottom: 14 }}>
        <div className="dd-row" style={{ justifyContent: "flex-start", gap: 12 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center",
            background: "rgba(255,77,82,0.13)", color: C.red, fontSize: 15 }}>♥</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Is Customer and Partners are happy?</div>
            <div className="dd-label" style={{ marginTop: 4 }}>Complaints · Resolution · Partner SLA · Churn linkage</div>
          </div>
        </div>
        <div className="dd-back" onClick={onBack}>‹ Back to board</div>
      </div>

      <div className="dd-row" style={{ alignItems: "flex-end" }}>
        <div style={{ minWidth: 150 }}>
          <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1 }}>59</div>
          <div style={{ color: C.red, fontSize: 13, fontWeight: 600, marginTop: 6 }}>▼ 9 pts WoW</div>
          <div className="dd-faint" style={{ fontSize: 10.5, marginTop: 4 }}>Service-health index · last 11 weeks</div>
        </div>
        <div style={{ flex: 1, marginLeft: 24 }}>
          <TrendLine data={TREND} />
        </div>
      </div>

      <div className="dd-aibox" style={{ marginTop: 16 }}>
        <div className="dd-label" style={{ color: C.red, marginBottom: 6, display: "flex", gap: 6, alignItems: "center" }}>
          <span>▦</span> WHY IT MOVED
        </div>
        <div className="dd-dim" style={{ fontSize: 12, lineHeight: 1.55 }}>
          The 9-point drop is driven by rising double-deduction refunds and blacklist-on-low-balance disputes,
          compounded by acquirer reconciliation delays. <span style={{ color: C.text }}>₹1.33Cr of spend is now exposed
          across 12 at-risk fleet accounts</span>, making resolution friction a direct growth risk — not just a service metric.
        </div>
      </div>
    </div>
  );
}

function ImpactMap() {
  return (
    <div className="dd-panel" style={{ padding: "18px 20px", marginBottom: 18 }}>
      <SectionHead n="1" title="Issue → growth impact"
        right={<span className="dd-faint" style={{ fontSize: 10.5 }}>ranked by spend at risk · WoW</span>} />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th className="dd-th">Issue type</th>
            <th className="dd-th">Complaints</th>
            <th className="dd-th">Customers / tags affected</th>
            <th className="dd-th">Spend at risk</th>
            <th className="dd-th">Churn correlation</th>
            <th className="dd-th">Severity</th>
          </tr>
        </thead>
        <tbody>
          {IMPACT.map((r, i) => (
            <tr key={i}>
              <td className="dd-td" style={{ fontWeight: 600 }}>{r.issue}</td>
              <td className="dd-td">{r.vol} <span className="dd-up" style={{ fontSize: 11 }}>↑{r.volD}</span></td>
              <td className="dd-td dd-dim">{r.affected}</td>
              <td className="dd-td" style={{ fontWeight: 700, color: C.red }}>{r.risk}</td>
              <td className="dd-td">
                <span className="dd-chip" style={{
                  background: r.churn === "High" ? "rgba(255,77,82,0.15)" : r.churn === "Med" ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.06)",
                  color: r.churn === "High" ? C.red : r.churn === "Med" ? C.amber : C.textDim,
                }}>{r.churn}</span>
              </td>
              <td className="dd-td">
                <span className="dd-badge" style={{ color: sevColor(r.sev), background: `${sevColor(r.sev)}1f`, border: `1px solid ${sevColor(r.sev)}55` }}>
                  {r.sev}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Breakdown() {
  return (
    <div className="dd-card">
      <div className="dd-sechead"><span className="n">2</span><h3>Complaint &amp; dispute breakdown</h3></div>
      {BREAKDOWN.map((b, i) => (
        <div key={i} style={{ marginBottom: 13 }}>
          <div className="dd-row" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>{b.cat}</span>
            <span style={{ fontSize: 11.5 }}>
              <span style={{ fontWeight: 700 }}>{b.pct}%</span>
              <span className={b.d.startsWith("-") ? "dd-down" : "dd-up"} style={{ fontSize: 10.5, marginLeft: 6 }}>{b.d}</span>
            </span>
          </div>
          <div className="dd-bar-track"><div className="dd-bar-fill" style={{ width: `${b.pct * 3.4}%`, background: b.color }} /></div>
        </div>
      ))}
      <div className="dd-faint" style={{ fontSize: 10.5, marginTop: 4 }}>Share of total complaint volume · last 7 days</div>
    </div>
  );
}

function SLASummary() {
  return (
    <div className="dd-card">
      <div className="dd-sechead"><span className="n">3</span><h3>Resolution / SLA summary</h3></div>
      <div className="dd-grid2" style={{ gap: 12 }}>
        {SLA_KPI.map((k, i) => (
          <div className="dd-kpi" key={i} style={{ padding: "12px 14px", border: `1px solid ${C.borderSoft}`, borderRadius: 11 }}>
            <div className="dd-label">{k.label}</div>
            <div className="v" style={{ color: k.color, marginTop: 7 }}>{k.v}</div>
            <div className="dd-faint" style={{ fontSize: 10, marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="dd-faint" style={{ fontSize: 10.5, marginTop: 12 }}>
        High-level only — detailed queue / agent view lives in the CX board.
      </div>
    </div>
  );
}

function PartnerScorecard() {
  return (
    <div className="dd-panel" style={{ padding: "18px 20px", marginBottom: 18 }}>
      <SectionHead n="4" title="Partner / acquirer scorecard"
        right={<span className="dd-faint" style={{ fontSize: 10.5 }}>who is the bottleneck</span>} />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th className="dd-th">Partner</th>
            <th className="dd-th">Role</th>
            <th className="dd-th" style={{ width: 180 }}>SLA adherence</th>
            <th className="dd-th">Error / recon rate</th>
            <th className="dd-th">Attributable cases</th>
            <th className="dd-th">Business exposure</th>
            <th className="dd-th">Status</th>
          </tr>
        </thead>
        <tbody>
          {PARTNERS.map((p, i) => {
            const col = p.sla >= 85 ? C.green : p.sla >= 70 ? C.amber : C.red;
            return (
              <tr key={i}>
                <td className="dd-td" style={{ fontWeight: 600 }}>{p.name}</td>
                <td className="dd-td dd-dim">{p.role}</td>
                <td className="dd-td">
                  <div className="dd-row" style={{ gap: 8 }}>
                    <div className="dd-bar-track" style={{ flex: 1 }}><div className="dd-bar-fill" style={{ width: `${p.sla}%`, background: col }} /></div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: col, minWidth: 30 }}>{p.sla}%</span>
                  </div>
                </td>
                <td className="dd-td">{p.err}</td>
                <td className="dd-td">{p.cases}</td>
                <td className="dd-td" style={{ fontWeight: 700, color: C.red }}>{p.exp}</td>
                <td className="dd-td">
                  <span className="dd-badge" style={{ color: sevColor(p.sev), background: `${sevColor(p.sev)}1f`, border: `1px solid ${sevColor(p.sev)}55` }}>
                    {p.sev}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChurnLinkage() {
  return (
    <div className="dd-card">
      <div className="dd-sechead"><span className="n">5</span><h3>Churn &amp; at-risk linkage</h3></div>
      <div className="dd-grid2" style={{ gap: 12, marginBottom: 14 }}>
        <div style={{ padding: "12px 14px", border: `1px solid ${C.borderSoft}`, borderRadius: 11 }}>
          <div className="dd-label">At-Risk Accounts</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 7 }}>12 <span style={{ fontSize: 12, fontWeight: 400 }} className="dd-dim">fleets</span></div>
          <div className="dd-up" style={{ fontSize: 10.5, marginTop: 3 }}>↑ 5 WoW</div>
        </div>
        <div style={{ padding: "12px 14px", border: `1px solid ${C.borderSoft}`, borderRadius: 11 }}>
          <div className="dd-label">Spend at Risk</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 7, color: C.red }}>₹4.2M</div>
          <div className="dd-up" style={{ fontSize: 10.5, marginTop: 3 }}>↑ 56%</div>
        </div>
      </div>
      <div className="dd-dim" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
        Closure-intent signals rose from 7 → 18 cases, concentrated in accounts with unresolved double-deduction
        and recharge-failure tickets. Retention window: <span style={{ color: C.amber }}>act within 48h</span>.
      </div>
    </div>
  );
}

function Reputation() {
  return (
    <div className="dd-card">
      <div className="dd-sechead"><span className="n">6</span><h3>Reputation / sentiment</h3></div>
      <div className="dd-row" style={{ marginBottom: 4 }}>
        <span className="dd-dim" style={{ fontSize: 11.5 }}>Negative-mention volume (48h)</span>
        <span className="dd-up" style={{ fontSize: 12 }}>#FASTagFail ↑ 287%</span>
      </div>
      <TrendLine data={SENTIMENT} color={C.amber} h={70} />
      <div className="dd-dim" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 8 }}>
        Reputation drag suppresses <span style={{ color: C.text }}>new tag acquisition</span>, not just service —
        making this a growth signal. Blacklist narrative leads, reach est. 1.8M.
      </div>
    </div>
  );
}

function RootCauseActions() {
  return (
    <div className="dd-panel" style={{ padding: "18px 20px" }}>
      <SectionHead n="7" title="Root-cause clusters & recommended actions" />
      <div className="dd-grid2" style={{ gap: 20 }}>
        {/* root cause */}
        <div>
          <div className="dd-label" style={{ marginBottom: 12 }}>Where issues originate</div>
          {ROOTCAUSE.map((r, i) => (
            <div key={i} style={{ marginBottom: 13 }}>
              <div className="dd-row" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11.5 }}>{r.cause}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700 }}>{r.share}%</span>
              </div>
              <div className="dd-bar-track"><div className="dd-bar-fill" style={{ width: `${r.share * 2.6}%`, background: r.color }} /></div>
            </div>
          ))}
        </div>
        {/* actions */}
        <div>
          <div className="dd-label" style={{ marginBottom: 12 }}>Prioritized actions</div>
          {ACTIONS.map((a, i) => (
            <div key={i} className="dd-row" style={{ alignItems: "flex-start", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.borderSoft}` : "none" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sevColor(a.sev), marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, lineHeight: 1.4 }}>{a.act}</div>
                <div className="dd-faint" style={{ fontSize: 10, marginTop: 3 }}>
                  {a.owner} · <span style={{ color: C.green }}>{a.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- ROOT --------------------------------- */
export default function FastagIssuesDrilldown({ onBack = () => {} }) {
  return (
    <div className="dd-root">
      <style dangerouslySetInnerHTML={{ __html: styleTag }} />

      <div className="dd-label" style={{ color: C.amber, fontWeight: 700, fontSize: 11, marginBottom: 12 }}>
        ⚡ EXECUTIVE PULSE · FASTAG · DRILL-DOWN
      </div>

      {/* 1 — header + why it moved */}
      <Header onBack={onBack} />

      {/* 2 — issue → growth impact (anchor) */}
      <ImpactMap />

      {/* 3 + 4 — breakdown / SLA */}
      <div className="dd-grid2" style={{ marginBottom: 18 }}>
        <Breakdown />
        <SLASummary />
      </div>

      {/* 5 — partner scorecard (anchor) */}
      <PartnerScorecard />

      {/* 6 + 7 — churn linkage / reputation */}
      <div className="dd-grid2" style={{ marginBottom: 18 }}>
        <ChurnLinkage />
        <Reputation />
      </div>

      {/* 8 — root cause + actions */}
      <RootCauseActions />
    </div>
  );
}
