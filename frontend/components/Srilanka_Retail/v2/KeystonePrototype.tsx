"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileCheck,
  Activity,
  Gauge,
  Truck,
  FolderCheck,
  LayoutGrid,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  FlaskConical,
  Receipt,
  FileText,
  Mail,
  Download,
  Users,
  Scale,
  Wallet,
  Database,
  ClipboardCheck,
  TrendingDown,
  TrendingUp,
  Minus,
  ShieldAlert,
} from "lucide-react";
import { KeystoneThemeProvider, ThemeToggle } from "@/components/Srilanka_Retail/primitives/theme";

/* ──────────────────────────────────────────────────────────────────────────
   KEYSTONE v2 — Lion Brewery (Ceylon) PLC
   The monthly board / audit-committee grind becomes a review.
   • Single source of truth: one in-memory store seeded from §7.75 v2 mock data.
   • Source chips render FROM data sourceTag — no number without its chip.
   • OPEN → range; nullable-OPEN → a [VALIDATE] field (never invented).
   • The C1 reconcile ripples through the same store to C4 / C5 / C6.
   • boardReport (C6) and the exceptions panel (C5) read the SAME
     complianceExceptions object — the independence item is never duplicated.
   ────────────────────────────────────────────────────────────────────────── */

const C = {
  bg: "var(--ks-bg)",
  bgGrad: "var(--ks-bg-grad)",
  panel: "var(--ks-panel)",
  panelAlt: "var(--ks-panel-alt)",
  raise: "var(--ks-raise)",
  border: "var(--ks-border)",
  borderSoft: "var(--ks-border-soft)",
  text: "var(--ks-text)",
  dim: "var(--ks-dim)",
  faint: "var(--ks-faint)",
  green: "var(--ks-green)",
  greenDim: "var(--ks-green-dim)",
  greenEdge: "var(--ks-green-edge)",
  amber: "var(--ks-amber)",
  amberDim: "var(--ks-amber-dim)",
  amberEdge: "var(--ks-amber-edge)",
  red: "var(--ks-red)",
  redDim: "var(--ks-red-dim)",
  redEdge: "var(--ks-red-edge)",
  accent: "var(--ks-accent)",
  accentDim: "var(--ks-accent-dim)",
  accentEdge: "var(--ks-accent-edge)",
  chipBg: "var(--ks-chip-bg)",
  btnPrimaryFg: "var(--ks-btn-primary-fg)",
} as const;

type SourceTag =
  | "SOURCED"
  | "VERIFIED"
  | "ILLUSTRATIVE"
  | "ASSUMPTION"
  | "LION_VALIDATE"
  | "OPEN"
  | "PXTY";

type ScreenId = "C1" | "C2" | "C3" | "C4" | "C5" | "C6";

const TAG: Record<
  SourceTag,
  { dot: string; label: string; check?: boolean; ring?: string }
> = {
  SOURCED: { dot: C.green, label: "SOURCED", check: false },
  VERIFIED: { dot: C.green, label: "VERIFIED", check: true },
  ILLUSTRATIVE: { dot: C.amber, label: "ILLUSTRATIVE", check: false },
  ASSUMPTION: { dot: C.faint, label: "ASSUMPTION", check: false },
  LION_VALIDATE: { dot: C.faint, label: "LION-VALIDATE", check: false },
  OPEN: { dot: C.faint, label: "OPEN", check: false },
  PXTY: { dot: "transparent", ring: C.amber, label: "PXTY", check: false },
};

function fmtRs(amt: number | null | undefined): string {
  if (amt == null) return "—";
  if (Math.abs(amt) >= 1e9) return `Rs ${(amt / 1e9).toFixed(2).replace(/\.00$/, "")}bn`;
  if (Math.abs(amt) >= 1e6) return `Rs ${(amt / 1e6).toFixed(amt % 1e6 ? 1 : 0)}M`;
  return `Rs ${amt.toLocaleString("en-US")}`;
}

const REGS: [string, string][] = [
  ["EXCISE", "Excise"],
  ["SLSI", "SLSI"],
  ["FCAU", "FCAU"],
  ["CUSTOMS", "Customs"],
  ["CEA", "CEA"],
  ["LABOUR", "Labour"],
];
const CTRLS: [string, string][] = [
  ["DUTY", "Duty"],
  ["QUALITY", "Quality"],
  ["DISPATCH", "Dispatch"],
  ["EVIDENCE", "Evidence"],
];

function buildPosture(): Record<string, "OK" | "ATTENTION" | "NA"> {
  const g: Record<string, "OK" | "ATTENTION" | "NA"> = {};
  REGS.forEach(([r]) => CTRLS.forEach(([c]) => { g[`${r}|${c}`] = "OK"; }));
  g["EXCISE|DUTY"] = "ATTENTION";
  g["CUSTOMS|DISPATCH"] = "ATTENTION";
  [
    "SLSI|DUTY", "SLSI|DISPATCH", "FCAU|DUTY", "FCAU|DISPATCH", "CEA|DUTY", "CEA|QUALITY", "CEA|DISPATCH",
    "LABOUR|DUTY", "LABOUR|QUALITY", "LABOUR|DISPATCH", "CUSTOMS|QUALITY",
  ].forEach((k) => { g[k] = "NA"; });
  return g;
}

