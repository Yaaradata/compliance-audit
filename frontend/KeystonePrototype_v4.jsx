import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Lock, FileCheck, Activity,
  Gauge, Truck, FolderCheck, LayoutGrid, RotateCcw, ChevronRight, ChevronDown,
  ArrowRight, FlaskConical, Receipt, FileText, Mail, Download, Users, Scale,
  Wallet, Database, ClipboardCheck, TrendingDown, TrendingUp, Minus, ShieldAlert,
  Moon, Sun, Coins, CalendarDays, Layers, Share2, Clock,
} from "lucide-react";

const LION_LOGO = "data:image/png;base64,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";

/* ──────────────────────────────────────────────────────────────────────────
   KEYSTONE v3 — Lion Brewery (Ceylon) PLC
   The monthly board / audit-committee grind becomes a review.
   • Single source of truth: one in-memory store seeded from §7.75 v2 mock data.
   • Source chips render FROM data sourceTag — no number without its chip.
   • OPEN → range; nullable-OPEN → a [VALIDATE] field (never invented).
   • The C1 reconcile ripples through the same store to C4 / C5 / C6.
   • boardReport (C6) and the exceptions panel (C5) read the SAME
     complianceExceptions object — the independence item is never duplicated.
   • v3 changes: light/dark theme; C2 duty-at-stake hero; C3 ageing bar +
     enriched dispatch rows + exceptions-first tabs; C5 live-only metric strip,
     board-pack pulled out, escalation promoted, dynamic committee rollup.
   ────────────────────────────────────────────────────────────────────────── */

/* ── theme ──────────────────────────────────────────────────────────────── */
const PALETTES = {
  dark: {
    bg: "#0a0e1a", bgGrad: "#0c1120", panel: "#111726", panelAlt: "#0e1422",
    raise: "#161e30", border: "#1e2740", borderSoft: "#19223a",
    text: "#e7ebf3", dim: "#8d99b0", faint: "#5c6885", open: "#64748b",
    green: "#34d399", greenDim: "#16352c", greenEdge: "#1f5d49",
    amber: "#f5b945", amberDim: "#3a2f12", amberEdge: "#6b521d",
    red: "#f87171", redDim: "#3a1d20", redEdge: "#7a3236",
    accent: "#5cc2f0", accentDim: "#14334a", accentEdge: "#2d6b91",
    chipBg: "#0c1322", onAccent: "#04121d",
  },
  light: {
    bg: "#e9edf4", bgGrad: "#eef2f8", panel: "#ffffff", panelAlt: "#f5f7fb",
    raise: "#eef2f8", border: "#e1e6ef", borderSoft: "#eaeef6",
    text: "#101727", dim: "#55617a", faint: "#94a0b4", open: "#64748b",
    green: "#0f9d6b", greenDim: "#e7f7f0", greenEdge: "#bde7d4",
    amber: "#b9810f", amberDim: "#fbf2df", amberEdge: "#ecd6a6",
    red: "#d6454c", redDim: "#fcebec", redEdge: "#f1c0c4",
    accent: "#2b7fb0", accentDim: "#e6f1f9", accentEdge: "#b9d9ee",
    chipBg: "#f1f4f9", onAccent: "#ffffff",
  },
};
const ThemeCtx = createContext(PALETTES.light);
const useC = () => useContext(ThemeCtx);

const TAG_LABEL = {
  SOURCED: "SOURCED", VERIFIED: "VERIFIED", ILLUSTRATIVE: "ILLUSTRATIVE",
  ASSUMPTION: "ASSUMPTION", LION_VALIDATE: "LION-VALIDATE", OPEN: "OPEN", PXTY: "PXTY",
};
const tagDot = (C, tag) => ({
  SOURCED: C.green, VERIFIED: C.green, ILLUSTRATIVE: C.amber,
  ASSUMPTION: C.faint, LION_VALIDATE: C.faint, OPEN: C.open, PXTY: "transparent",
}[tag] || C.faint);

const fmtRs = (amt) => {
  if (amt == null) return "—";
  if (Math.abs(amt) >= 1e9) return `Rs ${(amt / 1e9).toFixed(2).replace(/\.00$/, "")}bn`;
  if (Math.abs(amt) >= 1e6) return `Rs ${(amt / 1e6).toFixed(amt % 1e6 ? 1 : 0)}M`;
  return `Rs ${amt.toLocaleString("en-US")}`;
};

