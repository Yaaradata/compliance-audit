"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DataConfidenceCategoryRow } from "./types";
import { Check, ChevronRight, Download, Flag, Minus, RefreshCw, X } from "lucide-react";
import type {
  BankAuditFinding,
  BankAuditorQuery,
  BankPersonaId,
  BankScope3MockData,
  ComplianceCounterpartyRow,
  ComplianceCounterpartyStatus,
} from "./types";
import { isExternalAuditor } from "./personaAccess";
import { Scope3ComplianceKpiStrip } from "../scope3-kpi";
import { Scope3DrilldownDrawer, Scope3Panel } from "../Pharma/scope3-ui";
import {
  bankBtnPrimary,
  bankBtnSecondary,
  bankPage,
  bankSegmentGroup,
  bankSegmentTabButtonProps,
  bankTable,
  bankTableShell,
  bankTd,
  bankTh,
  bankTrInteractive,
} from "./banking-ui";

type CounterpartyTab = "all" | "flagged" | "top10";

type ComplianceDrill =
  | { kind: "kpi"; id: string; label: string }
  | { kind: "counterparty"; id: string; name: string }
  | { kind: "brsrCategory"; id: string; label: string }
  | { kind: "brsrAction"; id: string; title: string }
  | { kind: "control"; id: string; title: string }
  | { kind: "auditLog"; id: string }
  | { kind: "exception"; id: string }
  | { kind: "confidence"; id: string; label: string }
  | { kind: "finding"; row: BankAuditFinding }
  | { kind: "query"; row: BankAuditorQuery };

