"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type {
  AiInsightFeedItem,
  AutoInsightCategory,
  AutoInsightSeverity,
  AutoInsightWorkflow,
  AutoPersonaId,
  AutomotiveScope3MockData,
} from "./types";
import { canTriageAiInsights } from "./personaAccess";
import { Scope3KpiStrip } from "../scope3-kpi";
import { Scope3DrilldownDrawer, Scope3Panel, Scope3SectionLabel, scope3SelectClass } from "../Pharma/scope3-ui";
import { autoCallout, autoPage, formatTCO2e } from "./automotive-ui";

type SevFilter = "All" | AutoInsightSeverity;
type CatFilter = "All" | AutoInsightCategory;
type WorkflowFilter = "All" | "Active" | AutoInsightWorkflow;

const SEVERITIES: AutoInsightSeverity[] = ["Critical", "High", "Medium", "Low"];
const CATEGORIES: AutoInsightCategory[] = [
  "Supplier Risk",
  "Data Quality",
  "Compliance Gap",
  "Reduction Opportunity",
  "Anomaly Detection",
  "Use phase & portfolio",
];

function sevClass(s: AutoInsightSeverity): string {
  if (s === "Critical") return "bg-[var(--danger-bg)] text-[var(--danger)]";
  if (s === "High") return "bg-[var(--warning-bg)] text-[var(--warning)]";
  if (s === "Medium") return "bg-[var(--info-bg)] text-[var(--info)]";
  return "bg-[var(--muted)] text-[var(--foreground-muted)]";
}

function workflowClass(w: AutoInsightWorkflow): string {
  if (w === "Open") return "bg-violet-500/12 text-violet-700 dark:text-violet-300";
  if (w === "Assigned") return "bg-[var(--primary)]/12 text-[var(--primary)]";
  if (w === "Acknowledged") return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400";
  return "bg-[var(--muted)] text-[var(--foreground-muted)]";
}

