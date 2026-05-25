"use client";

import { useMemo, useState } from "react";
import type { AiInsight, BankPersonaId, BankScope3MockData, InsightSeverity } from "./types";
import { filterAiInsightsForPersona, isBoardPersona } from "./personaAccess";
import { Scope3DrilldownDrawer, Scope3Panel, scope3SelectClass, scope3ToolbarSurface } from "../Pharma/scope3-ui";
import { Scope3KpiStrip } from "../scope3-kpi";
import { bankBtnPrimary, bankBtnSecondary, bankCallout, bankPage } from "./banking-ui";

function sevColor(s: InsightSeverity): string {
  if (s === "Critical") return "var(--danger)";
  if (s === "High") return "var(--warning)";
  if (s === "Medium") return "var(--foreground-muted)";
  return "var(--foreground-subtle)";
}

export function AIInsightsView({ data, persona }: { data: BankScope3MockData; persona: BankPersonaId }) {
  const board = isBoardPersona(persona);
  const pool = useMemo(() => filterAiInsightsForPersona(persona, data.aiInsights, data.borrowers), [data.aiInsights, data.borrowers, persona]);
  const [sev, setSev] = useState<"All" | InsightSeverity>("All");
  const [cat, setCat] = useState<string>("All");
  const [active, setActive] = useState<AiInsight | null>(null);

  const filtered = useMemo(() => {
    return pool.filter((i) => {
      if (sev !== "All" && i.severity !== sev) return false;
      if (cat !== "All" && i.category !== cat) return false;
      return true;
    });
  }, [pool, sev, cat]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(pool.map((p) => p.category)))], [pool]);

  if (board) {
    const counts = (["Critical", "High", "Medium", "Low"] as const).map((s) => ({
      sev: s,
      n: data.aiInsights.filter((i) => i.severity === s).length,
    }));
    return (
      <div className={bankPage}>
        <p className={bankCallout}>Board view — severity distribution only. Detailed triage is owned by management.</p>
        <Scope3KpiStrip
          cols="sm:grid-cols-2 lg:grid-cols-4"
          items={counts.map((c, i) => ({
            label: c.sev,
            value: String(c.n),
            sub: "Open insights in queue",
            tone: c.sev === "Critical" ? "rose" : c.sev === "High" ? "amber" : c.sev === "Medium" ? "blue" : "emerald",
          }))}
        />
      </div>
    );
  }

  return (
    <div className={bankPage}>
      <div className={`${scope3ToolbarSurface} flex flex-wrap items-end gap-3`}>
        <label className="text-xs text-[var(--foreground-muted)]">
          Severity
          <select className={`${scope3SelectClass} mt-1`} value={sev} onChange={(e) => setSev(e.target.value as typeof sev)}>
            {(["All", "Critical", "High", "Medium", "Low"] as const).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[var(--foreground-muted)]">
          Category
          <select className={`${scope3SelectClass} mt-1 min-w-[220px]`} value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto text-xs text-[var(--foreground-muted)]">
          <span className="font-semibold text-[var(--foreground)]">{pool.length}</span> in queue · avg resolution (mock):{" "}
          <span className="font-mono">18 days</span>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((i) => (
          <Scope3Panel key={i.id} className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: sevColor(i.severity) }}>
                    {i.severity}
                  </span>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--foreground-muted)]">{i.category}</span>
                  <span className="text-[10px] text-[var(--foreground-subtle)]">Confidence {i.confidencePct}%</span>
                </div>
                <div className="mt-2 text-base font-semibold text-[var(--foreground)]">{i.title}</div>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">{i.detail}</p>
                <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
                  Linked: <strong className="text-[var(--foreground)]">{i.linkedEntity}</strong>
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button type="button" className={bankBtnSecondary} onClick={() => setActive(i)}>
                  Open
                </button>
                <button type="button" className={bankBtnPrimary}>
                  Assign
                </button>
              </div>
            </div>
          </Scope3Panel>
        ))}
      </div>

      <Scope3DrilldownDrawer
        open={active != null}
        title={active?.title ?? ""}
        subtitle={active?.category}
        onClose={() => setActive(null)}
        footer={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={bankBtnSecondary}>
              Acknowledge
            </button>
            <button type="button" className={bankBtnSecondary}>
              Dismiss with reason
            </button>
          </div>
        }
      >
        {active ? (
          <div className="space-y-2 text-sm text-[var(--foreground-muted)]">
            <p>{active.detail}</p>
            <p>
              <strong className="text-[var(--foreground)]">Recommended:</strong> {active.recommendedAction}
            </p>
          </div>
        ) : null}
      </Scope3DrilldownDrawer>
    </div>
  );
}
