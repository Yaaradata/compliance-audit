"use client";

import type { ReactNode } from "react";
import type { CarbonLensAssetClassDrill, CarbonLensLineItem, CarbonLensLineItemDrill } from "./types";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">{title}</h4>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function statusDot(status?: "ok" | "warning" | "gap") {
  if (status === "warning") return "text-amber-600 dark:text-amber-400";
  if (status === "gap") return "text-rose-600 dark:text-rose-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function EvidenceList({ rows }: { rows: { label: string; value: string; status?: "ok" | "warning" | "gap" }[] }) {
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.label} className="flex gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <span className={`mt-0.5 shrink-0 font-mono text-[10px] ${statusDot(row.status)}`}>●</span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[var(--foreground)]">{row.label}</div>
            <div className="text-xs text-[var(--foreground-muted)]">{row.value}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export type CarbonLensDrill =
  | { kind: "line"; title: string; subtitle?: string; item: CarbonLensLineItem }
  | { kind: "asset"; title: string; drill: CarbonLensAssetClassDrill };

function LineItemDrillBody({ drill, item }: { drill: CarbonLensLineItemDrill; item: CarbonLensLineItem }) {
  return (
    <div className="space-y-5 text-sm">
      <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-xs font-medium text-[var(--foreground-muted)]">
        {drill.exposurePath}
      </p>
      <p className="leading-relaxed text-[var(--foreground-muted)]">{drill.narrative}</p>

      <dl className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Metric 1</dt>
          <dd className="mt-1 font-mono text-sm font-semibold text-[var(--foreground)]">{item.metric1}</dd>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Metric 2</dt>
          <dd className="mt-1 font-mono text-sm text-[var(--foreground)]">{item.metric2 ?? "—"}</dd>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Metric 3</dt>
          <dd className="mt-1 font-mono text-sm text-[var(--foreground)]">{item.metric3 ?? "—"}</dd>
        </div>
      </dl>

      {drill.pcafDetail ? (
        <Section title="PCAF attribution lens">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--primary)]/20 bg-[var(--primary-muted)]/15 p-3">
              <dt className="text-xs text-[var(--foreground-muted)]">Score</dt>
              <dd className="mt-1 font-semibold text-[var(--foreground)]">{drill.pcafDetail.scoreLabel}</dd>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <dt className="text-xs text-[var(--foreground-muted)]">Confidence</dt>
              <dd className="mt-1 font-semibold text-[var(--foreground)]">{drill.pcafDetail.confidence}</dd>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 sm:col-span-2">
              <dt className="text-xs text-[var(--foreground-muted)]">Method option</dt>
              <dd className="mt-1 text-[var(--foreground)]">{drill.pcafDetail.option}</dd>
              <dd className="mt-1 text-xs text-[var(--foreground-muted)]">Data vintage: {drill.pcafDetail.dataVintage}</dd>
            </div>
          </dl>
        </Section>
      ) : null}

      <Section title="Metric breakdown">
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2">Component</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {drill.breakdown.map((b) => (
                <tr key={b.label} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-medium text-[var(--foreground)]">{b.label}</td>
                  <td className="px-3 py-2 font-mono text-[var(--foreground-muted)]">{b.value}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{b.sharePct != null ? `${b.sharePct}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Methodology">
        <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
          {drill.methodology.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>

      <Section title="Data & assurance layer">
        <EvidenceList rows={drill.dataLayer} />
      </Section>

      {drill.engagement ? (
        <Section title="Engagement & governance">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <dt className="text-xs text-[var(--foreground-muted)]">Status</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{drill.engagement.status}</dd>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <dt className="text-xs text-[var(--foreground-muted)]">Owner</dt>
              <dd className="mt-1 text-sm text-[var(--foreground)]">{drill.engagement.owner}</dd>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <dt className="text-xs text-[var(--foreground-muted)]">Next review</dt>
              <dd className="mt-1 font-mono text-sm text-[var(--foreground)]">{drill.engagement.nextReview}</dd>
            </div>
            {drill.engagement.covenant ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <dt className="text-xs text-[var(--foreground-muted)]">Covenant</dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{drill.engagement.covenant}</dd>
              </div>
            ) : null}
          </dl>
        </Section>
      ) : null}

      <Section title="Controls mapped">
        <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
          {drill.controls.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>

      <Section title="Evidence pack">
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2">Document</th>
                <th className="px-3 py-2">Dated</th>
                <th className="px-3 py-2">Relied upon</th>
              </tr>
            </thead>
            <tbody>
              {drill.evidencePack.map((e) => (
                <tr key={e.doc} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-medium text-[var(--foreground)]">{e.doc}</td>
                  <td className="px-3 py-2 font-mono text-[var(--foreground-muted)]">{e.dated}</td>
                  <td className="px-3 py-2 text-[var(--foreground-muted)]">{e.reliedUpon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Open findings">
        <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
          {drill.openFindings.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>

      <Section title="Suggested actions">
        <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
          {drill.suggestedActions.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function AssetClassDrillBody({ drill }: { drill: CarbonLensAssetClassDrill }) {
  return (
    <div className="space-y-5 text-sm">
      <p className="leading-relaxed text-[var(--foreground-muted)]">{drill.narrative}</p>
      <Section title="Methodology">
        <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
          {drill.methodology.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>
      <Section title="Top concentrations (illustrative)">
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2 text-right">Exposure ₹ Cr</th>
                <th className="px-3 py-2 text-right">tCO₂e</th>
                <th className="px-3 py-2 text-center">PCAF</th>
              </tr>
            </thead>
            <tbody>
              {drill.topCounterparties.map((c) => (
                <tr key={c.name} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 font-medium text-[var(--foreground)]">{c.name}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{c.exposureCr.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{c.tco2e.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2 text-center font-mono font-semibold">{c.pcafScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Data layer">
        <EvidenceList rows={drill.dataLayer} />
      </Section>
      <Section title="Controls">
        <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
          {drill.controls.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

export function CarbonLensDrillBody({ drill }: { drill: CarbonLensDrill }): ReactNode {
  if (drill.kind === "asset") {
    return <AssetClassDrillBody drill={drill.drill} />;
  }
  const d = drill.item.drill;
  if (!d) {
    return (
      <p className="text-sm text-[var(--foreground-muted)]">
        Detailed working papers for this line are not yet attached in the demo pack.
      </p>
    );
  }
  return <LineItemDrillBody drill={d} item={drill.item} />;
}