function formatCr(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

function formatT(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function sectorPillClass(tone: ComplianceCounterpartyRow["sectorTone"]): string {
  const map: Record<ComplianceCounterpartyRow["sectorTone"], string> = {
    energy: "bg-red-500/15 text-red-400",
    metals: "bg-slate-500/20 text-slate-300",
    agri: "bg-emerald-500/15 text-emerald-400",
    infra: "bg-amber-500/15 text-amber-400",
    cement: "bg-orange-500/15 text-orange-400",
    chemicals: "bg-violet-500/15 text-violet-400",
    default: "bg-[var(--muted)] text-[var(--foreground-muted)]",
  };
  return `inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[tone]}`;
}

function dataQualityClass(tier: ComplianceCounterpartyRow["dataQualityTier"]): string {
  if (tier === "High") return "text-emerald-400";
  if (tier === "Med") return "text-amber-400";
  return "text-red-400";
}

function attributionBarClass(pct: number | null): string {
  if (pct == null) return "bg-[var(--muted)]";
  if (pct >= 15) return "bg-red-500";
  if (pct >= 10) return "bg-amber-500";
  return "bg-emerald-500";
}

function StatusIcon({ status }: { status: ComplianceCounterpartyStatus }) {
  if (status === "Verified") return <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />;
  if (status === "Partial Data") return <Flag className="h-3.5 w-3.5 text-amber-400" aria-hidden />;
  if (status === "Inconsistent") return <Flag className="h-3.5 w-3.5 text-red-400" aria-hidden />;
  return <X className="h-3.5 w-3.5 text-red-400" aria-hidden />;
}

function BrsrStatusIcon({ status }: { status: "met" | "partial" | "not_met" }) {
  if (status === "met") return <Check className="h-4 w-4 text-emerald-400" aria-hidden />;
  if (status === "partial") return <Minus className="h-4 w-4 text-amber-400" aria-hidden />;
  return <X className="h-4 w-4 text-red-400" aria-hidden />;
}

function brsrBarClass(status: "met" | "partial" | "not_met"): string {
  if (status === "met") return "bg-emerald-500";
  if (status === "partial") return "bg-teal-500";
  return "bg-red-500";
}

function controlStatusBadge(status: "Effective" | "Needs Review" | "Ineffective"): string {
  if (status === "Effective") return "bg-emerald-500/15 text-emerald-400";
  if (status === "Needs Review") return "bg-amber-500/15 text-amber-400";
  return "bg-red-500/15 text-red-400";
}

function logTagClass(tone: "blue" | "orange" | "green" | "red"): string {
  const m = {
    blue: "bg-blue-500/15 text-blue-300",
    orange: "bg-amber-500/15 text-amber-300",
    green: "bg-emerald-500/15 text-emerald-300",
    red: "bg-red-500/15 text-red-300",
  };
  return m[tone];
}

function exceptionStatusClass(status: "Critical" | "High" | "In Progress"): string {
  if (status === "Critical") return "bg-red-500/15 text-red-400";
  if (status === "High") return "bg-red-500/15 text-red-300";
  return "bg-amber-500/15 text-amber-400";
}

function confidenceBarFill(tone: DataConfidenceCategoryRow["barTone"]): string {
  const m = { blue: "#2563eb", orange: "#d97706", red: "#dc2626", green: "#059669" };
  return m[tone];
}

function confidenceTierLabel(pct: number): { label: string; tone: DataConfidenceCategoryRow["barTone"] } {
  if (pct >= 75) return { label: "Strong", tone: "green" };
  if (pct >= 65) return { label: "Adequate", tone: "blue" };
  return { label: "Needs review", tone: pct >= 60 ? "orange" : "red" };
}

function ConfidenceLegend() {
  const items: { label: string; tone: DataConfidenceCategoryRow["barTone"] }[] = [
    { label: "Strong ≥75%", tone: "green" },
    { label: "Adequate 65–74%", tone: "blue" },
    { label: "Review 60–64%", tone: "orange" },
    { label: "Weak <60%", tone: "red" },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-[var(--foreground-muted)]">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: confidenceBarFill(item.tone) }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

type ConfidenceChartRow = DataConfidenceCategoryRow & { fill: string; tierLabel: string };

function DataConfidenceChart({
  rows,
  activeId,
  onSelect,
}: {
  rows: DataConfidenceCategoryRow[];
  activeId: string | null;
  onSelect: (row: DataConfidenceCategoryRow) => void;
}) {
  const chartData: ConfidenceChartRow[] = useMemo(
    () =>
      rows.map((row) => {
        const tier = confidenceTierLabel(row.confidencePct);
        return {
          ...row,
          fill: confidenceBarFill(row.barTone),
          tierLabel: tier.label,
        };
      }),
    [rows],
  );

  const avgConfidence = useMemo(
    () => Math.round(chartData.reduce((s, r) => s + r.confidencePct, 0) / chartData.length),
    [chartData],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            PCAF data confidence
          </p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            Score 1 = highest quality · 5 = lowest — mapped to confidence %
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-[var(--foreground-muted)]">Portfolio average</p>
          <p className="text-2xl font-bold tabular-nums text-[var(--foreground)]">{avgConfidence}%</p>
        </div>
      </div>

      <div className="h-[min(420px,52vh)] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 56, left: 0, bottom: 4 }}
            barCategoryGap="14%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "var(--foreground-muted)", fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="shortLabel"
              width={48}
              tick={{ fill: "var(--foreground)", fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={75} stroke="var(--primary)" strokeDasharray="4 4" strokeOpacity={0.45} />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.35 }}
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as ConfidenceChartRow | undefined;
                return row?.categoryCode ?? "";
              }}
              formatter={(value, _name, item) => {
                const row = item.payload as ConfidenceChartRow;
                return [`${value ?? 0}% · ${row.tierLabel}`, "Confidence"];
              }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                boxShadow: "var(--shadow-md)",
              }}
            />
            <Bar
              dataKey="confidencePct"
              radius={[0, 6, 6, 0]}
              barSize={20}
              cursor="pointer"
              onClick={(_data, index) => {
                const row = chartData[index ?? -1];
                if (row) onSelect(row);
              }}
            >
              {chartData.map((row) => (
                <Cell
                  key={row.id}
                  fill={row.fill}
                  stroke={activeId === row.id ? "var(--primary)" : "transparent"}
                  strokeWidth={activeId === row.id ? 2 : 0}
                  opacity={activeId && activeId !== row.id ? 0.55 : 1}
                />
              ))}
              <LabelList
                dataKey="confidencePct"
                position="right"
                formatter={(value) => `${value ?? 0}%`}
                className="fill-[var(--foreground)] text-[11px] font-semibold"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ConfidenceLegend />
      <p className="text-center text-[11px] text-[var(--foreground-muted)]">
        Click a bar for PCAF score mix, source systems, and version history · dashed line = 75% target
      </p>
    </div>
  );
}

function DrillSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">{title}</h3>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function DrillList({ items }: { items: string[] }) {
  return (
    <ul className="list-inside list-disc space-y-1 text-xs text-[var(--foreground-muted)]">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function ComplianceDrillBody({ data, drill }: { data: BankScope3MockData; drill: ComplianceDrill }) {
  const page = data.complianceAuditPage;
  const d = page.drills;

  if (drill.kind === "kpi") {
    const k = d.pageKpis[drill.id];
    if (!k) return <p className="text-xs text-[var(--foreground-muted)]">No detail available.</p>;
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--foreground)]">{k.summary}</p>
        <DrillList items={k.bullets} />
      </div>
    );
  }

  if (drill.kind === "counterparty") {
    const cp = d.counterparties[drill.id];
    if (!cp) return null;
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold">ESG {cp.esgRating}</span>
          <span className="text-xs text-[var(--foreground-muted)]">{cp.assuranceStatus}</span>
        </div>
        <DrillSection title="Exposure & facility">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
            <p>
              <strong>Facility:</strong> {cp.facilityType} · <strong>Maturity:</strong> {cp.maturity}
            </p>
            <p className="mt-1">
              <strong>Attributed:</strong> {formatT(cp.attributedTCO2e)} tCO₂e · <strong>Scope 1+2 base:</strong>{" "}
              {formatT(cp.scope12TCO2e)} tCO₂e
            </p>
            {cp.priorYearAttributed != null && cp.variancePct != null ? (
              <p className="mt-1 text-[var(--foreground-muted)]">
                Prior year {formatT(cp.priorYearAttributed)} tCO₂e · YoY {cp.variancePct}%
              </p>
            ) : null}
          </div>
        </DrillSection>
        <DrillSection title="PCAF & disclosure">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
            <p>
              <strong>PCAF score {cp.pcafScore}</strong> — {cp.pcafOption}
            </p>
            <p className="mt-1">
              BRSR: {cp.brsrDisclosed ? "Disclosed" : "Not disclosed"} · SBTi: {cp.sbtiCommitted ? "Committed" : "No"} ·
              Engagement: {cp.engagement}
            </p>
            <p className="mt-1 text-[var(--foreground-muted)]">Rating: {cp.ratingAgency}</p>
            {cp.redFlags !== "None" ? <p className="mt-1 text-red-400">Red flag: {cp.redFlags}</p> : null}
          </div>
        </DrillSection>
        <DrillSection title="Data lineage">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="min-w-full text-[11px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 text-left text-[var(--foreground-muted)]">
                  <th className="px-2 py-1.5">Step</th>
                  <th className="px-2 py-1.5">Source</th>
                  <th className="px-2 py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {cp.dataLineage.map((row) => (
                  <tr key={row.step} className="border-b border-[var(--border)]">
                    <td className="px-2 py-1.5 font-medium">{row.step}</td>
                    <td className="px-2 py-1.5 text-[var(--foreground-muted)]">{row.source}</td>
                    <td className="px-2 py-1.5">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DrillSection>
        <DrillSection title="Evidence pack">
          <ul className="space-y-1.5">
            {cp.evidenceArtifacts.map((e) => (
              <li
                key={e.name}
                className="flex items-center justify-between rounded-md border border-[var(--border)] px-2 py-1.5 text-xs"
              >
                <span>{e.name}</span>
                <span
                  className={
                    e.status === "Available"
                      ? "text-emerald-400"
                      : e.status === "Missing"
                        ? "text-red-400"
                        : "text-amber-400"
                  }
                >
                  {e.status}
                </span>
              </li>
            ))}
          </ul>
        </DrillSection>
        <DrillSection title="Audit notes">
          <DrillList items={cp.auditNotes} />
        </DrillSection>
        <DrillSection title="Remediation">
          <DrillList items={cp.remediationSteps} />
          {cp.linkedControlIds.length > 0 ? (
            <p className="mt-2 text-[11px] text-[var(--foreground-muted)]">
              Linked controls: {cp.linkedControlIds.join(", ")}
            </p>
          ) : null}
        </DrillSection>
      </div>
    );
  }

  if (drill.kind === "brsrCategory") {
    const row = page.brsrCategories.find((c) => c.id === drill.id);
    const cat = d.brsrCategories[drill.id] ?? {
      brsrPrinciple: row?.brsrPrinciple ?? drill.label,
      regulatoryRef: "SEBI LODR — BRSR Core",
      dataOwner: row?.dataOwner ?? "Compliance",
      completenessPct: row?.pct ?? 0,
      gaps: row?.status === "met" ? [] : ["See annual disclosure gap tracker for detail."],
      evidenceRequired: ["Supporting workbook", "Data owner attestation"],
      actions: ["Maintain quarterly refresh cadence"],
      linkedReports: ["BRSR Section A — Environmental"],
      assuranceNote:
        row?.status === "met"
          ? "Category met — included in FY25 assurance scope."
          : row?.status === "partial"
            ? "Partially met — auditor may request supplementary evidence."
            : "Not met — remediation required before BRSR Core filing window.",
    };
    return (
      <div className="space-y-4">
        <p className="text-xs text-[var(--foreground-muted)]">
          {cat.brsrPrinciple} · {cat.regulatoryRef}
        </p>
        <p className="text-sm">
          Data owner: <strong>{cat.dataOwner}</strong> · Completeness: <strong>{cat.completenessPct}%</strong>
        </p>
        {cat.gaps.length > 0 ? (
          <DrillSection title="Gaps">
            <DrillList items={cat.gaps} />
          </DrillSection>
        ) : null}
        <DrillSection title="Evidence required">
          <DrillList items={cat.evidenceRequired} />
        </DrillSection>
        <DrillSection title="Actions">
          <DrillList items={cat.actions} />
        </DrillSection>
        <DrillSection title="Linked reports">
          <DrillList items={cat.linkedReports} />
        </DrillSection>
        <p className="rounded-lg bg-[var(--muted)]/40 p-3 text-xs text-[var(--foreground-muted)]">{cat.assuranceNote}</p>
      </div>
    );
  }

  if (drill.kind === "brsrAction") {
    const act = d.brsrActions[drill.id];
    if (!act) return null;
    return (
      <div className="space-y-4">
        <p className="text-xs">
          Owner: <strong>{act.owner}</strong> · Target: {act.targetDate}
        </p>
        <p className="text-xs text-[var(--foreground-muted)]">{act.regulatoryDriver}</p>
        <DrillSection title="Dependencies">
          <DrillList items={act.dependencies} />
        </DrillSection>
        <DrillSection title="Milestones">
          <ul className="space-y-2">
            {act.milestones.map((m) => (
              <li key={m.label} className="flex justify-between rounded-md border border-[var(--border)] px-2 py-1.5 text-xs">
                <span>{m.label}</span>
                <span className={m.status === "Overdue" ? "text-red-400" : m.status === "Done" ? "text-emerald-400" : "text-amber-400"}>
                  {m.date} — {m.status}
                </span>
              </li>
            ))}
          </ul>
        </DrillSection>
        {act.linkedExceptions.length > 0 ? (
          <p className="text-xs text-[var(--foreground-muted)]">Linked exceptions: {act.linkedExceptions.join(", ")}</p>
        ) : null}
      </div>
    );
  }

  if (drill.kind === "control") {
    const c = d.controlChecklist[drill.id];
    if (!c) return null;
    return (
      <div className="space-y-4">
        <p className="text-sm">{c.controlObjective}</p>
        <DrillSection title="Test procedure">
          <p className="text-xs text-[var(--foreground-muted)]">{c.testProcedure}</p>
        </DrillSection>
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] p-2">
            <span className="text-[var(--foreground-muted)]">Last tested</span>
            <p className="font-semibold">{c.lastTested}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <span className="text-[var(--foreground-muted)]">Tester</span>
            <p className="font-semibold">{c.tester}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <span className="text-[var(--foreground-muted)]">Owner</span>
            <p className="font-semibold">{c.owner}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <span className="text-[var(--foreground-muted)]">Next review</span>
            <p className="font-semibold">{c.nextReview}</p>
          </div>
        </div>
        <DrillSection title="Frameworks">
          <p className="text-xs">{c.frameworks.join(" · ")}</p>
        </DrillSection>
        <DrillSection title="Findings">
          <DrillList items={c.findings} />
        </DrillSection>
        <DrillSection title="Evidence">
          <DrillList items={c.evidenceLinks} />
        </DrillSection>
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">{c.remediationPlan}</p>
      </div>
    );
  }

  if (drill.kind === "auditLog") {
    const log = d.auditLog[drill.id];
    if (!log) return null;
    return (
      <div className="space-y-4">
        <p className="text-xs">
          <strong>{log.eventType}</strong> · Ref {log.systemRef}
        </p>
        {log.beforeValue && log.afterValue ? (
          <div className="rounded-lg border border-[var(--border)] p-3 text-xs">
            <p>
              <span className="text-[var(--foreground-muted)]">Before:</span> {log.beforeValue}
            </p>
            <p className="mt-1">
              <span className="text-[var(--foreground-muted)]">After:</span> {log.afterValue}
            </p>
          </div>
        ) : null}
        {log.approver ? <p className="text-xs">Approver: {log.approver}</p> : null}
        <DrillSection title="Impacted entities">
          <DrillList items={log.impactedEntities} />
        </DrillSection>
        <DrillSection title="Follow-up">
          <DrillList items={log.followUpActions} />
        </DrillSection>
      </div>
    );
  }

  if (drill.kind === "exception") {
    const ex = d.exceptions[drill.id];
    if (!ex) return null;
    return (
      <div className="space-y-4">
        <p className="text-sm">{ex.rootCause}</p>
        <p className="text-xs text-[var(--foreground-muted)]">{ex.impact}</p>
        <DrillSection title="Remediation plan">
          <ul className="space-y-2">
            {ex.remediationSteps.map((s) => (
              <li key={s.step} className="rounded-md border border-[var(--border)] px-2 py-2 text-xs">
                <p className={s.done ? "line-through opacity-60" : ""}>{s.step}</p>
                <p className="mt-0.5 text-[var(--foreground-muted)]">
                  {s.owner} · {s.due}
                </p>
              </li>
            ))}
          </ul>
        </DrillSection>
        <p className="text-xs text-[var(--foreground-muted)]">Escalation: {ex.escalationPath}</p>
        {ex.boardVisibility ? <p className="text-xs font-semibold text-amber-400">Visible to Board Risk Committee</p> : null}
      </div>
    );
  }

  if (drill.kind === "confidence") {
    const conf = d.dataConfidence[drill.id];
    if (!conf) return null;
    return (
      <div className="space-y-4">
        <p className="text-xs text-[var(--foreground-muted)]">{conf.methodology}</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="text-lg font-bold text-emerald-400">{conf.primaryDataPct}%</p>
            <p className="text-[var(--foreground-muted)]">Primary</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="text-lg font-bold text-amber-400">{conf.estimatedPct}%</p>
            <p className="text-[var(--foreground-muted)]">Estimated</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] p-2">
            <p className="text-lg font-bold text-red-400">{conf.missingPct}%</p>
            <p className="text-[var(--foreground-muted)]">Missing</p>
          </div>
        </div>
        <DrillSection title="PCAF score mix">
          <ul className="space-y-1 text-xs">
            {conf.pcafScoreDistribution.map((b) => (
              <li key={b.score} className="flex justify-between">
                <span>Score {b.score}</span>
                <span className="tabular-nums">{b.pct}%</span>
              </li>
            ))}
          </ul>
        </DrillSection>
        <DrillSection title="Source systems">
          <DrillList items={conf.sourceSystems} />
        </DrillSection>
        <DrillSection title="Version history">
          <ul className="space-y-1 text-xs text-[var(--foreground-muted)]">
            {conf.versionHistory.map((v) => (
              <li key={v.version}>
                <strong>{v.version}</strong> ({v.date}) — {v.change}
              </li>
            ))}
          </ul>
        </DrillSection>
        {conf.anomalies.length > 0 ? (
          <DrillSection title="Anomalies">
            <DrillList items={conf.anomalies} />
          </DrillSection>
        ) : null}
      </div>
    );
  }

  if (drill.kind === "finding") {
    const f = drill.row;
    return (
      <div className="space-y-3 text-xs">
        <p>
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-semibold text-red-400">{f.severity}</span>{" "}
          <span className="text-[var(--foreground-muted)]">{f.source}</span>
        </p>
        <p>{f.detail}</p>
        <p>
          Owner: <strong>{f.owner}</strong> · Target: {f.targetDate} · Status: {f.status}
        </p>
        {f.linkedControlId ? <p className="text-[var(--foreground-muted)]">Control: {f.linkedControlId}</p> : null}
      </div>
    );
  }

  if (drill.kind === "query") {
    const q = drill.row;
    return (
      <div className="space-y-3 text-xs">
        <p>
          Asked by <strong>{q.askedBy}</strong> → Assignee: <strong>{q.assignee}</strong>
        </p>
        <p className="text-[var(--foreground-muted)]">Status: {q.status} · Updated {q.lastUpdated}</p>
        {q.relatedControlId ? <p>Related control: {q.relatedControlId}</p> : null}
      </div>
    );
  }

  return null;
}

