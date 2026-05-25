"use client";

import type { ReactNode } from "react";
import type {
  UpstreamDownstreamBorrowerDrillMock,
  UpstreamDownstreamCategoryDrillMock,
  UpstreamDownstreamMoneySegmentDrillMock,
  UpstreamDownstreamSectorPointDrillMock,
  UpstreamDownstreamSupplierDrillMock,
} from "./types";

export type UdDrill =
  | { kind: "category"; title: string; drill: UpstreamDownstreamCategoryDrillMock }
  | { kind: "supplier"; title: string; drill: UpstreamDownstreamSupplierDrillMock }
  | { kind: "segment"; title: string; drill: UpstreamDownstreamMoneySegmentDrillMock }
  | { kind: "sector"; title: string; drill: UpstreamDownstreamSectorPointDrillMock }
  | { kind: "borrower"; title: string; drill: UpstreamDownstreamBorrowerDrillMock };

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

export function UpstreamDownstreamDrillBody({ drill }: { drill: UdDrill }): ReactNode {
  if (drill.kind === "category") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <p className="leading-relaxed text-[var(--foreground-muted)]">{d.narrative}</p>
        <Section title="Methodology">
          <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
            {d.methodology.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
        <Section title="Site / location split (mock)">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Site</th>
                  <th className="px-3 py-2 text-right">tCO₂e</th>
                  <th className="px-3 py-2 text-right">Share</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {d.sites.map((s) => (
                  <tr key={s.name} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-medium text-[var(--foreground)]">{s.name}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{s.tco2e.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.sharePct}%</td>
                    <td className="px-3 py-2 text-[var(--foreground-muted)]">{s.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Data & assurance layer">
          <ul className="space-y-2">
            {d.dataLayer.map((row) => (
              <li key={row.label} className="flex gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
                <span className={`mt-0.5 shrink-0 font-mono text-[10px] ${statusDot(row.status)}`}>●</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[var(--foreground)]">{row.label}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">{row.value}</div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Controls mapped">
          <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
            {d.controls.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
        <Section title="Open findings / actions">
          <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
            {d.openFindings.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
      </div>
    );
  }

  if (drill.kind === "supplier") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <dt className="text-xs text-[var(--foreground-muted)]">Vendor ID</dt>
            <dd className="mt-1 font-mono text-[var(--foreground)]">{d.vendorId}</dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <dt className="text-xs text-[var(--foreground-muted)]">Contract / PO ref</dt>
            <dd className="mt-1 font-mono text-[var(--foreground)]">{d.contractId}</dd>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 sm:col-span-2">
            <dt className="text-xs text-[var(--foreground-muted)]">Spend FY</dt>
            <dd className="mt-1 text-[var(--foreground)]">{d.spendFY}</dd>
          </div>
        </dl>
        <Section title="Emission factor & scope-2 treatment">
          <p className="text-[var(--foreground-muted)]">{d.efSource}</p>
          {d.scope2MarketBasedNote ? <p className="mt-2 text-[var(--foreground-muted)]">{d.scope2MarketBasedNote}</p> : null}
        </Section>
        <Section title="tCO₂e breakdown (modelled)">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Component</th>
                  <th className="px-3 py-2 text-right">tCO₂e</th>
                  <th className="px-3 py-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {d.breakdown.map((b) => (
                  <tr key={b.label} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--foreground)]">{b.label}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{b.tco2e.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{b.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Submission & review">
          <p className="text-[var(--foreground-muted)]">
            <span className="font-semibold text-[var(--foreground)]">Status:</span> {d.submissionStatus}
          </p>
          <p className="mt-2 text-[var(--foreground-muted)]">{d.reviewerNote}</p>
        </Section>
      </div>
    );
  }

  if (drill.kind === "segment") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <p className="leading-relaxed text-[var(--foreground-muted)]">{d.bookShareNarrative}</p>
        <Section title="Top concentrations (illustrative)">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2 text-right">Exposure ₹ Cr</th>
                  <th className="px-3 py-2 text-right">tCO₂e</th>
                  <th className="px-3 py-2">Sector tag</th>
                </tr>
              </thead>
              <tbody>
                {d.topConcentrations.map((r) => (
                  <tr key={r.name} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-medium text-[var(--foreground)]">{r.name}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{r.exposureCr.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{r.tco2e.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-[var(--foreground-muted)]">{r.sector ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="PCAF rationale">
          <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
            {d.pcafRationale.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
        <Section title="Limits & mitigants">
          <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
            {d.limitsAndMitigants.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
        {d.stressCase ? (
          <Section title="Stress lens">
            <p className="text-[var(--foreground-muted)]">{d.stressCase}</p>
          </Section>
        ) : null}
      </div>
    );
  }

  if (drill.kind === "sector") {
    const d = drill.drill;
    return (
      <div className="space-y-5 text-sm">
        <p className="leading-relaxed text-[var(--foreground)]">{d.macroLink}</p>
        <Section title="Policy / disclosure hooks">
          <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
            {d.policyHooks.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
        <Section title="Illustrative anchor borrowers">
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
                <tr>
                  <th className="px-3 py-2">Borrower</th>
                  <th className="px-3 py-2 text-right">Exposure ₹ Cr</th>
                  <th className="px-3 py-2 text-center">PCAF</th>
                </tr>
              </thead>
              <tbody>
                {d.topBorrowers.map((r) => (
                  <tr key={r.name} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 font-medium text-[var(--foreground)]">{r.name}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{r.exposureCr.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-center font-mono font-semibold">{r.pcafScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Watch signals">
          <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
            {d.watchSignals.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
      </div>
    );
  }

  if (drill.kind !== "borrower") return null;

  const d = drill.drill;
  return (
    <div className="space-y-5 text-sm">
      <Section title="Attribution walk-through">
        <ol className="space-y-3">
          {d.attributionSteps.map((s, i) => (
            <li key={s.label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="text-xs font-semibold text-[var(--foreground)]">
                {i + 1}. {s.label}
              </div>
              <div className="mt-1 text-xs text-[var(--foreground-muted)]">{s.detail}</div>
              {s.value ? <div className="mt-2 font-mono text-sm font-semibold tabular-nums text-[var(--foreground)]">{s.value}</div> : null}
            </li>
          ))}
        </ol>
      </Section>
      <Section title="Evidence pack (mock)">
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-[var(--muted)]/50 text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
              <tr>
                <th className="px-3 py-2">Document</th>
                <th className="px-3 py-2">Dated</th>
                <th className="px-3 py-2">Relied upon for</th>
              </tr>
            </thead>
            <tbody>
              {d.evidencePack.map((e) => (
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
      <Section title="Data gaps">
        <ul className="list-disc space-y-1 pl-5 text-[var(--foreground-muted)]">
          {d.dataGaps.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Section>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <dt className="text-xs text-[var(--foreground-muted)]">Engagement status</dt>
          <dd className="mt-1 text-[var(--foreground)]">{d.engagementStatus}</dd>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
          <dt className="text-xs text-[var(--foreground-muted)]">Next review</dt>
          <dd className="mt-1 font-mono text-[var(--foreground)]">{d.nextReview}</dd>
        </div>
      </dl>
    </div>
  );
}