function initialStore() {
  return {
    company: {
      exciseBase: { amount: 64.8, unit: "bn", tag: "SOURCED" as SourceTag },
      penaltyPct: { value: 100, tag: "SOURCED" as SourceTag },
      totalTaxes: { amount: 97, unit: "bn", tag: "SOURCED" as SourceTag },
      fy2026Revenue: { amount: 132.4, unit: "bn", tag: "SOURCED" as SourceTag },
      capacityHL: { low: 2.0, high: 2.4, unit: "M hL", tag: "OPEN" as SourceTag },
      exposureBand: { low: 160, high: 650, unit: "M", tag: "ILLUSTRATIVE" as SourceTag },
    },
    dataSources: {
      SAP_ECC: { label: "SAP ECC (legacy, non-HANA)", state: "INTEGRATED", managed: true },
      SFA: { label: "SFA (~4,000 dist. pts)", state: "ONBOARDING", managed: true },
      BREWERY_MGMT_KRONES_API: { label: "Brewery Mgmt — Krones API", state: "API_AVAILABLE", managed: true },
    },
    reconciliation: {
      streams: [
        { key: "packagedVolume", label: "Packaged volume", value: 12400, unit: "units", status: "AGREE" as const, src: "SAP ECC" },
        { key: "stickersConsumed", label: "Tickets / stickers", value: 11900, unit: "units", status: "MISMATCH" as const, src: "Excise portal" },
        { key: "permitsIssued", label: "Permits issued", value: 12400, unit: "units", status: "AGREE" as const, src: "Permit system" },
        { key: "dutyDeclared", label: "Duty declared", value: null as number | null, unit: "", status: "AGREE" as const, src: "Excise return" },
      ],
      nodeState: "AT_RISK" as "AT_RISK" | "RECONCILED",
      expectedDuty: 79.36,
      variance: {
        amount: 3.2,
        unit: "M",
        status: "AT_RISK" as "AT_RISK" | "CLEARED",
        unaccounted: 500,
        tag: "ILLUSTRATIVE" as SourceTag,
        rootCause:
          "12,400 units packaged on dispatch window D-1184, but only 11,900 per-bottle tickets (Fool Proof Stickers) logged against issued permits — 500 units unaccounted → ~Rs 3.2M duty at risk.",
      },
      detection: { value: "2 min vs ~weeks manual", tag: "ASSUMPTION" as SourceTag },
    },
    batch: {
      id: "B-2271",
      gateState: "HELD",
      src: "Brewery Mgmt — Krones API",
      panel: [["Microbiological", "PASS"], ["Sensory panel", "PASS"], ["ABV verification", "FAIL"]] as [string, string][],
      abv: { lab: 4.8, label: 4.6, excise: 4.6, delta: 0.2, tag: "ILLUSTRATIVE" as SourceTag },
    },
    loads: [
      { id: "L-440", pos: "Distributor #218 — Borella depot (Western)", fl: "FL-3", status: "VALID" as const, sltda: "NA" as const },
      { id: "L-441", pos: "Distributor #57 — Kandy depot (Central) · on-trade chain", fl: "FL-3", status: "EXPIRING" as const, sltda: "LAPSED" as const },
      { id: "L-442", pos: "Distributor #903 — Nugegoda depot (Western)", fl: "FL-3", status: "LAPSED" as const, sltda: "NA" as const },
    ],
    receivables: {
      fy2025: 5410000000,
      fy2026: 4070000000,
      trend: "IMPROVING" as const,
      badDebt: 23000000,
      creditDays: null as number | null,
      eclAgeing: "OPEN" as SourceTag,
      distributorPoints: { low: 1130, high: 4000, tag: "OPEN" as SourceTag },
      src: "SFA + SAP ECC",
    },
    riskMatrix: {
      rows: [
        {
          id: "rm-supply",
          category: "Global events and supply chain disruptions",
          catTag: "SOURCED" as SourceTag,
          domain: "D9",
          inherent: { i: "HIGH" as const, l: "MED" as const },
          control: null,
          residual: "MED" as const,
          mitigation: "Diversified multi-region sourcing; strategic inventory reserves; local-supplier development.",
          kri: null,
          trend: "STABLE" as const,
        },
        {
          id: "rm-local",
          category: "Local market and economic risks",
          catTag: "SOURCED" as SourceTag,
          domain: "D7",
          inherent: { i: "HIGH" as const, l: "MED" as const },
          control: null,
          residual: "MED" as const,
          mitigation: "Macroeconomic monitoring; pricing strategy; operational-efficiency / cost management.",
          kri: { label: "Contingent liabilities (bank guarantees, FY2026, from Rs 4,070M)", value: fmtRs(3514000000), tag: "SOURCED" as SourceTag, status: "WATCH" as const },
          trend: "STABLE" as const,
        },
        {
          id: "rm-tax",
          category: "Taxation and tariffs",
          catTag: "SOURCED" as SourceTag,
          domain: "D1",
          inherent: { i: "HIGH" as const, l: "HIGH" as const },
          control: "Duty",
          residual: "MED" as const,
          mitigation: "Corporate tax 40%→45% from 1 Apr 2025 (income tax +39% YoY); live four-way excise tie-out catches duty variance pre-emptively.",
          kri: { label: "Total taxes to Government (FY2025)", value: fmtRs(97000000000), tag: "SOURCED" as SourceTag, status: "WATCH" as const },
          trend: "STABLE" as const,
        },
        {
          id: "rm-recv",
          category: "Receivables / distributor-credit exposure",
          catTag: "ILLUSTRATIVE" as SourceTag,
          domain: "D7",
          inherent: { i: "MED" as const, l: "MED" as const },
          control: "Dispatch",
          residual: "LOW" as const,
          mitigation: "Tight credit control (small bad-debt book); early-warning on credit-days; receivables falling Rs 5.41bn → 4.07bn.",
          kri: { label: "Group trade receivables (FY2026)", value: fmtRs(4070000000), tag: "SOURCED" as SourceTag, status: "OK" as const },
          trend: "IMPROVING" as const,
        },
        {
          id: "rm-bcp",
          category: "Business continuity / flood risk",
          catTag: "ILLUSTRATIVE" as SourceTag,
          domain: "D10",
          inherent: { i: "HIGH" as const, l: "LOW" as const },
          control: null,
          residual: "MED" as const,
          mitigation: "Riverbank-plant flood history; Swift Water Rescue training; business-interruption insurance; Site B / DR under consideration.",
          kri: null,
          trend: "STABLE" as const,
        },
      ],
      escalation: { steps: ["Risk register", "Board", "Quarterly ESG Committee"], tag: "SOURCED" as SourceTag },
    },
    complianceExceptions: [
      {
        id: "ce-independence",
        ruleRef: "7.10.2(a)",
        title: "Minimum independent directors",
        gap: "2 of 3 required",
        disclosureRef: "LION/CSE/ANN/2024/NS/04 (1 Feb 2024)",
        cure: "Ajay Baliga, Independent NED, appointed 2 Feb 2024",
        status: "CURED" as const,
        raisedOn: "Nov 2023",
        curedOn: "2 Feb 2024",
        tag: "VERIFIED" as SourceTag,
      },
    ],
    boardReport: {
      sectionOrder: ["Board-affairs compliance statement", "Audit Committee", "RPT Review Committee", "Auditor sign-off"],
      committees: [
        {
          id: "cm-audit",
          name: "Audit Committee",
          remit: "Oversee the financial-reporting process, internal control, the audit process and compliance with laws — the Companies Act No. 07 of 2007 and the SEC Act No. 19 of 2021 — and review internal controls and risk against Sri Lanka Accounting Standards.",
          remitTag: "VERIFIED" as SourceTag,
          composition: ["A.S. Amaratunga (Chair, NE/Ind)", "A.J. Alles (NE/Ind)", "D.R.P. Goonetilleke (NE)"],
          meetingCount: null,
        },
        {
          id: "cm-rem",
          name: "Remuneration Committee",
          remit: "Maintain formal, transparent policies for Director and CEO compensation to attract, retain and develop talent.",
          remitTag: "VERIFIED" as SourceTag,
          composition: ["A.B. Baliga (Chair, NE/Ind)"],
          meetingCount: null,
        },
        {
          id: "cm-rpt",
          name: "Related Party Transactions Review Committee",
          remit: "Maintain policy and process per the CSE RPT rules for identification, classification and end-to-end reporting of related party transactions.",
          remitTag: "VERIFIED" as SourceTag,
          composition: ["A.S. Amaratunga (Chair)", "A.B. Baliga", "D.R.P. Goonetilleke"],
          meetingCount: null,
        },
        {
          id: "cm-nom",
          name: "Nominations & Governance Committee",
          remit: "Formal procedure to appoint / re-elect directors; succession planning; Board composition; recommend the corporate-governance framework.",
          remitTag: "VERIFIED" as SourceTag,
          composition: ["Functions via Carson Cumberbatch PLC"],
          meetingCount: null,
        },
      ],
      complianceTable: [{ ruleRef: "7.10.2(a)", requirement: "Minimum number of independent directors", exceptionRef: "ce-independence" }],
      assurance: {
        companiesAct: "These financial statements are in compliance with the requirements of the Companies Act No. 07 of 2007.",
        thanks: "Grateful thanks for the counsel and oversight of the Audit, Remuneration, Related Party Transactions Review, and Nominations & Governance Committees, and fellow Board members.",
        tag: "VERIFIED" as SourceTag,
      },
    },
    evidence: {
      EXCISE: [
        { id: "e1", label: "Batch release + ABV trail — B-2271", from: "C2" },
        { id: "e2", label: "Dispatch licence stamps — L-440 / L-441 / L-442", from: "C3" },
        { id: "e3", label: "Transport-permit ↔ sticker tie-out — May 2026", from: "C1" },
      ],
      SLSI: [
        { id: "s1", label: "Batch release records — May 2026", from: "C2" },
        { id: "s2", label: "ABV verification trail — B-2271", from: "C2" },
      ],
      FCAU: [{ id: "f1", label: "Batch release + QC panel — May 2026", from: "C2" }],
      CUSTOMS: [
        { id: "c1", label: "Duty declaration — May 2026", from: "C1" },
        { id: "c2", label: "Dispatch licence stamps — export loads", from: "C3" },
      ],
      CEA: [{ id: "ce1", label: "Environmental monitoring records — May 2026", from: "C2" }],
      LABOUR: [{ id: "l1", label: "Safety training + incident log — May 2026", from: "C2" }],
    },
    posture: buildPosture(),
    committee: [{ cell: "CUSTOMS|DISPATCH", severity: "HIGH", label: "Customs · Dispatch — lapsed-licence load L-442 flagged; manual resolution pending" }],
    headlineMetrics: [
      { key: "boardReportPrepTime", label: "Monthly board pack", value: "multi-day → one-click", tag: "LION_VALIDATE" as SourceTag, emphasis: "PRIMARY" as const },
      { key: "exposure", label: "Excise exposure under live reconciliation", value: "Rs 160–650M", tag: "ILLUSTRATIVE" as SourceTag, emphasis: "PRIMARY" as const },
      { key: "receivablesExposure", label: "Receivables under live credit watch", value: fmtRs(4070000000), tag: "SOURCED" as SourceTag, emphasis: "PRIMARY" as const },
      { key: "auditReady", label: "Regulators audit-ready", value: "6 / 6", tag: "SOURCED" as SourceTag, emphasis: "SUPPORTING" as const },
      { key: "teamDays", label: "Senior team-days returned / yr", value: "~150–300", tag: "ASSUMPTION" as SourceTag, emphasis: "SUPPORTING" as const },
      { key: "detection", label: "Gap-to-flag latency", value: "months → days", tag: "ASSUMPTION" as SourceTag, emphasis: "SUPPORTING" as const },
    ],
  };
}