/* ── store · seeded from §7.75 v2 mock data · boots pre-reconcile (AT_RISK) ── */
function initialStore() {
  return {
    company: {
      exciseBase: { amount: 64.8, unit: "bn", tag: "SOURCED" },
      penaltyPct: { value: 100, tag: "SOURCED" },
      totalTaxes: { amount: 97, unit: "bn", tag: "SOURCED" },
      fy2026Revenue: { amount: 132.4, unit: "bn", tag: "SOURCED" },
      capacityHL: { low: 2.0, high: 2.4, unit: "M hL", tag: "OPEN" },
      exposureBand: { low: 160, high: 650, unit: "M", tag: "ILLUSTRATIVE" }, // single home: C1 + C5
    },
    reconciliation: {
      streams: [
        { key: "packagedVolume", label: "Packaged volume", value: 12400, unit: "units", status: "AGREE", src: "SAP ECC" },
        { key: "stickersConsumed", label: "Tickets / stickers", value: 11900, unit: "units", status: "MISMATCH", src: "Excise portal" },
        { key: "permitsIssued", label: "Permits issued", value: 12400, unit: "units", status: "AGREE", src: "Permit system" },
        { key: "dutyDeclared", label: "Duty declared", value: null, unit: "", status: "AGREE", src: "Excise return" },
      ],
      nodeState: "AT_RISK",
      expectedDuty: 79.36,
      variance: {
        amount: 3.2, unit: "M", status: "AT_RISK", unaccounted: 500, tag: "ILLUSTRATIVE",
        rootCause:
          "12,400 units packaged on dispatch window D-1184, but only 11,900 per-bottle tickets (Fool Proof Stickers) logged against issued permits — 500 units unaccounted → ~Rs 3.2M duty at risk.",
      },
      detection: { value: "2 min vs ~weeks manual", tag: "ASSUMPTION" },
    },
    batch: {
      id: "B-2271", src: "Brewery Mgmt — Krones API",
      panel: [["Microbiological", "PASS"], ["Sensory panel", "PASS"], ["ABV verification", "FAIL"]],
      abv: { lab: 4.8, label: 4.6, excise: 4.6, delta: 0.2, tag: "ILLUSTRATIVE" },
      // duty-at-stake: the CFO-native summary. ILLUSTRATIVE; exact figure a [VALIDATE].
      dutyAtStake: {
        amount: 0.6, unit: "M", tag: "ILLUSTRATIVE",
        basis: "0.2 ABV pts × this batch’s duty-able volume (≈50,000 L) × duty rate — illustrative",
      },
    },
    receivables: {
      fy2025: 5410000000, fy2026: 4070000000, trend: "IMPROVING", yoyPct: 25,
      badDebt: 23000000, badDebtPctOfBook: 0.6, creditDays: null, eclAgeing: "OPEN",
      distributorPoints: { low: 1130, high: 4000, tag: "OPEN" },
      // ageing — wholly ILLUSTRATIVE; sums to 4.07bn. Jehan confirms real buckets.
      ageing: [
        { bucket: "Current 0–30d", amt: 3300000000, pct: 81, sev: "LOW" },
        { bucket: "31–60d", amt: 520000000, pct: 13, sev: "MED" },
        { bucket: "60+d", amt: 250000000, pct: 6, sev: "HIGH" },
      ],
      src: "SFA + SAP ECC",
    },
    loads: [
      { id: "L-442", date: "14 May", value: 4200000, pos: "Distributor #903 — Nugegoda depot (Western)", fl: "FL-3", status: "LAPSED", state: "BLOCKED", sltda: "NA" },
      { id: "L-441", date: "14 May", value: 3100000, pos: "Distributor #57 — Kandy depot (Central) · on-trade chain", fl: "FL-3", status: "EXPIRING", state: "FLAGGED", sltda: "LAPSED" },
      { id: "L-440", date: "15 May", value: 2600000, pos: "Distributor #218 — Borella depot (Western)", fl: "FL-3", status: "VALID", state: "CLEAR", sltda: "NA" },
    ],
    riskMatrix: {
      rows: [
        { id: "rm-supply", category: "Global events and supply chain disruptions", catTag: "SOURCED", domain: "D9",
          inherent: { i: "HIGH", l: "MED" }, control: null, residual: "MED",
          mitigation: "Diversified multi-region sourcing; strategic inventory reserves; local-supplier development.",
          kri: null, trend: "STABLE" },
        { id: "rm-local", category: "Local market and economic risks", catTag: "SOURCED", domain: "D7",
          inherent: { i: "HIGH", l: "MED" }, control: null, residual: "MED",
          mitigation: "Macroeconomic monitoring; pricing strategy; operational-efficiency / cost management.",
          kri: { label: "Contingent liabilities (bank guarantees, FY2026, from Rs 4,070M)", value: fmtRs(3514000000), tag: "SOURCED", status: "WATCH" }, trend: "STABLE" },
        { id: "rm-tax", category: "Taxation and tariffs", catTag: "SOURCED", domain: "D1",
          inherent: { i: "HIGH", l: "HIGH" }, control: "Duty", residual: "MED",
          mitigation: "Corporate tax 40%→45% from 1 Apr 2025 (income tax +39% YoY); live four-way excise tie-out catches duty variance pre-emptively.",
          kri: { label: "Total taxes to Government (FY2025)", value: fmtRs(97000000000), tag: "SOURCED", status: "WATCH" }, trend: "STABLE" },
        { id: "rm-recv", category: "Receivables / distributor-credit exposure", catTag: "ILLUSTRATIVE", domain: "D7",
          inherent: { i: "MED", l: "MED" }, control: "Dispatch", residual: "LOW",
          mitigation: "Tight credit control (small bad-debt book); early-warning on credit-days; receivables falling Rs 5.41bn → 4.07bn.",
          kri: { label: "Group trade receivables (FY2026)", value: fmtRs(4070000000), tag: "SOURCED", status: "OK" }, trend: "IMPROVING" },
        { id: "rm-bcp", category: "Business continuity / flood risk", catTag: "ILLUSTRATIVE", domain: "D10",
          inherent: { i: "HIGH", l: "LOW" }, control: null, residual: "MED",
          mitigation: "Riverbank-plant flood history; Swift Water Rescue training; business-interruption insurance; Site B / DR under consideration.",
          kri: null, trend: "STABLE" },
      ],
      escalation: { steps: ["Risk register", "Board", "Quarterly ESG Committee"], tag: "SOURCED" },
    },
    complianceExceptions: [
      { id: "ce-independence", ruleRef: "7.10.2(a)", title: "Minimum independent directors",
        gap: "2 of 3 required", disclosureRef: "LION/CSE/ANN/2024/NS/04 (1 Feb 2024)",
        cure: "Ajay Baliga, Independent NED, appointed 2 Feb 2024", status: "CURED",
        raisedOn: "Nov 2023", curedOn: "2 Feb 2024", tag: "VERIFIED" },
    ],
    boardReport: {
      sectionOrder: ["Board-affairs compliance statement", "Audit Committee", "RPT Review Committee", "Auditor sign-off"],
      committees: [
        { id: "cm-audit", name: "Audit Committee", remit: "Oversee the financial-reporting process, internal control, the audit process and compliance with laws — the Companies Act No. 07 of 2007 and the SEC Act No. 19 of 2021 — and review internal controls and risk against Sri Lanka Accounting Standards.", remitTag: "VERIFIED",
          composition: ["A.S. Amaratunga (Chair, NE/Ind)", "A.J. Alles (NE/Ind)", "D.R.P. Goonetilleke (NE)"], meetingCount: null },
        { id: "cm-rem", name: "Remuneration Committee", remit: "Maintain formal, transparent policies for Director and CEO compensation to attract, retain and develop talent.", remitTag: "VERIFIED",
          composition: ["A.B. Baliga (Chair, NE/Ind)"], meetingCount: null },
        { id: "cm-rpt", name: "Related Party Transactions Review Committee", remit: "Maintain policy and process per the CSE RPT rules for identification, classification and end-to-end reporting of related party transactions.", remitTag: "VERIFIED",
          composition: ["A.S. Amaratunga (Chair)", "A.B. Baliga", "D.R.P. Goonetilleke"], meetingCount: null },
        { id: "cm-nom", name: "Nominations & Governance Committee", remit: "Formal procedure to appoint / re-elect directors; succession planning; Board composition; recommend the corporate-governance framework.", remitTag: "VERIFIED",
          composition: ["Functions via Carson Cumberbatch PLC"], meetingCount: null },
      ],
      complianceTable: [{ ruleRef: "7.10.2(a)", requirement: "Minimum number of independent directors", exceptionRef: "ce-independence" }],
      assurance: {
        companiesAct: "These financial statements are in compliance with the requirements of the Companies Act No. 07 of 2007.",
        thanks: "Grateful thanks for the counsel and oversight of the Audit, Remuneration, Related Party Transactions Review, and Nominations & Governance Committees, and fellow Board members.",
        tag: "VERIFIED",
      },
    },
    evidence: {
      EXCISE: [
        { id: "e1", label: "Batch release + ABV trail — B-2271", from: "C2", status: "CHECKED", signedBy: "QA / Lab Manager", ts: "14 May 2026",
          records: ["ABV triple-check — lab 4.8% / label 4.6% / excise-basis 4.6%", "QC panel — micro PASS, sensory PASS, ABV flagged & resolved", "Release sign-off recorded against batch"] },
        { id: "e2", label: "Dispatch licence stamps — L-440 / L-441 / L-442", from: "C3", status: "CHECKED", signedBy: "Distribution / Commercial", ts: "15 May 2026",
          records: ["FL-3 licence check — L-440 valid · L-441 SLTDA flagged · L-442 lapsed (blocked)", "Distributor-tier depots — Western / Central", "Auto-block evidence captured on the lapsed-licence load"] },
        { id: "e3", label: "Transport-permit ↔ sticker tie-out — May 2026", from: "C1", status: "CHECKED", signedBy: "Excise desk", ts: "May 2026",
          records: ["Permits issued 12,400 vs tickets logged 11,900 — variance flagged", "Per-bottle ticket reconciliation (see C1)"] },
      ],
      SLSI: [
        { id: "s1", label: "Batch release records — May 2026", from: "C2", status: "CHECKED", signedBy: "QA", ts: "May 2026", records: ["Batch QC summary", "Release approvals log"] },
        { id: "s2", label: "ABV verification trail — B-2271", from: "C2", status: "CHECKED", signedBy: "QA / Lab", ts: "14 May 2026", records: ["ABV triple-check detail and sign-off"] },
      ],
      FCAU: [{ id: "f1", label: "Batch release + QC panel — May 2026", from: "C2", status: "CHECKED", signedBy: "QA", ts: "May 2026", records: ["QC panel results", "Food-safety checks"] }],
      CUSTOMS: [
        { id: "c1", label: "Duty declaration — May 2026", from: "C1", status: "CHECKED", signedBy: "Finance / Excise", ts: "May 2026", records: ["Excise return summary", "Duty computed on the ABV basis"] },
        { id: "c2", label: "Dispatch licence stamps — export loads", from: "C3", status: "CHECKED", signedBy: "Distribution", ts: "May 2026", records: ["Export-load licence checks (Maldives)"] },
      ],
      CEA: [{ id: "ce1", label: "Environmental monitoring records — May 2026", from: "C2", status: "CHECKED", signedBy: "EHS", ts: "May 2026", records: ["Effluent / emissions logs", "Environmental-permit status"] }],
      LABOUR: [{ id: "l1", label: "Safety training + incident log — May 2026", from: "C2", status: "CHECKED", signedBy: "HR / EHS", ts: "May 2026", records: ["Safety-training register", "Incident log for the period"] }],
    },
    posture: buildPosture(),
    // live-measures only (D16); board-pack lives in its own band, not here
    headlineMetrics: [
      { key: "exposure", label: "Excise exposure under live reconciliation", value: "Rs 160–650M", tag: "ILLUSTRATIVE", emphasis: "PRIMARY",
        note: "illustrative: assumed discrepancy rate × Rs 64.8bn excise base · same figure as C1" },
      { key: "receivablesExposure", label: "Receivables under live credit watch", value: fmtRs(4070000000), tag: "SOURCED", emphasis: "PRIMARY",
        note: "FY2026 · down ~25% YoY" },
      { key: "auditReady", label: "Regulators audit-ready", value: "6 / 6", tag: "SOURCED", emphasis: "PRIMARY",
        note: "evidence packs assemble on demand (C4)" },
    ],
  };
}