export function ControlsAuditView({ data, persona }: { data: BankScope3MockData; persona: BankPersonaId }) {
  const readOnly = isExternalAuditor(persona);
  const page = data.complianceAuditPage;
  const [cpTab, setCpTab] = useState<CounterpartyTab>("all");
  const [chartsReady, setChartsReady] = useState(false);
  const [drill, setDrill] = useState<ComplianceDrill | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const flaggedCount = useMemo(() => page.counterparties.filter((c) => c.flagged).length, [page.counterparties]);

  const tableRows = useMemo(() => {
    if (cpTab === "flagged") return page.counterparties.filter((c) => c.flagged);
    if (cpTab === "top10") return page.counterparties.slice(0, 10);
    return page.counterparties;
  }, [cpTab, page.counterparties]);

  const brsrDonut = useMemo(
    () => [
      { name: "Score", value: page.brsrOverallScore },
      { name: "Gap", value: 100 - page.brsrOverallScore },
    ],
    [page.brsrOverallScore],
  );

  const { counterpartySummary: sum } = page;
  const checklist = page.controlChecklistSummary;
  const openFindings = data.complianceAudit.openFindings.filter((f) => f.status !== "Closed");

  const drillTitle =
    drill == null
      ? ""
      : drill.kind === "counterparty"
        ? drill.name
        : drill.kind === "kpi"
          ? drill.label
          : drill.kind === "brsrCategory"
            ? drill.label
            : drill.kind === "brsrAction"
              ? drill.title
              : drill.kind === "control"
                ? drill.title
                : drill.kind === "exception"
                  ? drill.id
                  : drill.kind === "finding"
                    ? drill.row.title
                    : drill.kind === "query"
                      ? drill.row.subject
                      : drill.kind === "confidence"
                        ? drill.label
                        : "Audit event";

  return (
    <div className={bankPage}>
      <Scope3ComplianceKpiStrip
        kpis={page.pageKpis}
        onKpiClick={(kpi) => setDrill({ kind: "kpi", id: kpi.id, label: kpi.label })}
      />

      {/* PCAF ladder + open assurance items */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Scope3Panel>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">PCAF coverage ladder</h2>
          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">Portfolio distribution by data quality score</p>
          <ul className="mt-4 space-y-2">
            {page.pcafCoverageLadder.map((band) => (
              <li key={band.band}>
                <div className="flex items-center justify-between text-xs">
                  <span>{band.band}</span>
                  <span className="tabular-nums font-semibold">{band.pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${band.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Scope3Panel>

        <Scope3Panel>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Assurance queue</h2>
          <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">
            {page.openFindingsCount} findings · {page.openAuditorQueriesCount} auditor queries open
          </p>
          <ul className="mt-4 max-h-[220px] space-y-2 overflow-y-auto">
            {openFindings.slice(0, 4).map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs transition hover:bg-[var(--muted)]/40"
                  onClick={() => setDrill({ kind: "finding", row: f })}
                >
                  <span className="font-semibold text-[var(--foreground)]">{f.title}</span>
                  <p className="mt-0.5 text-[var(--foreground-muted)]">
                    {f.severity} · {f.owner} · due {f.targetDate}
                  </p>
                </button>
              </li>
            ))}
            {data.complianceAudit.auditorQueries
              .filter((q) => q.status !== "Answered")
              .map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-left text-xs transition hover:bg-[var(--muted)]/40"
                    onClick={() => setDrill({ kind: "query", row: q })}
                  >
                    <span className="font-semibold text-[var(--foreground)]">{q.subject}</span>
                    <p className="mt-0.5 text-[var(--foreground-muted)]">
                      {q.askedBy} → {q.assignee}
                    </p>
                  </button>
                </li>
              ))}
          </ul>
        </Scope3Panel>
      </div>

      {/* Counterparty register */}
      <Scope3Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Counterparty disclosure register</h2>
            <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
              {page.counterparties.length} obligors in mock book · click any row for lineage, evidence & remediation
            </p>
          </div>
        </div>

        <div className={bankSegmentGroup + " mt-4 max-w-2xl"}>
          <button type="button" {...bankSegmentTabButtonProps(cpTab === "all")} onClick={() => setCpTab("all")}>
            All Counterparties
          </button>
          <button type="button" {...bankSegmentTabButtonProps(cpTab === "flagged")} onClick={() => setCpTab("flagged")}>
            <span className="inline-flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5" aria-hidden />
              Flagged ({flaggedCount})
            </span>
          </button>
          <button type="button" {...bankSegmentTabButtonProps(cpTab === "top10")} onClick={() => setCpTab("top10")}>
            Top 10 Emitters
          </button>
        </div>

        <div className={bankTableShell + " mt-4"}>
          <table className={bankTable}>
            <thead>
              <tr>
                <th className={bankTh}>Counterparty</th>
                <th className={bankTh}>Sector</th>
                <th className={bankTh}>Loan exp. (₹ cr)</th>
                <th className={bankTh}>Financed emissions (tCO₂e)</th>
                <th className={bankTh}>Attribution %</th>
                <th className={bankTh}>Data quality</th>
                <th className={bankTh}>Source</th>
                <th className={bankTh}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr
                  key={row.id}
                  className={bankTrInteractive}
                  onClick={() => setDrill({ kind: "counterparty", id: row.id, name: row.name })}
                >
                  <td className={bankTd + " font-medium"}>
                    <span className="inline-flex items-center gap-1">
                      {row.name}
                      <ChevronRight className="h-3.5 w-3.5 text-[var(--foreground-muted)]" />
                    </span>
                  </td>
                  <td className={bankTd}>
                    <span className={sectorPillClass(row.sectorTone)}>{row.sector}</span>
                  </td>
                  <td className={bankTd + " tabular-nums"}>{formatCr(row.loanExpCr)}</td>
                  <td
                    className={
                      bankTd +
                      " tabular-nums " +
                      (row.financedEmissionsTone === "danger"
                        ? "text-red-400"
                        : row.financedEmissionsTone === "warn"
                          ? "text-amber-400"
                          : "")
                    }
                  >
                    {row.financedEmissionsLabel}
                  </td>
                  <td className={bankTd}>
                    {row.attributionPct == null ? (
                      <span className="text-[var(--foreground-muted)]">N/A</span>
                    ) : (
                      <div className="flex min-w-[88px] items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--muted)]">
                          <div
                            className={"h-full rounded-full " + attributionBarClass(row.attributionPct)}
                            style={{ width: `${Math.min(row.attributionPct * 4, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-[var(--foreground-muted)]">{row.attributionPct}%</span>
                      </div>
                    )}
                  </td>
                  <td className={bankTd}>
                    <span className={dataQualityClass(row.dataQualityTier)}>
                      {row.dataQualityTier} — {row.dataQualityScore}/100
                    </span>
                  </td>
                  <td className={bankTd + (row.sourceTone === "danger" ? " text-red-400" : "")}>{row.source}</td>
                  <td className={bankTd}>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <StatusIcon status={row.status} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[var(--foreground-muted)]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Verified: {formatCr(sum.verified)} entities
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Partial / Estimated: {formatCr(sum.partialEstimated)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Non-disclosed: {formatCr(sum.nonDisclosed)}
            </span>
          </div>
          <span>
            Showing {tableRows.length} of {formatCr(sum.total)} — paginated view
          </span>
        </div>
      </Scope3Panel>

      {/* BRSR */}
      <Scope3Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">BRSR Compliance Mapping</h2>
            <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
              SEBI BRSR Core — Essential Indicators · Leadership Indicators — FY 2024–25
            </p>
          </div>
          <button type="button" className={bankBtnPrimary} disabled={readOnly}>
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Audit-Ready Export
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">BRSR Disclosure Coverage — All Categories</h3>
            <ul className="mt-4 space-y-2">
              {page.brsrCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-1 py-1 text-left transition hover:bg-[var(--muted)]/40"
                    onClick={() => setDrill({ kind: "brsrCategory", id: cat.id, label: cat.label })}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[var(--foreground)]">{cat.label}</span>
                      <span className="flex items-center gap-2 tabular-nums text-[var(--foreground-muted)]">
                        {cat.pct}%
                        <BrsrStatusIcon status={cat.status} />
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div className={"h-full rounded-full " + brsrBarClass(cat.status)} style={{ width: `${cat.pct}%` }} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Overall BRSR Compliance Score</h3>
              <div className="mt-3 flex items-center gap-4">
                {chartsReady ? (
                  <div className="h-[120px] w-[120px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={brsrDonut} dataKey="value" innerRadius={38} outerRadius={52} startAngle={90} endAngle={-270} stroke="none">
                          <Cell fill="var(--primary)" />
                          <Cell fill="var(--muted)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
                ) : (
                  <div className="h-[120px] w-[120px] shrink-0 rounded-full bg-[var(--muted)]" />
                )}
                <div>
                  <p className="text-3xl font-bold tabular-nums text-[var(--foreground)]">
                    {page.brsrOverallScore}
                    <span className="text-lg font-normal text-[var(--foreground-muted)]"> / 100</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold">{page.brsrStatusLabel}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--foreground-muted)]">{page.brsrSummary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {page.brsrCounts.fullyMet} Fully Met
                </span>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  {page.brsrCounts.partial} Partial
                </span>
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                  {page.brsrCounts.notMet} Not Met
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">BRSR Priority Actions</h3>
              <ul className="mt-3 space-y-2">
                {page.brsrPriorityActions.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      className={
                        "w-full rounded-lg border px-3 py-2.5 text-left text-xs transition hover:opacity-90 " +
                        (a.severity === "Critical"
                          ? "border-red-500/30 bg-red-500/10"
                          : a.severity === "High"
                            ? "border-amber-500/30 bg-amber-500/10"
                            : "border-[var(--border)] bg-[var(--muted)]/30")
                      }
                      onClick={() => setDrill({ kind: "brsrAction", id: a.id, title: a.title })}
                    >
                      <p className="font-semibold text-[var(--foreground)]">
                        {a.severity}: {a.title}
                      </p>
                      <p className="mt-1 text-[var(--foreground-muted)]">{a.detail}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Scope3Panel>

      {/* Controls layer */}
      <Scope3Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Controls & Audit Layer</h2>
            <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">Click checklist items, log entries, or exceptions for drill-down</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={bankBtnSecondary} disabled={readOnly}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Refresh
            </button>
            <button type="button" className={bankBtnPrimary} disabled={readOnly}>
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Control Report
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Scope 3 Control Checklist</h3>
            <ul className="mt-4 space-y-3">
              {page.controlChecklist.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--primary)]/30"
                    onClick={() => setDrill({ kind: "control", id: item.id, title: item.title })}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[10px] font-bold text-[var(--foreground-muted)]">
                      {item.categoryLabel}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                        <span className={"shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold " + controlStatusBadge(item.status)}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--foreground-muted)]">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 self-center text-[var(--foreground-muted)]" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Effective: {checklist.effective}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Needs Review: {checklist.needsReview}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Ineffective: {checklist.ineffective}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Audit Log — Recent Activity</h3>
              <ul className="mt-4 space-y-3">
                {page.auditLog.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left transition hover:bg-[var(--muted)]/40"
                      onClick={() => setDrill({ kind: "auditLog", id: entry.id })}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] text-[var(--foreground-muted)]">{entry.timestamp}</span>
                        <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + logTagClass(entry.tagTone)}>
                          {entry.tag}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[var(--foreground)]">
                        {entry.author} <span className="font-normal text-[var(--foreground-muted)]">({entry.role})</span>
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--foreground-muted)]">{entry.detail}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Exception Tracker</h3>
              <div className={bankTableShell + " mt-4"}>
                <table className={bankTable}>
                  <thead>
                    <tr>
                      <th className={bankTh}>#</th>
                      <th className={bankTh}>Issue</th>
                      <th className={bankTh}>Owner</th>
                      <th className={bankTh}>Due</th>
                      <th className={bankTh}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.exceptions.map((ex) => (
                      <tr key={ex.id} className={bankTrInteractive} onClick={() => setDrill({ kind: "exception", id: ex.id })}>
                        <td className={bankTd + " font-mono text-xs"}>{ex.id}</td>
                        <td className={bankTd + " text-xs"}>{ex.issue}</td>
                        <td className={bankTd + " text-xs"}>{ex.owner}</td>
                        <td className={bankTd + " text-xs tabular-nums"}>{ex.due}</td>
                        <td className={bankTd}>
                          <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + exceptionStatusClass(ex.status)}>
                            {ex.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
              </div>
            </Scope3Panel>

      {/* Data governance */}
      <Scope3Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Data Governance & Quality</h2>
            <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
              Scope 3 category confidence — operational (Cat 1–8) and financed (Cat 11, 15)
            </p>
          </div>
          <button type="button" className={bankBtnSecondary} disabled={readOnly}>
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Data Lineage Report
          </button>
                </div>

        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          {chartsReady ? (
            <DataConfidenceChart
              rows={page.dataConfidence}
              activeId={drill?.kind === "confidence" ? drill.id : null}
              onSelect={(row) =>
                setDrill({ kind: "confidence", id: row.id, label: row.categoryCode ?? row.shortLabel })
              }
            />
          ) : (
            <div className="h-[min(420px,52vh)] animate-pulse rounded-lg bg-[var(--muted)]" />
          )}
            </div>
          </Scope3Panel>

      <Scope3DrilldownDrawer
        open={drill != null}
        title={drillTitle}
        subtitle={drill?.kind === "counterparty" ? "Counterparty assurance drill-down" : "Compliance & audit detail"}
        onClose={() => setDrill(null)}
        size="lg"
        footer={
          readOnly ? (
            <span className="text-xs text-[var(--foreground-muted)]">Read-only view for external auditor persona.</span>
          ) : drill?.kind === "counterparty" ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={bankBtnPrimary}>
                Request disclosure
              </button>
              <button type="button" className={bankBtnSecondary}>
                Log engagement
              </button>
            </div>
          ) : undefined
        }
      >
        {drill ? <ComplianceDrillBody data={data} drill={drill} /> : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}