type Store = ReturnType<typeof initialStore>;

/* ── atoms ──────────────────────────────────────────────────────────────── */

function Chip({ tag }: { tag: SourceTag }) {
  const t = TAG[tag] || TAG.ASSUMPTION;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide"
      style={{ background: C.chipBg, border: `1px solid ${C.borderSoft}`, color: C.dim }}
    >
      <span
        className="inline-flex h-1.5 w-1.5 items-center justify-center rounded-full"
        style={{ background: t.dot, border: t.ring ? `1px solid ${t.ring}` : "none" }}
      />
      {t.check && <CheckCircle2 size={9} color={C.green} />}
      {t.label}
    </span>
  );
}

function Range({ low, high, unit, prefix = "" }: { low: number; high: number; unit?: string; prefix?: string }) {
  const f = (n: number) => (n >= 1000 ? n.toLocaleString("en-US") : n);
  return (
    <span className="tabular-nums">
      {prefix}{f(low)}–{f(high)}{unit ? ` ${unit}` : ""}
    </span>
  );
}

function ValidateField({ note = "validate on call" }: { note?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px]"
      style={{ background: C.chipBg, border: `1px dashed ${C.faint}`, color: C.faint }}
    >
      <span className="tabular-nums">—</span>
      <span className="italic">{note}</span>
    </span>
  );
}