const REGS = [["EXCISE", "Excise"], ["SLSI", "SLSI"], ["FCAU", "FCAU"], ["CUSTOMS", "Customs"], ["CEA", "CEA"], ["LABOUR", "Labour"]];
const CTRLS = [["DUTY", "Duty"], ["QUALITY", "Quality"], ["DISPATCH", "Dispatch"], ["EVIDENCE", "Evidence"]];
function buildPosture() {
  const g = {};
  REGS.forEach(([r]) => CTRLS.forEach(([c]) => { g[`${r}|${c}`] = "OK"; }));
  g["EXCISE|DUTY"] = "ATTENTION";
  g["CUSTOMS|DISPATCH"] = "ATTENTION";
  ["SLSI|DUTY", "SLSI|DISPATCH", "FCAU|DUTY", "FCAU|DISPATCH", "CEA|DUTY", "CEA|QUALITY", "CEA|DISPATCH",
   "LABOUR|DUTY", "LABOUR|QUALITY", "LABOUR|DISPATCH", "CUSTOMS|QUALITY"].forEach((k) => (g[k] = "NA"));
  return g;
}
/* dynamic committee rollup — derives from the posture grid so the count matches
   the cells the CFO can see, and drops 2→1 when C1 reconciles. */
const ROLLUP_LABELS = {
  "EXCISE|DUTY": "Excise · Duty — four-way tie-out variance pending reconciliation",
  "CUSTOMS|DISPATCH": "Customs · Dispatch — lapsed-licence load L-442 blocked; manual resolution pending",
};
function rollupItems(posture) {
  return Object.entries(posture)
    .filter(([k, v]) => (v === "ATTENTION" || v === "BREACH") && ROLLUP_LABELS[k])
    .map(([k, v]) => ({ cell: k, label: ROLLUP_LABELS[k], severity: v === "BREACH" ? "HIGH" : "MED" }));
}

/* ── atoms ──────────────────────────────────────────────────────────────── */
function Chip({ tag }) {
  const C = useC();
  const label = TAG_LABEL[tag] || "ASSUMPTION";
  const dot = tagDot(C, tag);
  const ring = tag === "PXTY";
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide"
      style={{ background: C.chipBg, border: `1px solid ${C.borderSoft}`, color: C.dim }}>
      <span className="inline-flex h-1.5 w-1.5 items-center justify-center rounded-full"
        style={{ background: dot, border: ring ? `1px solid ${C.amber}` : "none" }} />
      {tag === "VERIFIED" && <CheckCircle2 size={9} color={C.green} />}
      {label}
    </span>
  );
}
function Range({ low, high, unit, prefix }) {
  const f = (n) => (n >= 1000 ? n.toLocaleString("en-US") : n);
  return <span className="tabular-nums">{prefix}{f(low)}–{f(high)}{unit ? ` ${unit}` : ""}</span>;
}
function ValidateField({ note = "validate on call" }) {
  const C = useC();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px]"
      style={{ background: C.chipBg, border: `1px dashed ${C.faint}`, color: C.faint }}>
      <span className="tabular-nums">—</span><span className="italic">{note}</span>
    </span>
  );
}
function Btn({ children, onClick, kind = "primary", icon: Icon, type = "button" }) {
  const C = useC();
  const styles =
    kind === "primary" ? { background: C.accent, color: C.onAccent, border: `1px solid ${C.accent}` }
    : kind === "ghost" ? { background: "transparent", color: C.dim, border: `1px solid ${C.border}` }
    : { background: C.raise, color: C.text, border: `1px solid ${C.border}` };
  return (
    <button type={type} onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{ ...styles, outlineColor: C.accent }}>
      {Icon && <Icon size={15} strokeWidth={2.2} />}{children}
    </button>
  );
}
function Card({ children, style, className = "" }) {
  const C = useC();
  return <div className={`rounded-xl ${className}`} style={{ background: C.panel, border: `1px solid ${C.border}`, ...style }}>{children}</div>;
}
function Eyebrow({ children }) {
  const C = useC();
  return <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.faint }}>{children}</div>;
}
function SourceLabel({ src, managed }) {
  const C = useC();
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.faint }}>
      <Database size={12} /> {src}
      {managed && <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accentEdge}` }}>wired during onboarding</span>}
    </span>
  );
}
function SevPill({ level }) {
  const C = useC();
  const col = { HIGH: C.red, MED: C.amber, LOW: C.green }[level];
  return <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
    style={{ background: C.chipBg, color: col, border: `1px solid ${col}55` }}>{level}</span>;
}
function Trend({ dir }) {
  const C = useC();
  if (dir === "IMPROVING") return <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.green }}><TrendingDown size={13} /> improving</span>;
  if (dir === "WORSENING") return <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.red }}><TrendingUp size={13} /> worsening</span>;
  return <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.dim }}><Minus size={13} /> stable</span>;
}

/* ── C1 · Four-Way Reconciliation (HERO) ────────────────────────────────── */
function StreamCard({ s }) {
  const C = useC();
  const danger = s.status === "MISMATCH";
  return (
    <div className="rounded-lg p-3.5" style={{ background: C.panelAlt, border: `1px solid ${danger ? C.amberEdge : C.borderSoft}` }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: C.dim }}>{s.label}</span>
        {danger ? <AlertTriangle size={14} color={C.amber} /> : <CheckCircle2 size={14} color={C.green} />}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="tabular-nums text-2xl font-semibold tracking-tight" style={{ color: danger ? C.amber : C.text }}>
          {s.value === null ? "—" : s.value.toLocaleString("en-US")}
        </span>
        <span className="text-[11px]" style={{ color: C.faint }}>{s.value === null ? "pending" : s.unit}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: C.faint }}><Database size={10} />{s.src}</div>
    </div>
  );
}
function HeroC1({ store, varianceDisp, investigating, setInvestigating, onReconcile }) {
  const C = useC();
  const r = store.reconciliation;
  const atRisk = r.nodeState === "AT_RISK";
  const eb = store.company.exposureBand;
  const co = store.company;
  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Eyebrow>Excise exposure under live reconciliation</Eyebrow>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="tabular-nums text-3xl font-semibold tracking-tight">Rs <Range low={eb.low} high={eb.high} unit={eb.unit} /></span>
              <Chip tag={eb.tag} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {[["excise paid", `Rs ${co.exciseBase.amount}${co.exciseBase.unit}`, co.exciseBase.tag],
              ["taxes to govt", `Rs ${co.totalTaxes.amount}${co.totalTaxes.unit}`, co.totalTaxes.tag],
              ["FY2026 revenue", `Rs ${co.fy2026Revenue.amount}${co.fy2026Revenue.unit}`, co.fy2026Revenue.tag],
              ["penalty", `up to ${co.penaltyPct.value}%`, co.penaltyPct.tag]].map(([k, v, tag]) => (
              <div key={k}>
                <div className="text-[11px]" style={{ color: C.faint }}>{k}</div>
                <div className="flex items-center gap-1.5"><span className="tabular-nums font-medium" style={{ color: C.dim }}>{v}</span><Chip tag={tag} /></div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">{r.streams.map((s) => <StreamCard key={s.key} s={s} />)}</div>
          <div className="flex items-center justify-center gap-3 lg:flex-col">
            <ArrowRight className="hidden lg:block" size={18} color={C.faint} />
            <div className="rounded-xl px-5 py-4 text-center" style={{ background: atRisk ? C.redDim : C.greenDim, border: `1px solid ${atRisk ? C.redEdge : C.greenEdge}`, minWidth: 150 }}>
              <Eyebrow>Tie-out</Eyebrow>
              <div className="mt-1 text-sm font-semibold" style={{ color: atRisk ? C.red : C.green }}>{atRisk ? "AT RISK" : "RECONCILED"}</div>
              <div className="mt-1 text-[11px]" style={{ color: C.faint }}>expected duty</div>
              <div className="tabular-nums text-[13px] font-medium" style={{ color: C.dim }}>Rs {r.expectedDuty}M</div>
            </div>
            <ArrowRight className="hidden lg:block" size={18} color={C.faint} />
          </div>
          <div className="rounded-xl p-4 lg:w-64" style={{ background: atRisk ? C.redDim : C.greenDim, border: `1px solid ${atRisk ? C.redEdge : C.greenEdge}` }}>
            <div className="flex items-center gap-2">
              {atRisk ? <AlertTriangle size={15} color={C.red} /> : <CheckCircle2 size={15} color={C.green} />}
              <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: atRisk ? C.red : C.green }}>{atRisk ? "Variance" : "Reconciled"}</span>
            </div>
            <div className="mt-2 tabular-nums text-4xl font-bold tracking-tight" style={{ color: atRisk ? C.red : C.green }}>
              Rs {varianceDisp === 0 ? "0" : `${varianceDisp.toFixed(varianceDisp < 1 ? 2 : 1)}M`}
            </div>
            <div className="mt-1 text-[11px]" style={{ color: atRisk ? C.red : C.green }}>{atRisk ? "AT RISK" : "evidence generated"}</div>
            <div className="mt-2"><Chip tag="ILLUSTRATIVE" /></div>
            {atRisk && !investigating && <div className="mt-3"><Btn onClick={() => setInvestigating(true)} icon={ChevronRight}>Investigate</Btn></div>}
          </div>
        </div>

        {investigating && atRisk && (
          <div className="mt-4 rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.accentEdge}` }}>
            <Eyebrow>Root cause</Eyebrow>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.dim }}>{r.variance.rootCause}</p>
            <div className="mt-3 flex items-center gap-3">
              <Btn onClick={onReconcile} icon={CheckCircle2}>Reconcile</Btn>
              <Btn kind="ghost" onClick={() => setInvestigating(false)}>Dismiss</Btn>
            </div>
          </div>
        )}
        {!atRisk && (
          <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm" style={{ background: C.greenDim, border: `1px solid ${C.greenEdge}`, color: C.green }}>
            <FileCheck size={15} /> Reconciled — duty-defensibility evidence generated; added to the Excise pack (C4) and the board report (C6).
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
        <Activity size={13} /> Detection latency: <span style={{ color: C.dim }}>{r.detection.value}</span> <Chip tag={r.detection.tag} />
      </div>
    </div>
  );
}

