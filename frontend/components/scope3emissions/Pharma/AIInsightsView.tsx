"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AiInsight, InsightCategory, InsightSeverity, InsightWorkflowState, PersonaId, Scope3MockData } from "./types";
import { canEditInsights, isBoardHighLevel } from "./personaAccess";
import { Scope3KpiStrip } from "../scope3-kpi";
import { Scope3DrilldownDrawer, scope3SelectClass, scope3ToolbarSurface } from "./scope3-ui";

export function AIInsightsView({
  data,
  persona,
  highlightInsightId,
  onConsumedHighlightInsight,
}: {
  data: Scope3MockData;
  persona: PersonaId;
  /** When set (e.g. deep-linked from GHG Gases), opens the dossier drawer once for this id. */
  highlightInsightId?: string | null;
  onConsumedHighlightInsight?: () => void;
}) {
  const board = isBoardHighLevel(persona);
  const editable = canEditInsights(persona);

  const [insights, setInsights] = useState<AiInsight[]>(() => data.aiInsights);
  const [sev, setSev] = useState<"All" | InsightSeverity>("All");
  const [cat, setCat] = useState<"All" | InsightCategory>("All");
  const [insightDrill, setInsightDrill] = useState<AiInsight | null>(null);
  const [boardSevDrill, setBoardSevDrill] = useState<InsightSeverity | null>(null);

  const highlightDoneRef = useRef(onConsumedHighlightInsight);
  highlightDoneRef.current = onConsumedHighlightInsight;

  useEffect(() => {
    if (board) return;
    const merged =
      persona === "procurement_gm" ? [...data.procurementGmInsights, ...data.aiInsights] : data.aiInsights;
    const seen = new Set<string>();
    setInsights(
      merged.filter((i) => {
        if (seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      }),
    );
  }, [board, persona, data]);

  useEffect(() => {
    if (board || !highlightInsightId) return;
    const merged =
      persona === "procurement_gm" ? [...data.procurementGmInsights, ...data.aiInsights] : data.aiInsights;
    const seen = new Set<string>();
    const pool = merged.filter((i) => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });
    const hit = pool.find((i) => i.id === highlightInsightId);
    if (hit) setInsightDrill(hit);
    // Clear deep-link even if id is stale so the query string does not stick.
    highlightDoneRef.current?.();
  }, [board, highlightInsightId, persona, data.aiInsights, data.procurementGmInsights]);

  const topEmittersProcurement = useMemo(() => {
    if (persona !== "procurement_gm") return [];
    return [...data.suppliers]
      .sort((a, b) => b.scope3ContributionTCO2e - a.scope3ContributionTCO2e || a.name.localeCompare(b.name))
      .slice(0, 5);
  }, [persona, data.suppliers]);

  const filtered = useMemo(() => {
    return insights.filter((i) => {
      if (sev !== "All" && i.severity !== sev) return false;
      if (cat !== "All" && i.category !== cat) return false;
      return true;
    });
  }, [insights, sev, cat]);

  const newThisMonth = insights.filter((i) => i.workflow === "Open" || i.workflow === "Assigned").length;
  const lastMonth = 5;

  function patch(id: string, patch: Partial<AiInsight>) {
    setInsights((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  if (board) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-[var(--foreground-muted)]">
          Severity mix for leadership — click a card for titles in that bucket. Detailed triage sits with ESG and procurement.
        </p>
        <Scope3KpiStrip
          cols="sm:grid-cols-2 lg:grid-cols-4"
          items={(["Critical", "High", "Medium", "Low"] as const).map((s) => ({
            label: s,
            value: String(insights.filter((i) => i.severity === s).length),
            sub: "View list",
            tone: s === "Critical" ? "rose" : s === "High" ? "amber" : s === "Medium" ? "blue" : "emerald",
            onClick: () => setBoardSevDrill(s),
          }))}
        />
        <Scope3DrilldownDrawer
          open={boardSevDrill != null}
          onClose={() => setBoardSevDrill(null)}
          title={boardSevDrill ? `${boardSevDrill} insights` : ""}
          subtitle="Queue snapshot"
        >
          {boardSevDrill ? (
            <ul className="space-y-3">
              {insights
                .filter((i) => i.severity === boardSevDrill)
                .map((i) => (
                  <li
                    key={i.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-sm ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]"
                  >
                    <div className="font-medium text-[var(--foreground)]">{i.title}</div>
                    <div className="mt-1 text-xs text-[var(--foreground-muted)]">{i.category}</div>
                  </li>
                ))}
              {insights.filter((i) => i.severity === boardSevDrill).length === 0 ? (
                <li className="text-sm text-[var(--foreground-muted)]">No items in this bucket.</li>
              ) : null}
            </ul>
          ) : null}
        </Scope3DrilldownDrawer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {persona === "procurement_gm" ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--primary-muted)]/25 p-4 text-sm leading-relaxed text-[var(--foreground-muted)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.06]">
          <span className="font-semibold text-[var(--foreground)]">Procurement intelligence</span> — top emitters, cost–emission trade-offs, and disclosure gaps are pre-loaded for
          Category 1–8 follow-up. Items merge with the enterprise AI queue; severity filters apply across both streams.
        </p>
      ) : null}
      {persona === "procurement_gm" && topEmittersProcurement.length > 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
            Top upstream suppliers by Scope 3 contribution (tCO₂e)
          </h3>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            Deterministic ranking for Category 1–8 engagement — aligns with GHG Protocol inventory materiality.
          </p>
          <ol className="mt-3 space-y-2 text-sm">
            {topEmittersProcurement.map((s, i) => (
              <li
                key={s.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/25 px-3 py-2 ring-1 ring-slate-900/[0.03] dark:ring-white/[0.05]"
              >
                <span className="text-[var(--foreground)]">
                  <span className="font-mono text-xs text-[var(--foreground-muted)]">{i + 1}.</span> {s.name}
                </span>
                <span className="tabular-nums font-semibold text-[var(--foreground)]">
                  {Math.round(s.scope3ContributionTCO2e).toLocaleString("en-IN")} tCO₂e
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      <div
        className={`${scope3ToolbarSurface} flex flex-col gap-4 bg-[var(--muted)]/25 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--foreground-muted)] shadow-sm ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
          <span className="font-semibold text-[var(--foreground)]">{newThisMonth}</span> open / in-flight · vs{" "}
          <span className="tabular-nums">{lastMonth}</span> prior month (baseline)
        </div>
        <div className="flex flex-wrap gap-2">
          <Filter label="Severity" value={sev} options={["All", "Critical", "High", "Medium", "Low"]} onChange={(v) => setSev(v as typeof sev)} />
          <Filter
            label="Category"
            value={cat}
            options={[
              "All",
              "Supplier Risk",
              "Data Quality",
              "Compliance Gap",
              "Reduction Opportunity",
              "Anomaly Detection",
              "Procurement Intelligence",
            ]}
            onChange={(v) => setCat(v as typeof cat)}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {filtered.map((i) => (
          <li
            key={i.id}
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-md)] ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]"
          >
            <div
              role="button"
              tabIndex={0}
              className="cursor-pointer p-5 transition-colors hover:bg-[var(--muted)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-inset"
              onClick={() => setInsightDrill(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setInsightDrill(i);
                }
              }}
            >
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${sevClass(i.severity)}`}>
                {i.severity}
              </span>
              <span className="ml-2 inline-block rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--foreground-muted)]">
                {i.category}
              </span>
              <div className="mt-2 text-sm font-semibold text-[var(--foreground)]">{i.title}</div>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">{i.detail}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--foreground-muted)]">
                <span>Confidence: {i.confidencePct}%</span>
                {i.linkedSupplier && <span>Supplier: {i.linkedSupplier}</span>}
                {i.linkedCategoryId != null && <span>Category: {i.linkedCategoryId}</span>}
                <span>State: {i.workflow}</span>
                {i.assignee && <span>Assignee: {i.assignee}</span>}
                {i.dismissReason && <span>Dismiss reason: {i.dismissReason}</span>}
              </div>
              <p className="mt-2 text-sm text-[var(--foreground)]">
                <span className="font-semibold">Recommended: </span>
                {i.recommendedAction}
              </p>
              <p className="mt-3 text-[11px] font-semibold text-[var(--primary)]">Open full dossier →</p>
            </div>
            {editable && (
              <div className="flex flex-wrap gap-2 border-t border-[var(--border)] bg-[var(--muted)]/20 px-5 py-3">
                <button
                  type="button"
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium hover:bg-[var(--muted)]"
                  onClick={() => patch(i.id, { workflow: "Acknowledged" as InsightWorkflowState })}
                  disabled={i.workflow === "Dismissed"}
                >
                  Acknowledge
                </button>
                <button
                  type="button"
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium hover:bg-[var(--muted)]"
                  onClick={() =>
                    patch(i.id, {
                      workflow: "Assigned" as InsightWorkflowState,
                      assignee: "Sustainability Ops",
                    })
                  }
                  disabled={i.workflow === "Dismissed"}
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium hover:bg-[var(--muted)]"
                  onClick={() =>
                    patch(i.id, {
                      workflow: "Dismissed" as InsightWorkflowState,
                      dismissReason: "Accepted with disclosure footnote",
                    })
                  }
                  disabled={i.workflow === "Dismissed"}
                >
                  Dismiss…
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Scope3DrilldownDrawer
        open={insightDrill != null}
        onClose={() => setInsightDrill(null)}
        title={insightDrill?.title ?? ""}
        subtitle={insightDrill ? `${insightDrill.severity} · ${insightDrill.category}` : undefined}
      >
        {insightDrill ? (
          <div className="space-y-4 text-sm text-[var(--foreground-muted)]">
            <p>{insightDrill.detail}</p>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Model trace</h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                <li>Feature import: supplier submissions + invoice lines (FY close).</li>
                <li>Rule engine v2.3 — anomaly thresholds by segment.</li>
                <li>LLM summary capped at 400 tokens; human reviewer required for Critical.</li>
              </ol>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Linked entities</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {insightDrill.linkedSupplier ? <li>Supplier: {insightDrill.linkedSupplier}</li> : null}
                {insightDrill.linkedCategoryId != null ? <li>Category ID: {insightDrill.linkedCategoryId}</li> : null}
                {!insightDrill.linkedSupplier && insightDrill.linkedCategoryId == null ? (
                  <li>No hard entity link — portfolio-level signal.</li>
                ) : null}
              </ul>
            </div>
            <p className="text-xs">
              Workflow: <span className="font-medium text-[var(--foreground)]">{insightDrill.workflow}</span>
              {insightDrill.assignee ? ` · Owner: ${insightDrill.assignee}` : ""}
            </p>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}

function sevClass(s: InsightSeverity): string {
  if (s === "Critical") return "bg-[var(--danger-bg)] text-[var(--danger)]";
  if (s === "High") return "bg-[var(--warning-bg)] text-[var(--warning)]";
  if (s === "Medium") return "bg-[var(--info-bg)] text-[var(--info)]";
  return "bg-[var(--muted)] text-[var(--foreground-muted)]";
}

function Filter({
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
    <label className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
      <span className="font-medium">{label}</span>
      <select
        className={scope3SelectClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