function Btn({
  children,
  onClick,
  kind = "primary",
  icon: Icon,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: "primary" | "ghost" | "neutral";
  icon?: LucideIcon;
  type?: "button" | "submit";
}) {
  const styles =
    kind === "primary"
      ? { background: C.accent, color: C.btnPrimaryFg, border: `1px solid ${C.accent}` }
      : kind === "ghost"
        ? { background: "transparent", color: C.dim, border: `1px solid ${C.border}` }
        : { background: C.raise, color: C.text, border: `1px solid ${C.border}` };
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{ ...styles, outlineColor: C.accent }}
    >
      {Icon && <Icon size={15} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

function Card({ children, style, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ background: C.panel, border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.faint }}>
      {children}
    </div>
  );
}

function SourceLabel({ src, managed }: { src: string; managed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.faint }}>
      <Database size={12} /> {src}
      {managed && (
        <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accentEdge}` }}>
          wired during onboarding
        </span>
      )}
    </span>
  );
}

const SEV = { HIGH: C.red, MED: C.amber, LOW: C.green };

function SevPill({ level }: { level: string }) {
  const color = SEV[level as keyof typeof SEV] ?? C.dim;
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
      style={{ background: C.chipBg, color, border: `1px solid ${color}55` }}
    >
      {level}
    </span>
  );
}

function Trend({ dir }: { dir: string }) {
  if (dir === "IMPROVING") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.green }}>
        <TrendingDown size={13} /> improving
      </span>
    );
  }
  if (dir === "WORSENING") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.red }}>
        <TrendingUp size={13} /> worsening
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: C.dim }}>
      <Minus size={13} /> stable
    </span>
  );
}

/* ── C1 · Four-Way Reconciliation (HERO) ────────────────────────────────── */

function StreamCard({ s }: { s: Store["reconciliation"]["streams"][number] }) {
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
      <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: C.faint }}>
        <Database size={10} />
        {s.src}
      </div>
    </div>
  );
}

function HeroC1({
  store,
  varianceDisp,
  investigating,
  setInvestigating,
  onReconcile,
}: {
  store: Store;
  varianceDisp: number;
  investigating: boolean;
  setInvestigating: (v: boolean) => void;
  onReconcile: () => void;
}) {
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
              <span className="tabular-nums text-3xl font-semibold tracking-tight">
                Rs <Range low={eb.low} high={eb.high} unit={eb.unit} />
              </span>
              <Chip tag={eb.tag} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {(
              [
                ["excise paid", `Rs ${co.exciseBase.amount}${co.exciseBase.unit}`, co.exciseBase.tag],
                ["taxes to govt", `Rs ${co.totalTaxes.amount}${co.totalTaxes.unit}`, co.totalTaxes.tag],
                ["FY2026 revenue", `Rs ${co.fy2026Revenue.amount}${co.fy2026Revenue.unit}`, co.fy2026Revenue.tag],
                ["penalty", `up to ${co.penaltyPct.value}%`, co.penaltyPct.tag],
              ] as const
            ).map(([k, v, tag]) => (
              <div key={k}>
                <div className="text-[11px]" style={{ color: C.faint }}>{k}</div>
                <div className="flex items-center gap-1.5">
                  <span className="tabular-nums font-medium" style={{ color: C.dim }}>{v}</span>
                  <Chip tag={tag} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            {r.streams.map((s) => <StreamCard key={s.key} s={s} />)}
          </div>
          <div className="flex items-center justify-center gap-3 lg:flex-col">
            <ArrowRight className="hidden lg:block" size={18} color={C.faint} />
            <div
              className="rounded-xl px-5 py-4 text-center"
              style={{ background: atRisk ? C.redDim : C.greenDim, border: `1px solid ${atRisk ? C.redEdge : C.greenEdge}`, minWidth: 150 }}
            >
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
            {atRisk && !investigating && (
              <div className="mt-3">
                <Btn onClick={() => setInvestigating(true)} icon={ChevronRight}>Investigate</Btn>
              </div>
            )}
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

/* ── C2 · Quality Gate + ABV ─────────────────────────────────────────────── */

function ScreenC2({ store }: { store: Store }) {
  const b = store.batch;
  const rows: [string, number][] = [["Lab-measured", b.abv.lab], ["Label-declared", b.abv.label], ["Excise-basis", b.abv.excise]];
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical size={18} color={C.dim} />
            <div>
              <div className="text-sm font-semibold">Batch {b.id}</div>
              <div className="text-[11px]" style={{ color: C.faint }}>Release gate · QA / Laboratory Manager</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold" style={{ background: C.redDim, color: C.red, border: `1px solid ${C.redEdge}` }}>
            <Lock size={13} /> HELD
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {b.panel.map(([name, st]) => (
            <div key={name} className="flex items-center justify-between rounded-lg px-3.5 py-3" style={{ background: C.panelAlt, border: `1px solid ${st === "FAIL" ? C.amberEdge : C.borderSoft}` }}>
              <span className="text-[12px]" style={{ color: C.dim }}>{name}</span>
              {st === "PASS" ? (
                <span className="flex items-center gap-1 text-[12px]" style={{ color: C.green }}><CheckCircle2 size={14} /> Pass</span>
              ) : (
                <span className="flex items-center gap-1 text-[12px]" style={{ color: C.amber }}><AlertTriangle size={14} /> Fail</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
          <div className="flex items-center justify-between"><Eyebrow>ABV triple-check</Eyebrow><Chip tag={b.abv.tag} /></div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {rows.map(([label, val]) => (
              <div key={label} className="rounded-md px-3 py-2.5" style={{ background: C.panel, border: `1px solid ${C.borderSoft}` }}>
                <div className="text-[11px]" style={{ color: C.faint }}>{label}</div>
                <div className="tabular-nums text-xl font-semibold">{val.toFixed(1)}%</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: C.red }}>
            <AlertTriangle size={14} /> Mismatch {b.abv.delta.toFixed(1)} pts — lab {b.abv.lab}% vs label {b.abv.label}%.
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm" style={{ background: C.redDim, border: `1px solid ${C.redEdge}`, color: C.red }}>
          <Lock size={15} /> Release blocked — ABV must reconcile to label and duty before this batch can ship.
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
          <ArrowRight size={13} /> This ABV is the same figure that drives the duty basis on the Excise four-way tie-out (C1).
        </div>
      </Card>
      <div className="flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
        <SourceLabel src={b.src} /> · validation logic runs live <Chip tag="ASSUMPTION" />
      </div>
    </div>
  );
}

/* ── C3 · Dispatch + Receivables ─────────────────────────────────────────── */

function ScreenC3({ store }: { store: Store }) {
  const meta = {
    VALID: { color: C.green, label: "FL valid", icon: CheckCircle2 },
    EXPIRING: { color: C.amber, label: "SLTDA lapsed", icon: AlertTriangle },
    LAPSED: { color: C.red, label: "Licence expired", icon: AlertTriangle },
  };
  const rec = store.receivables;
  const dp = rec.distributorPoints;
  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wallet size={18} color={C.dim} />
            <div>
              <Eyebrow>Group trade receivables · order-to-cash</Eyebrow>
              <div className="mt-1 flex items-center gap-2.5">
                <span className="tabular-nums text-2xl font-semibold tracking-tight">{fmtRs(rec.fy2026)}</span>
                <Chip tag="SOURCED" />
                <Trend dir={rec.trend} />
              </div>
              <div className="mt-1 text-[11px]" style={{ color: C.faint }}>
                FY2025 {fmtRs(rec.fy2025)} → FY2026 {fmtRs(rec.fy2026)} · bad-debt charge {fmtRs(rec.badDebt)} (tight control)
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>Credit-days <ValidateField /></div>
            <div className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>ECL ageing <Chip tag="OPEN" /></div>
          </div>
        </div>
      </Card>

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
            Distribution points{" "}
            <span className="tabular-nums" style={{ color: C.text }}>
              <Range low={dp.low} high={dp.high} />
            </span>
            <Chip tag="OPEN" />
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {store.loads.map((l) => {
            const m = meta[l.status];
            const Icon = m.icon;
            return (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3" style={{ background: C.panelAlt, border: `1px solid ${l.status === "LAPSED" ? C.redEdge : C.borderSoft}` }}>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-[12px] font-semibold" style={{ color: C.faint }}>{l.id}</span>
                  <div>
                    <div className="text-[13px]" style={{ color: C.text }}>{l.pos}</div>
                    <div className="text-[11px]" style={{ color: C.faint }}>{l.fl}{l.sltda === "LAPSED" ? " · SLTDA chain lapsed" : ""}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: m.color }}>
                    <Icon size={14} /> {m.label}
                  </span>
                  {l.status === "LAPSED" ? (
                    <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold" style={{ background: C.redDim, color: C.red, border: `1px solid ${C.redEdge}` }}>
                      <Lock size={12} /> Dispatch blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px]" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}>Cleared</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <SourceLabel src={store.receivables.src} managed />
          <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: C.faint }}>
            <span style={{ color: C.green }}>Validate + expiry alert</span> live · auto-block{" "}
            <span className="rounded px-1.5 py-0.5" style={{ background: C.accentDim, color: C.accent, border: `1px solid ${C.accentEdge}` }}>wired during onboarding</span>
          </span>
        </div>
      </Card>
    </div>
  );
}

/* ── C4 · Evidence Packs ───────────────────────────────────────────────── */

type EvidenceKey = keyof Store["evidence"];

function ScreenC4({ store, justAppended }: { store: Store; justAppended: boolean }) {
  const [sel, setSel] = useState<EvidenceKey>("EXCISE");
  const items = store.evidence[sel] || [];
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {REGS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setSel(k as EvidenceKey)}
              className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
              style={{ background: sel === k ? C.raise : "transparent", color: sel === k ? C.text : C.dim, border: `1px solid ${sel === k ? C.border : "transparent"}` }}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto"><Chip tag="SOURCED" /></span>
        </div>
        <div className="mt-4 space-y-2">
          {items.map((it) => {
            const isNew = justAppended && it.id === "appended";
            return (
              <div key={it.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: C.panelAlt, border: `1px solid ${isNew ? C.greenEdge : C.borderSoft}` }}>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} color={C.green} />
                  <span className="text-[13px]" style={{ color: C.text }}>{it.label}</span>
                </div>
                <span className="rounded px-2 py-0.5 text-[10px]" style={{ background: C.chipBg, color: C.faint, border: `1px solid ${C.borderSoft}` }}>from {it.from}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg p-3 text-sm" style={{ background: C.greenDim, border: `1px solid ${C.greenEdge}`, color: C.green }}>
          <FolderCheck size={15} /> Pack ready — on-demand. Prep baseline ~weeks. <Chip tag="ASSUMPTION" />
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
          <ArrowRight size={13} /> Every assembled pack feeds the monthly board report (C6).
        </div>
      </Card>
    </div>
  );
}

/* ── C5 · Risk Matrix + Compliance Exceptions ───────────────────────────── */

function MetricTile({ m }: { m: Store["headlineMetrics"][number] }) {
  const primary = m.emphasis === "PRIMARY";
  return (
    <div className="rounded-lg p-3.5" style={{ background: C.panelAlt, border: `1px solid ${primary ? C.border : C.borderSoft}` }}>
      <div className="text-[11px]" style={{ color: C.faint }}>{m.label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`tabular-nums font-semibold tracking-tight ${primary ? "text-xl" : "text-base"}`} style={{ color: C.text }}>{m.value}</span>
      </div>
      <div className="mt-1.5"><Chip tag={m.tag} /></div>
    </div>
  );
}

function ExceptionRow({ exc }: { exc: Store["complianceExceptions"][number] }) {
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
          <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenEdge}` }}>
            <CheckCircle2 size={12} /> Cured · compliant
          </span>
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