/* ── C2 · Quality Gate + ABV — duty-at-stake hero, QA panel demoted ─────── */
function ScreenC2({ store }) {
  const C = useC();
  const b = store.batch;
  const d = b.dutyAtStake;
  const chain = [["Lab-measured", b.abv.lab, false], ["Label-declared", b.abv.label, true], ["Excise-basis", b.abv.excise, true]];
  return (
    <div className="space-y-5">
      {/* thesis line — promoted from footnote: why this is a CFO problem */}
      <div className="flex items-start gap-2 text-[13px]" style={{ color: C.dim }}>
        <ArrowRight size={15} color={C.accent} className="mt-0.5 shrink-0" />
        <span>This batch’s ABV <span style={{ color: C.text }}>is</span> the duty basis — a quality number becomes a tax misstatement on the excise return. The gate stops it before it ships.</span>
      </div>

      {/* DUTY AT STAKE — the CFO-native hero summary (no "% passed") */}
      <Card className="p-5" style={{ borderColor: C.amberEdge }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: C.amberDim, border: `1px solid ${C.amberEdge}` }}><Coins size={20} color={C.amber} /></div>
            <div>
              <Eyebrow>Duty at stake — caught at the gate</Eyebrow>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="tabular-nums text-3xl font-semibold tracking-tight" style={{ color: C.text }}>≈ Rs {d.amount}{d.unit}</span>
                <Chip tag={d.tag} />
              </div>
              <div className="mt-1 text-[12px]" style={{ color: C.dim }}>+{b.abv.delta.toFixed(1)} ABV pts understated → duty understated. Held before it reached the excise return.</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold self-start" style={{ background: C.redDim, color: C.red, border: `1px solid ${C.redEdge}` }}><Lock size={13} /> HELD · B-{b.id.split("-")[1]}</span>
        </div>
        <div className="mt-3 text-[11px]" style={{ color: C.faint }}>Basis: {d.basis}. Exact figure <ValidateField note="Jehan to confirm" /></div>
      </Card>

      {/* ABV triple-check — the centrepiece, read as a chain to the duty basis */}
      <Card className="p-5">
        <div className="flex items-center justify-between"><Eyebrow>ABV triple-check</Eyebrow><Chip tag={b.abv.tag} /></div>
        <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          {chain.map(([label, val, isBasis], i) => (
            <React.Fragment key={label}>
              {i > 0 && <ArrowRight size={16} color={C.faint} className="mx-auto rotate-90 sm:rotate-0" />}
              <div className="flex-1 rounded-lg px-3.5 py-3" style={{ background: C.panelAlt, border: `1px solid ${i === 0 ? C.amberEdge : C.borderSoft}` }}>
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: C.faint }}>{label}{isBasis && <span className="rounded px-1 py-0.5 text-[9px] font-semibold" style={{ background: C.chipBg, color: C.dim }}>DUTY BASIS</span>}</div>
                <div className="tabular-nums text-2xl font-semibold" style={{ color: i === 0 ? C.amber : C.text }}>{val.toFixed(1)}%</div>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: C.red }}>
          <AlertTriangle size={14} /> The lab number ({b.abv.lab}%) disagrees with the duty basis ({b.abv.excise}%) by {b.abv.delta.toFixed(1)} pts.
        </div>
      </Card>

      {/* QA panel — demoted to one quiet row, all three lines kept for granularity */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
            <FlaskConical size={14} /> Release checks · Batch {b.id}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
            {b.panel.map(([name, st]) => (
              <span key={name} className="inline-flex items-center gap-1.5" style={{ color: st === "PASS" ? C.green : C.amber }}>
                {st === "PASS" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}{name}
              </span>
            ))}
            <span style={{ color: C.faint }}>· release gated on ABV</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-2 text-[12px]" style={{ color: C.faint }}>
        <SourceLabel src={b.src} /> · validation logic runs live <Chip tag="ASSUMPTION" />
      </div>
    </div>
  );
}