export function AIInsightsView({
  data,
  persona,
  highlightInsightId,
  onConsumedHighlightInsight,
}: {
  data: AutomotiveScope3MockData;
  persona: AutoPersonaId;
  highlightInsightId?: string | null;
  onConsumedHighlightInsight?: () => void;
}) {
  const editable = canTriageAiInsights(persona);
  const [insights, setInsights] = useState<AiInsightFeedItem[]>(() => data.insightFeed);
  const [sev, setSev] = useState<SevFilter>("All");
  const [cat, setCat] = useState<CatFilter>("All");
  const [workflow, setWorkflow] = useState<WorkflowFilter>("Active");
  const [drill, setDrill] = useState<AiInsightFeedItem | null>(null);
  const [boardSev, setBoardSev] = useState<AutoInsightSeverity | null>(null);

  const highlightDoneRef = useRef(onConsumedHighlightInsight);
  highlightDoneRef.current = onConsumedHighlightInsight;

  useEffect(() => {
    setInsights(data.insightFeed);
  }, [data.insightFeed]);

  useEffect(() => {
    if (!highlightInsightId) return;
    const hit = data.insightFeed.find((i) => i.id === highlightInsightId);
    if (hit) setDrill(hit);
    highlightDoneRef.current?.();
  }, [highlightInsightId, data.insightFeed]);

  const filtered = useMemo(() => {
    return insights.filter((i) => {
      if (sev !== "All" && i.severity !== sev) return false;
      if (cat !== "All" && i.category !== cat) return false;
      if (workflow === "Active" && (i.workflow === "Dismissed")) return false;
      if (workflow !== "All" && workflow !== "Active" && i.workflow !== workflow) return false;
      return true;
    });
  }, [insights, sev, cat, workflow]);

  const openCount = insights.filter((i) => i.workflow === "Open" || i.workflow === "Assigned").length;
  const criticalCount = insights.filter((i) => i.severity === "Critical" && i.workflow !== "Dismissed").length;
  const totalImpactKt = useMemo(
    () => Math.round(insights.filter((i) => i.workflow !== "Dismissed").reduce((a, i) => a + i.expectedImpactTCO2e, 0) / 1000),
    [insights],
  );

  function patch(id: string, patch: Partial<AiInsightFeedItem>) {
    setInsights((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setDrill((d) => (d?.id === id ? { ...d, ...patch } : d));
  }

  if (persona === "executive") {
    return (
      <div className={autoPage}>
        <p className={autoCallout}>
          <span className="inline-flex items-center gap-1.5 font-semibold text-violet-700 dark:text-violet-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI insights
          </span>{" "}
          — severity mix for leadership. Open a bucket for titles; detailed triage sits with sustainability and procurement.
        </p>
        <Scope3KpiStrip
          cols="sm:grid-cols-2 lg:grid-cols-4"
          items={SEVERITIES.map((s) => ({
            label: s,
            value: String(insights.filter((i) => i.severity === s && i.workflow !== "Dismissed").length),
            sub: "View queue",
            tone: s === "Critical" ? "rose" : s === "High" ? "amber" : s === "Medium" ? "blue" : "emerald",
            onClick: () => setBoardSev(s),
          }))}
        />
        <Scope3DrilldownDrawer
          open={boardSev != null}
          onClose={() => setBoardSev(null)}
          title={boardSev ? `${boardSev} AI insights` : ""}
          subtitle="FY25 Scope 3 queue snapshot"
        >
          {boardSev ? (
            <ul className="space-y-3">
              {insights
                .filter((i) => i.severity === boardSev)
                .map((i) => (
                  <li key={i.id} className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/25 px-3 py-2 text-sm">
                    <p className="font-medium text-[var(--foreground)]">{i.headline}</p>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">{i.category}</p>
                  </li>
                ))}
            </ul>
          ) : null}
        </Scope3DrilldownDrawer>
      </div>
    );
  }

  return (
    <div className={autoPage}>
      <Scope3Panel>
        <Scope3SectionLabel
          title="AI insights queue"
          description="Model-generated signals from inventory, supplier PCF, logistics, and disclosure gaps — ranked by severity and potential abatement."
        />
        <p className={autoCallout}>
          <Sparkles className="mr-1 inline h-3.5 w-3.5 text-violet-600 dark:text-violet-400" aria-hidden />
          <strong className="text-[var(--foreground)]">{openCount} open or assigned</strong> ·{" "}
          <strong className="text-[var(--foreground)]">{criticalCount} critical</strong> active ·{" "}
          <span className="tabular-nums">{totalImpactKt.toLocaleString("en-IN")} ktCO₂e</span> potential if recommendations execute.
          {editable ? null : " Read-only for your persona."}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Queue</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-[var(--foreground)]">{insights.length}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">Total insights</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Active</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-violet-600 dark:text-violet-400">{openCount}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">Open + assigned</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Abatement</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {totalImpactKt.toLocaleString("en-IN")} kt
            </p>
            <p className="text-[10px] text-[var(--foreground-muted)]">Non-dismissed potential</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <FilterSelect label="Severity" value={sev} options={["All", ...SEVERITIES]} onChange={(v) => setSev(v as SevFilter)} />
          <FilterSelect label="Category" value={cat} options={["All", ...CATEGORIES]} onChange={(v) => setCat(v as CatFilter)} />
          <FilterSelect
            label="Workflow"
            value={workflow}
            options={["Active", "All", "Open", "Acknowledged", "Assigned", "Dismissed"]}
            onChange={(v) => setWorkflow(v as WorkflowFilter)}
          />
        </div>
      </Scope3Panel>

      <ul className="space-y-3">
        {filtered.length === 0 ? (
          <li className={autoCallout}>No AI insights match the current filters.</li>
        ) : (
          filtered.map((i) => (
            <li
              key={i.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]"
            >
              <div
                role="button"
                tabIndex={0}
                className="cursor-pointer p-5 transition-colors hover:bg-[var(--muted)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset"
                onClick={() => setDrill(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDrill(i);
                  }
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    AI
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sevClass(i.severity)}`}>{i.severity}</span>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] text-[var(--foreground-muted)]">{i.category}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${workflowClass(i.workflow)}`}>{i.workflow}</span>
                  <span className="ml-auto text-[10px] tabular-nums text-[var(--foreground-muted)]">{i.generatedAt}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[var(--foreground)]">{i.headline}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground-muted)]">{i.body}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--foreground-muted)]">
                  <span>Confidence {i.confidencePct}%</span>
                  {i.linkedSupplier ? <span>Supplier: {i.linkedSupplier}</span> : null}
                  {i.linkedCategoryId != null ? <span>Cat {i.linkedCategoryId}</span> : null}
                  {i.expectedImpactTCO2e > 0 ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      −{formatTCO2e(i.expectedImpactTCO2e, true)} potential
                    </span>
                  ) : (
                    <span>Governance / disclosure</span>
                  )}
                </div>
                <p className="mt-2 text-[11px] font-semibold text-[var(--primary)]">Open dossier →</p>
              </div>
              {editable ? (
                <div className="flex flex-wrap gap-2 border-t border-[var(--border)] bg-[var(--muted)]/15 px-5 py-3">
                  <TriageBtn label="Acknowledge" disabled={i.workflow === "Dismissed"} onClick={() => patch(i.id, { workflow: "Acknowledged" })} />
                  <TriageBtn
                    label="Assign"
                    disabled={i.workflow === "Dismissed"}
                    onClick={() => patch(i.id, { workflow: "Assigned", assignee: "Sustainability Ops" })}
                  />
                  <TriageBtn
                    label="Dismiss"
                    disabled={i.workflow === "Dismissed"}
                    onClick={() =>
                      patch(i.id, {
                        workflow: "Dismissed",
                        dismissReason: "Accepted with disclosure footnote",
                      })
                    }
                  />
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>

      <Scope3DrilldownDrawer
        open={drill != null}
        onClose={() => setDrill(null)}
        title={drill?.headline ?? ""}
        subtitle={drill ? `✦ AI · ${drill.severity} · ${drill.category}` : undefined}
        size="lg"
      >
        {drill ? (
          <div className="space-y-5 text-sm">
            <p className="leading-relaxed text-[var(--foreground-muted)]">{drill.body}</p>
            <div className="rounded-xl border border-[var(--border)] bg-violet-500/5 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">Recommended action</h4>
              <p className="mt-2 text-[var(--foreground)]">{drill.recommendedAction}</p>
            </div>
            {drill.expectedImpactTCO2e > 0 ? (
              <p className="text-sm">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Potential abatement: −{formatTCO2e(drill.expectedImpactTCO2e, true)}
                </span>
              </p>
            ) : null}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Model trace</h4>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs text-[var(--foreground-muted)]">
                <li>Feature import: supplier PCF, invoice lines, production volumes (FY25 close).</li>
                <li>Rule engine v2.4 — materiality and anomaly thresholds by category.</li>
                <li>LLM summary capped at 400 tokens; human review required for Critical items.</li>
              </ol>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Linked entities</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--foreground-muted)]">
                {drill.linkedSupplier ? <li>Supplier: {drill.linkedSupplier}</li> : null}
                {drill.linkedCategoryId != null ? <li>GHG Protocol category: {drill.linkedCategoryId}</li> : null}
                {!drill.linkedSupplier && drill.linkedCategoryId == null ? <li>Portfolio-level signal (no single entity).</li> : null}
              </ul>
            </div>
            <p className="text-xs text-[var(--foreground-muted)]">
              Workflow: <span className="font-medium text-[var(--foreground)]">{drill.workflow}</span>
              {drill.assignee ? ` · Owner: ${drill.assignee}` : ""}
              {drill.dismissReason ? ` · ${drill.dismissReason}` : ""}
              {" · "}Generated {drill.generatedAt}
            </p>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function TriageBtn({ label, disabled, onClick }: { label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-45"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs text-[var(--foreground-muted)] sm:max-w-[200px]">
      <span className="font-semibold">{label}</span>
      <select className={scope3SelectClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