function ScreenC5({ store }: { store: Store }) {
  const rm = store.riskMatrix;
  const exc = store.complianceExceptions[0];
  const cellColor = { OK: C.green, ATTENTION: C.amber, BREACH: C.red };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {store.headlineMetrics.map((m) => <MetricTile key={m.key} m={m} />)}
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><Scale size={16} color={C.dim} /><span className="text-sm font-semibold">Risk matrix</span></div>
          <span className="text-[11px]" style={{ color: C.faint }}>inherent → control → residual → KRI</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr style={{ color: C.faint }}>
                {["Risk", "Inherent", "Control", "Residual", "KRI", "Trend"].map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rm.rows.map((row) => (
                <tr key={row.id} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <td className="px-2 py-3 align-top" style={{ maxWidth: 260 }}>
                    <div className="flex items-center gap-1.5"><span style={{ color: C.text }}>{row.category}</span><Chip tag={row.catTag} /></div>
                    <div className="mt-1 text-[11px] leading-snug" style={{ color: C.faint }}>{row.mitigation}</div>
                    <div className="mt-1 text-[10px]" style={{ color: C.faint }}>↳ {row.domain}</div>
                  </td>
                  <td className="px-2 py-3 align-top">
                    <div className="flex items-center gap-1"><SevPill level={row.inherent.i} /><span style={{ color: C.faint }}>/</span><SevPill level={row.inherent.l} /></div>
                    <div className="mt-1 text-[10px]" style={{ color: C.faint }}>impact / likelihood</div>
                  </td>
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
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg p-3" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
          <span className="text-[11px] uppercase tracking-wider" style={{ color: C.faint }}>Escalation</span>
          {rm.escalation.steps.map((s, i) => (
            <span key={s} className="flex items-center gap-2 text-[12px]" style={{ color: C.dim }}>
              {i > 0 && <ChevronRight size={13} color={C.faint} />}{s}
            </span>
          ))}
          <span className="ml-1"><Chip tag={rm.escalation.tag} /></span>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert size={16} color={C.dim} />
          <span className="text-sm font-semibold">Compliance exceptions</span>
          <span className="text-[11px]" style={{ color: C.faint }}>· every 7.10 / Section-9 line tracked</span>
        </div>
        <ExceptionRow exc={exc} />
        <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: C.faint }}>
          <CheckCircle2 size={12} color={C.green} /> Governance posture: green — the one exception in the period was disclosed and cured. The same record drives the board report (C6).
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2"><LayoutGrid size={16} color={C.dim} /><span className="text-sm font-semibold">Posture — if every regulator walked in tomorrow</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[12px]">
            <thead>
              <tr>
                <th />
                {REGS.map(([k, l]) => <th key={k} className="px-2 py-1.5 font-medium" style={{ color: C.faint }}>{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {CTRLS.map(([ck, cl]) => (
                <tr key={ck}>
                  <td className="px-2 py-1.5 text-left font-medium" style={{ color: C.dim }}>{cl}</td>
                  {REGS.map(([rk]) => {
                    const st = store.posture[`${rk}|${ck}`];
                    return (
                      <td key={rk} className="px-2 py-1.5">
                        <div
                          className="mx-auto flex h-7 w-7 items-center justify-center rounded-md"
                          style={{
                            background: st === "NA" ? "transparent" : C.panelAlt,
                            border: st === "NA" ? `1px solid ${C.borderSoft}` : `1px solid ${st === "OK" ? C.greenEdge : st === "ATTENTION" ? C.amberEdge : C.redEdge}`,
                          }}
                        >
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
        <div className="mt-4 flex items-start gap-2 rounded-lg p-3.5" style={{ background: C.amberDim, border: `1px solid ${C.amberEdge}` }}>
          <AlertTriangle size={15} color={C.amber} className="mt-0.5" />
          <div>
            <div className="text-[12px] font-semibold" style={{ color: C.amber }}>1 item → Audit Committee remit</div>
            <div className="text-[12px]" style={{ color: C.dim }}>{store.committee[0].label}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── C6 · Board / Audit-Committee Report Generator (CO-HERO) ─────────────── */

function ScreenC6({
  store,
  generated,
  generating,
  onGenerate,
  onToast,
}: {
  store: Store;
  generated: boolean;
  generating: boolean;
  onGenerate: (regen?: boolean) => void;
  onToast: (msg: string) => void;
}) {
  const br = store.boardReport;
  const exc = store.complianceExceptions[0];
  if (!generated) {
    return (
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}>
              <FileText size={20} color={C.accent} />
            </div>
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
              <div className="mt-5">
                <Btn onClick={() => onGenerate()} icon={generating ? Activity : FileText}>{generating ? "Assembling pack…" : "Generate report"}</Btn>
              </div>
            </div>
          </div>
        </Card>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: C.faint }}>
          <Activity size={13} /> Board-pack prep: <span style={{ color: C.dim }}>multi-day build → one-click export</span> <Chip tag="LION_VALIDATE" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: C.accentDim, border: `1px solid ${C.accentEdge}` }}>
              <FileText size={18} color={C.accent} />
            </div>
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
          {br.sectionOrder.map((s, i) => (
            <span key={s} className="rounded px-2 py-0.5 text-[10px]" style={{ background: C.chipBg, color: C.faint, border: `1px solid ${C.borderSoft}` }}>
              {i + 1}. {s}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} color={C.dim} />
          <span className="text-sm font-semibold">Board committees</span>
          <span className="text-[11px]" style={{ color: C.faint }}>(function via Carson Cumberbatch PLC)</span>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {br.committees.map((cm) => (
            <div key={cm.id} className="rounded-lg p-4" style={{ background: C.panelAlt, border: `1px solid ${C.borderSoft}` }}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold" style={{ color: C.text }}>{cm.name}</span>
                <span className="text-[10px]" style={{ color: C.faint }}>via Carson Cumberbatch PLC</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-snug" style={{ color: C.dim }}>{cm.remit} <Chip tag={cm.remitTag} /></p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cm.composition.map((p) => (
                  <span key={p} className="rounded px-2 py-0.5 text-[10px]" style={{ background: C.panel, color: C.dim, border: `1px solid ${C.borderSoft}` }}>{p}</span>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: C.faint }}>
                Meetings this year: <ValidateField note="Jehan to confirm" /> · matters <Chip tag="OPEN" />
              </div>
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
              <div className="flex items-center gap-3 text-[11px]" style={{ color: C.faint }}>
                residual <SevPill level={row.residual} />
                {row.kri && <span className="tabular-nums" style={{ color: C.dim }}>{row.kri.value}</span>}
                <Trend dir={row.trend} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: C.faint }}>
          <span className="uppercase tracking-wider">Escalation</span>
          {store.riskMatrix.escalation.steps.map((s, i) => (
            <span key={s} className="flex items-center gap-2" style={{ color: C.dim }}>
              {i > 0 && <ChevronRight size={12} color={C.faint} />}{s}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center gap-2"><ShieldCheck size={16} color={C.green} /><span className="text-sm font-semibold">Closing assurance</span><Chip tag={br.assurance.tag} /></div>
        <p className="text-[13px] leading-relaxed" style={{ color: C.dim }}>{br.assurance.companiesAct}</p>
        <p className="mt-2 text-[13px] italic leading-relaxed" style={{ color: C.dim }}>&ldquo;{br.assurance.thanks}&rdquo;</p>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-[13px] italic" style={{ color: C.faint }}>The monthly grind becomes a review.</div>
        <Btn kind="ghost" icon={RotateCcw} onClick={() => onGenerate(true)}>Regenerate</Btn>
      </div>
    </div>
  );
}

/* ── shell · full-width top nav (no sidebar) ─────────────────────────────── */

const LION_LOGO_SRC = "/Lion_Brewery_logo.svg.png";

function BrandMark() {
  return (
    <div className="flex shrink-0 flex-col items-start gap-1">
      <Image
        src={LION_LOGO_SRC}
        alt="Lion Brewery (Ceylon) PLC"
        width={148}
        height={40}
        priority
        className="h-9 w-auto max-w-[148px] object-contain object-left"
      />
      <div className="text-[10px] font-medium leading-tight" style={{ color: C.faint }}>
        Lion Brewery (Ceylon) PLC
      </div>
    </div>
  );
}

function TopNav({
  screen,
  rippled,
  onSelect,
}: {
  screen: ScreenId;
  rippled: boolean;
  onSelect: (id: ScreenId) => void;
}) {
  return (
    <nav
      className="flex min-w-0 flex-1 gap-1 overflow-x-auto"
      aria-label="Keystone demo screens"
    >
      {NAV.map(([k, label, Icon]) => {
        const isActive = screen === k;
        const badge = (k === "C4" || k === "C5" || k === "C6") && rippled;
        const isHero = k === "C1" || k === "C6";
        return (
          <button
            key={k}
            type="button"
            onClick={() => onSelect(k)}
            className="relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2"
            style={{
              background: isActive ? C.raise : "transparent",
              color: isActive ? C.text : C.dim,
              border: `1px solid ${isActive ? C.border : "transparent"}`,
            }}
          >
            <span className="tabular-nums text-[10px] font-semibold" style={{ color: isActive ? C.accent : C.faint }}>
              {k}
            </span>
            <Icon size={14} color={isActive ? C.accent : C.faint} />
            <span className="whitespace-nowrap">{label}</span>
            {isHero && (
              <span className="rounded px-1 py-0.5 text-[9px] font-semibold" style={{ background: C.accentDim, color: C.accent }}>
                HERO
              </span>
            )}
            {badge && <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.green }} />}
          </button>
        );
      })}
    </nav>
  );
}

const NAV: [ScreenId, string, LucideIcon][] = [
  ["C1", "Four-Way Reconciliation", Receipt],
  ["C2", "Quality Gate + ABV", Gauge],
  ["C3", "Dispatch + Receivables", Truck],
  ["C4", "Evidence Packs", FolderCheck],
  ["C5", "Risk Matrix + Exceptions", LayoutGrid],
  ["C6", "Board Report", FileText],
];

export default function KeystonePrototype() {
  return (
    <KeystoneThemeProvider>
      <KeystonePrototypeInner />
    </KeystoneThemeProvider>
  );
}

function KeystonePrototypeInner() {
  const [store, setStore] = useState(initialStore);
  const [screen, setScreen] = useState<ScreenId>("C1");
  const [investigating, setInvestigating] = useState(false);
  const [varianceDisp, setVarianceDisp] = useState(3.2);
  const [rippled, setRippled] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function reconcile() {
    setInvestigating(false);
    if (reduced.current) setVarianceDisp(0);
    else {
      const start = performance.now();
      const from = 3.2;
      const dur = 850;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - (1 - p) ** 3;
        setVarianceDisp(+(from * (1 - eased)).toFixed(2));
        if (p < 1) requestAnimationFrame(tick);
        else setVarianceDisp(0);
      };
      requestAnimationFrame(tick);
    }
    setStore((prev) => {
      const next = structuredClone(prev);
      const stk = next.reconciliation.streams.find((s) => s.key === "stickersConsumed");
      if (stk) {
        stk.status = "AGREE";
        stk.value = 12400;
      }
      next.reconciliation.nodeState = "RECONCILED";
      next.reconciliation.variance.status = "CLEARED";
      next.reconciliation.variance.amount = 0;
      if (!next.evidence.EXCISE.some((e) => e.id === "appended")) {
        next.evidence.EXCISE.push({ id: "appended", label: "Four-way reconciliation — May 2026", from: "C1" });
      }
      next.posture["EXCISE|DUTY"] = "OK";
      return next;
    });
    setRippled(true);
  }

  function generateReport(regen?: boolean) {
    if (regen) {
      setReportGenerated(false);
      return;
    }
    setGenerating(true);
    const finish = () => {
      setGenerating(false);
      setReportGenerated(true);
      setToast("Report generated");
    };
    if (reduced.current) finish();
    else setTimeout(finish, 650);
  }

  function reset() {
    setStore(initialStore());
    setInvestigating(false);
    setVarianceDisp(3.2);
    setRippled(false);
    setReportGenerated(false);
    setGenerating(false);
    setScreen("C1");
  }

  const active = NAV.find((n) => n[0] === screen)!;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header
        className="sticky top-0 z-20 border-b"
        style={{ borderColor: C.border, background: C.bgGrad }}
      >
        {/* brand + horizontal screen tabs — full width, no sidebar */}
        <div
          className="flex flex-wrap items-center gap-4 border-b px-5 py-4 sm:px-8"
          style={{ borderColor: C.border }}
        >
          <BrandMark />
          <TopNav screen={screen} rippled={rippled} onSelect={setScreen} />
        </div>

        {/* page title row */}
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-5 pt-4 sm:px-8">
          <div>
            <Eyebrow>{`Lion Brewery · ${active[1]}`}</Eyebrow>
            <h1 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">{active[1]}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px]"
              style={{ background: C.panel, border: `1px solid ${C.border}`, color: C.dim }}
            >
              Period: May 2026 <ChevronDown size={13} />
            </span>
            <ThemeToggle />
            <Btn kind="ghost" icon={RotateCcw} onClick={reset}>Reset demo</Btn>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-6 sm:px-8">
        {screen === "C1" && (
          <HeroC1
            store={store}
            varianceDisp={varianceDisp}
            investigating={investigating}
            setInvestigating={setInvestigating}
            onReconcile={reconcile}
          />
        )}
        {screen === "C2" && <ScreenC2 store={store} />}
        {screen === "C3" && <ScreenC3 store={store} />}
        {screen === "C4" && <ScreenC4 store={store} justAppended={rippled} />}
        {screen === "C5" && <ScreenC5 store={store} />}
        {screen === "C6" && (
          <ScreenC6
            store={store}
            generated={reportGenerated}
            generating={generating}
            onGenerate={generateReport}
            onToast={setToast}
          />
        )}

        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] leading-relaxed" style={{ color: C.faint }}>
          Figures carry their provenance; most are now sourced.
          <span className="inline-flex items-center gap-1"><span style={{ color: C.green }}>●</span> Sourced / verified</span>
          <span className="inline-flex items-center gap-1"><span style={{ color: C.amber }}>●</span> Illustrative</span>
          <span className="inline-flex items-center gap-1"><span style={{ color: C.faint }}>●</span> Assumption / validate</span>
          <span className="inline-flex items-center gap-1"><span style={{ color: C.faint }}>●</span> Open range</span>
        </p>
      </main>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2" role="status">
          <div
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium shadow-lg"
            style={{ background: C.raise, color: C.text, border: `1px solid ${C.greenEdge}` }}
          >
            <CheckCircle2 size={15} color={C.green} /> {toast}
          </div>
        </div>
      )}
    </div>
  );
}