/* ── C3 · Dispatch + Receivables — ageing, enriched rows, exceptions-first ─ */
function AgeingBar({ ageing }) {
  const C = useC();
  const col = { LOW: C.green, MED: C.amber, HIGH: C.red };
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full" style={{ background: C.panelAlt }}>
        {ageing.map((a) => <div key={a.bucket} style={{ width: `${a.pct}%`, background: col[a.sev] }} />)}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ageing.map((a) => (
          <div key={a.bucket} className="rounded-md px-2.5 py-2" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: C.faint }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: col[a.sev] }} />{a.bucket}</div>
            <div className="tabular-nums text-[13px] font-semibold" style={{ color: C.text }}>{fmtRs(a.amt)}</div>
            <div className="tabular-nums text-[10px]" style={{ color: C.faint }}>{a.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ScreenC3({ store }) {
  const C = useC();
  const rec = store.receivables;
  const dp = rec.distributorPoints;
  const [filter, setFilter] = useState("ALL");
  const meta = {
    VALID: { color: C.green, label: "FL valid" },
    EXPIRING: { color: C.amber, label: "SLTDA lapsed" },
    LAPSED: { color: C.red, label: "Licence expired" },
  };
  const TABS = [["ALL", "All"], ["CLEARED", "Cleared"], ["FLAGGED", "Needs attention"], ["BLOCKED", "Blocked"]];
  const shown = store.loads.filter((l) =>
    filter === "ALL" ? true
    : filter === "CLEARED" ? l.state !== "BLOCKED"
    : filter === "FLAGGED" ? l.state === "FLAGGED"
    : l.state === "BLOCKED");
  const blocked = store.loads.find((l) => l.state === "BLOCKED");

  return (
    <div className="space-y-5">
      {/* receivables — CFO-native top half */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}><Wallet size={20} color={C.accent} /></div>
            <div>
              <Eyebrow>Group trade receivables · order-to-cash</Eyebrow>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="tabular-nums text-3xl font-semibold tracking-tight">{fmtRs(rec.fy2026)}</span>
                <Chip tag="SOURCED" />
                <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: C.green }}><TrendingDown size={13} /> down ~{rec.yoyPct}% YoY</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>Credit-days (DSO) <ValidateField /></div>
            <div className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>ECL ageing <Chip tag="OPEN" /></div>
          </div>
        </div>

        {/* two reassurance stats, not prose */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg px-4 py-3" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
            <div className="text-[11px]" style={{ color: C.faint }}>Book shrinking</div>
            <div className="mt-0.5 flex items-center gap-2"><span className="tabular-nums text-[15px] font-semibold" style={{ color: C.text }}>{fmtRs(rec.fy2025)} → {fmtRs(rec.fy2026)}</span><Chip tag="SOURCED" /></div>
            <div className="text-[11px]" style={{ color: C.faint }}>less cash exposed year on year</div>
          </div>
          <div className="rounded-lg px-4 py-3" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
            <div className="text-[11px]" style={{ color: C.faint }}>Write-off risk</div>
            <div className="mt-0.5 flex items-center gap-2"><span className="tabular-nums text-[15px] font-semibold" style={{ color: C.text }}>bad-debt {fmtRs(rec.badDebt)}</span><Chip tag="SOURCED" /></div>
            <div className="text-[11px]" style={{ color: C.faint }}>&lt;{rec.badDebtPctOfBook}% of book — tight credit control</div>
          </div>
        </div>

        {/* ageing — the missing CFO signal (wholly illustrative) */}
        <div className="mt-4 rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Layers size={14} color={C.dim} /><Eyebrow>Ageing</Eyebrow></div>
            <Chip tag="ILLUSTRATIVE" />
          </div>
          <div className="mt-3"><AgeingBar ageing={rec.ageing} /></div>
          <div className="mt-2 text-[11px]" style={{ color: C.faint }}>Illustrative split — Jehan to confirm actual buckets on the call.</div>
        </div>
      </Card>

      {/* dispatch — proves the control; exceptions-first */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Truck size={18} color={C.dim} />
            <div>
              <div className="text-sm font-semibold">Dispatch queue · distributor tier</div>
              <div className="text-[11px]" style={{ color: C.faint }}>Distribution / Commercial · FL-3 wholesale</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: C.dim }}>
            Distribution points <span className="tabular-nums" style={{ color: C.text }}><Range low={dp.low} high={dp.high} /></span><Chip tag="OPEN" />
          </div>
        </div>

        {/* filter tabs */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TABS.map(([k, label]) => {
            const on = filter === k;
            const count = k === "ALL" ? store.loads.length : store.loads.filter((l) => k === "CLEARED" ? l.state !== "BLOCKED" : l.state === k).length;
            return (
              <button key={k} onClick={() => setFilter(k)} className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
                style={{ background: on ? C.raise : "transparent", color: on ? C.text : C.dim, border: `1px solid ${on ? C.border : "transparent"}` }}>
                {label} <span className="tabular-nums" style={{ color: C.faint }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 space-y-2.5">
          {shown.map((l) => {
            const m = meta[l.status];
            const isBlocked = l.state === "BLOCKED";
            return (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3" style={{ background: C.panelAlt, border: `1px solid ${isBlocked ? C.redEdge : C.borderSoft}` }}>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-[12px] font-semibold" style={{ color: C.faint }}>{l.id}</span>
                  <div>
                    <div className="text-[13px]" style={{ color: C.text }}>{l.pos}</div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: C.faint }}>
                      <span className="inline-flex items-center gap-1"><CalendarDays size={11} />{l.date}</span>
                      <span className="tabular-nums">{fmtRs(l.value)}</span>
                      <span>{l.fl}{l.sltda === "LAPSED" ? " · SLTDA chain lapsed" : ""}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: m.color }}>
                    {l.status === "VALID" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{m.label}
                  </span>
                  {isBlocked
                    ? <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold" style={{ background: C.redDim, color: C.red, border: `1px solid ${C.redEdge}` }}><Lock size={12} /> Dispatch blocked</span>
                    : l.state === "FLAGGED"
                    ? <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px]" style={{ background: C.amberDim, color: C.amber, border: `1px solid ${C.amberEdge}` }}>Cleared — flagged</span>
                    : <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px]" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}>Cleared</span>}
                </div>
              </div>
            );
          })}
          {shown.length === 0 && <div className="rounded-lg px-4 py-6 text-center text-[12px]" style={{ color: C.faint, background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>No loads in this view.</div>}
        </div>

        {/* bridge line — makes dispatch a CFO concern */}
        {blocked && (
          <div className="mt-4 flex items-start gap-2 rounded-lg p-3.5" style={{ background: C.redDim, border: `1px solid ${C.redEdge}` }}>
            <Wallet size={15} color={C.red} className="mt-0.5" />
            <div>
              <div className="text-[12px] font-semibold" style={{ color: C.red }}>{fmtRs(blocked.value)} of dispatch held this period on a lapsed licence <span className="font-normal"><Chip tag="ILLUSTRATIVE" /></span></div>
              <div className="text-[12px]" style={{ color: C.dim }}>Blocked dispatch is also blocked revenue — the control protects cash, not just compliance.</div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <SourceLabel src={rec.src} managed />
          <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.faint }}>
            <span style={{ color: C.green }}>Validate + expiry alert</span> live · auto-block <span className="rounded px-1.5 py-0.5" style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accentEdge}` }}>wired during onboarding</span>
          </span>
        </div>
      </Card>
    </div>
  );
}

/* ── C4 · Evidence Packs ────────────────────────────────────────────────── */
function ScreenC4({ store, justAppended, onToast }) {
  const C = useC();
  const [sel, setSel] = useState("EXCISE");
  const [open, setOpen] = useState(null);
  const items = store.evidence[sel] || [];
  const total = items.length;
  const current = items.filter((it) => it.status !== "PENDING").length;
  const ready = current === total;
  const regLabel = REGS.find(([k]) => k === sel)[1];
  return (
    <div className="space-y-5">
      <Card className="p-5">
        {/* regulator tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {REGS.map(([k, label]) => (
            <button key={k} onClick={() => { setSel(k); setOpen(null); }} className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
              style={{ background: sel === k ? C.raise : "transparent", color: sel === k ? C.text : C.dim, border: `1px solid ${sel === k ? C.border : "transparent"}` }}>{label}</button>
          ))}
        </div>

        {/* completeness header + the real actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
          <div>
            <Eyebrow>{regLabel} pack</Eyebrow>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="tabular-nums text-lg font-semibold tracking-tight" style={{ color: C.text }}>{current}/{total} items current</span>
              {ready
                ? <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}><CheckCircle2 size={12} /> Audit-ready</span>
                : <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: C.amberDim, color: C.amber, border: `1px solid ${C.amberEdge}` }}><Clock size={12} /> {total - current} pending</span>}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: C.faint }}>If {regLabel} requested an audit today, this file is already built.</div>
          </div>
          <div className="flex items-center gap-2">
            <Btn kind="neutral" icon={Download} onClick={() => onToast(`${regLabel} pack exported — regulator-ready PDF`)}>Export pack (PDF)</Btn>
            <Btn kind="ghost" icon={Share2} onClick={() => onToast(`${regLabel} pack shared with the regulator desk`)}>Share</Btn>
          </div>
        </div>

        {/* items — click to drill into the actual records */}
        <div className="mt-4 space-y-2">
          {items.map((it) => {
            const isNew = justAppended && it.id === "appended";
            const expanded = open === it.id;
            const pending = it.status === "PENDING";
            return (
              <div key={it.id} className="rounded-lg" style={{ background: C.panelAlt, border: `1px solid ${isNew ? C.greenEdge : C.borderSoft}` }}>
                <button onClick={() => setOpen(expanded ? null : it.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <ChevronRight size={14} color={C.faint} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                    {pending ? <Clock size={15} color={C.amber} /> : <CheckCircle2 size={15} color={C.green} />}
                    <span className="text-[13px]" style={{ color: C.text }}>{it.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isNew && <span className="rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}>just added</span>}
                    <span className="rounded px-2 py-0.5 text-[10px]" style={{ background: C.chipBg, color: C.faint, border: `1px solid ${C.borderSoft}` }}>from {it.from}</span>
                  </div>
                </button>
                {expanded && (
                  <div className="border-t px-4 py-3" style={{ borderColor: C.borderSoft }}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.faint }}>Underlying records</div>
                    <ul className="mt-1.5 space-y-1">
                      {it.records.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: C.dim }}>
                          <CheckCircle2 size={12} color={C.green} className="mt-0.5 shrink-0" />{r}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]" style={{ color: C.faint }}>
                      <span>Signed: <span style={{ color: C.dim }}>{it.signedBy}</span></span><span>·</span>
                      <span>{it.ts}</span><span>·</span>
                      <span>lineage <span style={{ color: C.dim }}>{it.from}</span></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: C.faint }}>
          <ArrowRight size={13} /> Every assembled pack feeds the monthly board report (C6). Prep baseline ~weeks → on-demand <Chip tag="ASSUMPTION" />
        </div>
      </Card>
    </div>
  );
}


/* ── C5 · Risk Matrix + Compliance Exceptions ───────────────────────────── */
function MetricTile({ m }) {
  const C = useC();
  return (
    <div className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <div className="text-[11px] leading-snug" style={{ color: C.faint }}>{m.label}</div>
      <div className="mt-1 tabular-nums text-xl font-semibold tracking-tight" style={{ color: C.text }}>{m.value}</div>
      <div className="mt-1.5"><Chip tag={m.tag} /></div>
      {m.note && <div className="mt-1.5 text-[10px] leading-snug" style={{ color: C.faint }}>{m.note}</div>}
    </div>
  );
}
function ScreenC5({ store }) {
  const C = useC();
  const rm = store.riskMatrix;
  const exc = store.complianceExceptions[0];
  const items = rollupItems(store.posture);
  const cellColor = { OK: C.green, ATTENTION: C.amber, BREACH: C.red };
  return (
    <div className="space-y-5">
      {/* board-pack lever — pulled OUT of the metric strip into its own band */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4" style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}>
        <div className="flex items-center gap-3">
          <FileText size={18} color={C.accent} />
          <div>
            <div className="text-[13px] font-semibold" style={{ color: C.text }}>Monthly board pack: multi-day build → one-click export</div>
            <div className="text-[11px]" style={{ color: C.dim }}>The audit-committee grind becomes a review. Days saved confirmed on the call.</div>
          </div>
        </div>
        <div className="flex items-center gap-2"><Chip tag="LION_VALIDATE" /><span className="text-[11px]" style={{ color: C.accent }}>→ generate on C6</span></div>
      </div>

      {/* live-measures-only strip (what we measure, not what we save) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {store.headlineMetrics.map((m) => <MetricTile key={m.key} m={m} />)}
      </div>

      {/* risk matrix */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><Scale size={16} color={C.dim} /><span className="text-sm font-semibold">Risk matrix</span></div>
        {/* escalation — promoted from footnote to a labelled band */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg p-3" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.faint }}>Escalation path</span>
          {rm.escalation.steps.map((s, i) => (
            <span key={s} className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>{i > 0 && <ChevronRight size={13} color={C.faint} />}{s}</span>
          ))}
          <span className="ml-1"><Chip tag={rm.escalation.tag} /></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr style={{ color: C.faint }}>{["Risk", "Inherent", "Control", "Residual", "KRI", "Trend"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rm.rows.map((row) => (
                <tr key={row.id} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <td className="px-2 py-3 align-top" style={{ maxWidth: 260 }}>
                    <div className="flex items-center gap-1.5"><span style={{ color: C.text }}>{row.category}</span><Chip tag={row.catTag} /></div>
                    <div className="mt-1 text-[11px] leading-snug" style={{ color: C.faint }}>{row.mitigation}</div>
                    <div className="mt-1 text-[10px]" style={{ color: C.faint }}>↳ {row.domain}</div>
                  </td>
                  <td className="px-2 py-3 align-top"><div className="flex items-center gap-1"><SevPill level={row.inherent.i} /><span style={{ color: C.faint }}>/</span><SevPill level={row.inherent.l} /></div><div className="mt-1 text-[10px]" style={{ color: C.faint }}>impact / likelihood</div></td>
                  <td className="px-2 py-3 align-top" style={{ color: row.control ? C.dim : C.faint }}>{row.control || "—"}</td>
                  <td className="px-2 py-3 align-top"><SevPill level={row.residual} /><div className="mt-1"><Chip tag="ILLUSTRATIVE" /></div></td>
                  <td className="px-2 py-3 align-top" style={{ maxWidth: 200 }}>
                    {row.kri ? (
                      <div>
                        <div className="flex items-center gap-1.5"><span className="tabular-nums font-medium" style={{ color: C.text }}>{row.kri.value}</span><Chip tag={row.kri.tag} /></div>
                        <div className="mt-0.5 text-[10px]" style={{ color: C.faint }}>{row.kri.label}</div>
                      </div>
                    ) : <span style={{ color: C.faint }}>—</span>}
                  </td>
                  <td className="px-2 py-3 align-top"><Trend dir={row.trend} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* compliance exceptions — the shared object (same as C6) */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><ShieldAlert size={16} color={C.dim} /><span className="text-sm font-semibold">Compliance exceptions</span><span className="text-[11px]" style={{ color: C.faint }}>· every 7.10 / Section-9 line tracked</span></div>
        <ExceptionRow exc={exc} />
        <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: C.faint }}><CheckCircle2 size={12} color={C.green} /> Governance posture: green — the one exception in the period was disclosed and cured. The same record drives the board report (C6).</div>
      </Card>

      {/* posture grid + dynamic rollup */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><LayoutGrid size={16} color={C.dim} /><span className="text-sm font-semibold">Posture — if every regulator walked in tomorrow</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[12px]">
            <thead><tr><th></th>{REGS.map(([k, l]) => <th key={k} className="px-2 py-1.5 font-medium" style={{ color: C.faint }}>{l}</th>)}</tr></thead>
            <tbody>
              {CTRLS.map(([ck, cl]) => (
                <tr key={ck}>
                  <td className="px-2 py-1.5 text-left font-medium" style={{ color: C.dim }}>{cl}</td>
                  {REGS.map(([rk]) => {
                    const st = store.posture[`${rk}|${ck}`];
                    return (
                      <td key={rk} className="px-2 py-1.5">
                        <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md" style={{ background: st === "NA" ? "transparent" : C.panelAlt, border: st === "NA" ? `1px solid ${C.borderSoft}` : `1px solid ${st === "OK" ? C.greenEdge : st === "ATTENTION" ? C.amberEdge : C.redEdge}` }}>
                          {st !== "NA" && (st === "OK" ? <CheckCircle2 size={13} color={cellColor[st]} /> : <AlertTriangle size={13} color={cellColor[st]} />)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* rollup now matches the grid: lists every flagged cell, count is dynamic */}
        <div className="mt-4 rounded-lg p-3.5" style={{ background: items.length ? C.amberDim : C.greenDim, border: `1px solid ${items.length ? C.amberEdge : C.greenEdge}` }}>
          <div className="flex items-center gap-2">
            {items.length ? <AlertTriangle size={15} color={C.amber} /> : <CheckCircle2 size={15} color={C.green} />}
            <span className="text-[12px] font-semibold" style={{ color: items.length ? C.amber : C.green }}>
              {items.length} item{items.length !== 1 ? "s" : ""} → Audit Committee remit
            </span>
          </div>
          {items.map((it) => <div key={it.cell} className="mt-1 pl-6 text-[12px]" style={{ color: C.dim }}>{it.label}</div>)}
          {!items.length && <div className="mt-1 pl-6 text-[12px]" style={{ color: C.dim }}>All cells clear this period.</div>}
        </div>
      </Card>
    </div>
  );
}
function ExceptionRow({ exc }) {
  const C = useC();
  const cured = exc.status === "CURED";
  return (
    <div className="rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${cured ? C.greenEdge : C.redEdge}` }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-[11px] font-semibold" style={{ color: C.faint }}>{exc.ruleRef}</span>
          <span className="text-[13px]" style={{ color: C.text }}>{exc.title}</span>
          <Chip tag={exc.tag} />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium line-through" style={{ background: C.redDim, color: C.red, border: `1px solid ${C.redEdge}` }}>{exc.gap}</span>
          <ArrowRight size={13} color={C.faint} />
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}><CheckCircle2 size={12} /> Cured · compliant</span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-[11px] sm:grid-cols-2" style={{ color: C.faint }}>
        <div>Disclosure: <span style={{ color: C.dim }}>{exc.disclosureRef}</span></div>
        <div>Cure: <span style={{ color: C.dim }}>{exc.cure}</span></div>
        <div>Raised: <span style={{ color: C.dim }}>{exc.raisedOn}</span></div>
        <div>Cured: <span style={{ color: C.dim }}>{exc.curedOn}</span></div>
      </div>
    </div>
  );
}

/* ── C6 · Board / Audit-Committee Report Generator (CO-HERO) ─────────────── */
function ScreenC6({ store, generated, generating, onGenerate, onToast }) {
  const C = useC();
  const br = store.boardReport;
  const exc = store.complianceExceptions[0];
  if (!generated) {
    return (
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}><FileText size={20} color={C.accent} /></div>
            <div className="flex-1">
              <Eyebrow>Monthly Audit-Committee Report · May 2026</Eyebrow>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">The pack assembles itself from what the plant already produced.</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.dim }}>
                Committee remits, composition, the 7.10 / Section-9 compliance lines, the risk matrix and the closing assurance — all derived from the live store. The multi-day team scramble becomes a one-click review.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {br.sectionOrder.map((s, i) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px]" style={{ background: C.panelAlt, color: C.dim, border: `1px solid ${C.borderSoft}` }}>
                    <span className="tabular-nums" style={{ color: C.faint }}>{i + 1}</span>{s}
                  </span>
                ))}
              </div>
              <div className="mt-5"><Btn onClick={onGenerate} icon={generating ? Activity : FileText}>{generating ? "Assembling pack…" : "Generate report"}</Btn></div>
            </div>
          </div>
        </Card>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: C.faint }}><Activity size={13} /> Board-pack prep: <span style={{ color: C.dim }}>multi-day build → one-click export</span> <Chip tag="LION_VALIDATE" /></div>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}><FileText size={18} color={C.accent} /></div>
            <div>
              <div className="text-sm font-semibold">Audit-Committee Report — May 2026</div>
              <div className="text-[11px]" style={{ color: C.faint }}>Lion Brewery (Ceylon) PLC · derived from live data · board-ready</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn kind="neutral" icon={Download} onClick={() => onToast("Exported — board-ready PDF")}>Export PDF</Btn>
            <Btn icon={Mail} onClick={() => onToast("Emailed to the Audit Committee")}>Email to committee</Btn>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {br.sectionOrder.map((s, i) => <span key={s} className="rounded px-2 py-0.5 text-[10px]" style={{ background: C.chipBg, color: C.faint, border: `1px solid ${C.borderSoft}` }}>{i + 1}. {s}</span>)}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><Users size={16} color={C.dim} /><span className="text-sm font-semibold">Board committees</span><span className="text-[11px]" style={{ color: C.faint }}>(function via Carson Cumberbatch PLC)</span></div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {br.committees.map((cm) => (
            <div key={cm.id} className="rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex items-center justify-between"><span className="text-[13px] font-semibold" style={{ color: C.text }}>{cm.name}</span><span className="text-[10px]" style={{ color: C.faint }}>via Carson Cumberbatch PLC</span></div>
              <p className="mt-1.5 text-[11px] leading-snug" style={{ color: C.dim }}>{cm.remit} <Chip tag={cm.remitTag} /></p>
              <div className="mt-2 flex flex-wrap gap-1.5">{cm.composition.map((p) => <span key={p} className="rounded px-2 py-0.5 text-[10px]" style={{ background: C.panel, color: C.dim, border: `1px solid ${C.borderSoft}` }}>{p}</span>)}</div>
              <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: C.faint }}>Meetings this year: <ValidateField note="Jehan to confirm" /> · matters <Chip tag="OPEN" /></div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><ClipboardCheck size={16} color={C.dim} /><span className="text-sm font-semibold">Listing Rule 7.10 / Section-9 compliance</span></div>
        <ExceptionRow exc={exc} />
        <div className="mt-2.5 text-[11px]" style={{ color: C.faint }}>Full line-by-line table structure tracked; remaining lines <Chip tag="OPEN" /> pending the FY2025 governance report.</div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><Scale size={16} color={C.dim} /><span className="text-sm font-semibold">Risk matrix</span><span className="text-[11px]" style={{ color: C.faint }}>· reused from C5</span></div>
        <div className="space-y-2">
          {store.riskMatrix.rows.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3.5 py-2.5" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex items-center gap-2"><span className="text-[12px]" style={{ color: C.text }}>{row.category}</span><Chip tag={row.catTag} /></div>
              <div className="flex items-center gap-3 text-[11px]" style={{ color: C.faint }}>residual <SevPill level={row.residual} />{row.kri && <span className="tabular-nums" style={{ color: C.dim }}>{row.kri.value}</span>}<Trend dir={row.trend} /></div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: C.faint }}>
          <span className="uppercase tracking-wider">Escalation</span>
          {store.riskMatrix.escalation.steps.map((s, i) => <span key={s} className="flex items-center gap-2" style={{ color: C.dim }}>{i > 0 && <ChevronRight size={12} color={C.faint} />}{s}</span>)}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2"><ShieldCheck size={16} color={C.green} /><span className="text-sm font-semibold">Closing assurance</span><Chip tag={br.assurance.tag} /></div>
        <p className="text-[13px] leading-relaxed" style={{ color: C.dim }}>{br.assurance.companiesAct}</p>
        <p className="mt-2 text-[13px] italic leading-relaxed" style={{ color: C.dim }}>“{br.assurance.thanks}”</p>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-[13px] italic" style={{ color: C.faint }}>The monthly grind becomes a review.</div>
        <Btn kind="ghost" icon={RotateCcw} onClick={() => onGenerate(true)}>Regenerate</Btn>
      </div>
    </div>
  );
}

/* ── shell ──────────────────────────────────────────────────────────────── */
const NAV = [
  ["C1", "Four-Way Reconciliation", Receipt],
  ["C2", "Quality Gate + ABV", Gauge],
  ["C3", "Dispatch + Receivables", Truck],
  ["C4", "Evidence Packs", FolderCheck],
  ["C5", "Risk Matrix + Exceptions", LayoutGrid],
  ["C6", "Board Report", FileText],
];

export default function KeystonePrototype() {
  const [mode, setMode] = useState("light");
  const C = PALETTES[mode];
  const [store, setStore] = useState(initialStore);
  const [screen, setScreen] = useState("C1");
  const [investigating, setInvestigating] = useState(false);
  const [varianceDisp, setVarianceDisp] = useState(3.2);
  const [rippled, setRippled] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);
  const reduced = useRef(false);

  useEffect(() => { reduced.current = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  function reconcile() {
    setInvestigating(false);
    if (reduced.current) setVarianceDisp(0);
    else {
      const start = performance.now(), from = 3.2, dur = 850;
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVarianceDisp(+(from * (1 - eased)).toFixed(2));
        if (p < 1) requestAnimationFrame(tick); else setVarianceDisp(0);
      };
      requestAnimationFrame(tick);
    }
    setStore((prev) => {
      const next = structuredClone(prev);
      const stk = next.reconciliation.streams.find((s) => s.key === "stickersConsumed");
      stk.status = "AGREE"; stk.value = 12400;
      next.reconciliation.nodeState = "RECONCILED";
      next.reconciliation.variance.status = "CLEARED"; next.reconciliation.variance.amount = 0;
      if (!next.evidence.EXCISE.some((e) => e.id === "appended"))
        next.evidence.EXCISE.push({ id: "appended", label: "Four-way reconciliation — May 2026", from: "C1", status: "CHECKED", signedBy: "Keystone (auto)", ts: "live",
          records: ["Packaged 12,400 = permits 12,400 = tickets 12,400", "Expected duty Rs 79.36M reconciled · variance Rs 0", "Duty-defensibility evidence generated automatically"] });
      next.posture["EXCISE|DUTY"] = "OK"; // ripples to C5 rollup: 2 items → 1
      return next;
    });
    setRippled(true);
  }
  function generateReport(regen) {
    if (regen) { setReportGenerated(false); return; }
    setGenerating(true);
    const finish = () => { setGenerating(false); setReportGenerated(true); setToast("Report generated"); };
    if (reduced.current) finish(); else setTimeout(finish, 650);
  }
  function reset() {
    setStore(initialStore()); setInvestigating(false); setVarianceDisp(3.2);
    setRippled(false); setReportGenerated(false); setGenerating(false); setScreen("C1");
  }

  const active = NAV.find((n) => n[0] === screen);
  return (
    <ThemeCtx.Provider value={C}>
      <div className="min-h-screen w-full" style={{ background: C.bg, color: C.text, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif" }}>
        <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
          <aside className="border-b lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r" style={{ borderColor: C.border, background: C.bgGrad }}>
            <div className="flex items-center gap-2.5 px-5 py-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}><ShieldCheck size={17} color={C.accent} /></div>
              <div>
                <div className="text-[15px] font-semibold tracking-tight">Keystone</div>
                <img src={LION_LOGO} alt="Lion Brewery (Ceylon) PLC" title="Lion Brewery (Ceylon) PLC" style={{ height: 17, width: "auto", marginTop: 3 }} />
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
              {NAV.map(([k, label, Icon]) => {
                const isActive = screen === k;
                const badge = (k === "C4" || k === "C5" || k === "C6") && rippled;
                const isHero = k === "C1" || k === "C6";
                return (
                  <button key={k} onClick={() => setScreen(k)}
                    className="group flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 lg:w-full"
                    style={{ background: isActive ? C.raise : "transparent", color: isActive ? C.text : C.dim, border: `1px solid ${isActive ? C.border : "transparent"}` }}>
                    <span className="tabular-nums text-[10px] font-semibold" style={{ color: isActive ? C.accent : C.faint }}>{k}</span>
                    <Icon size={15} color={isActive ? C.accent : C.faint} />
                    <span className="flex-1 truncate font-medium">{label}</span>
                    {isHero && <span className="rounded px-1 py-0.5 text-[9px] font-semibold" style={{ background: C.accentDim, color: C.accent }}>HERO</span>}
                    {badge && <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.green }} />}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 px-5 py-6 sm:px-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <Eyebrow>{`Keystone · ${active[1]}`}</Eyebrow>
                <h1 className="mt-1 text-lg font-semibold tracking-tight">{active[1]}</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px]" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}>Period: May 2026 <ChevronDown size={13} /></span>
                <button onClick={() => setMode(mode === "light" ? "dark" : "light")} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium focus:outline-none focus-visible:ring-2" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}>
                  {mode === "light" ? <Moon size={13} /> : <Sun size={13} />}{mode === "light" ? "Dark" : "Light"}
                </button>
                <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium focus:outline-none focus-visible:ring-2" style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}>
                  <RotateCcw size={13} /> Reset demo
                </button>
              </div>
            </div>

            {screen === "C1" && <HeroC1 store={store} varianceDisp={varianceDisp} investigating={investigating} setInvestigating={setInvestigating} onReconcile={reconcile} />}
            {screen === "C2" && <ScreenC2 store={store} />}
            {screen === "C3" && <ScreenC3 store={store} />}
            {screen === "C4" && <ScreenC4 store={store} justAppended={rippled} onToast={setToast} />}
            {screen === "C5" && <ScreenC5 store={store} />}
            {screen === "C6" && <ScreenC6 store={store} generated={reportGenerated} generating={generating} onGenerate={generateReport} onToast={setToast} />}

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] leading-relaxed" style={{ color: C.faint }}>
              Figures carry their provenance; most are now sourced.
              <span className="inline-flex items-center gap-1"><span style={{ color: C.green }}>●</span> Sourced / verified</span>
              <span className="inline-flex items-center gap-1"><span style={{ color: C.amber }}>●</span> Illustrative</span>
              <span className="inline-flex items-center gap-1"><span style={{ color: C.faint }}>●</span> Assumption / validate</span>
              <span className="inline-flex items-center gap-1"><span style={{ color: C.open }}>●</span> Open range</span>
            </p>
          </main>
        </div>

        {toast && (
          <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2" role="status">
            <div className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium shadow-lg" style={{ background: C.panel, color: C.text, border: `1px solid ${C.greenEdge}` }}>
              <CheckCircle2 size={15} color={C.green} /> {toast}
            </div>
          </div>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}
