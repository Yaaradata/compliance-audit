"use client";

import { useMemo, useState } from "react";
import type { BankScope3MockData } from "./types";
import { Scope3Panel, Scope3SectionLabel } from "../Pharma/scope3-ui";
import { Scope3KpiStrip } from "../scope3-kpi";
import { bankBtnPrimary, bankPage, bankTable, bankTableShell, bankTd, bankTh } from "./banking-ui";

function inrCr(n: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n)} cr`;
}

export function GreenFinanceView({ data }: { data: BankScope3MockData }) {
  const g = data.greenFinance;
  const [exported, setExported] = useState(false);
  const totalLoans = useMemo(() => g.greenLoanRows.reduce((s, r) => s + r.amountINRCr, 0), [g.greenLoanRows]);

  return (
    <div className={bankPage}>
      <Scope3KpiStrip
        items={[
          {
            label: "Total green book",
            value: inrCr(g.greenLoansOutstandingINRCr + g.greenBondsOutstandingINRCr + g.greenDepositsINRCr + 8420),
            sub: "Loans + bonds + deposits + SLL (mock roll-up)",
            tone: "emerald",
          },
          {
            label: "Green loans",
            value: inrCr(g.greenLoansOutstandingINRCr),
            sub: `${g.verifiedGreenPct}% third-party verified`,
            tone: "teal",
          },
          {
            label: "Green bonds",
            value: inrCr(g.greenBondsOutstandingINRCr),
            sub: "Outstanding · SPO on file",
            tone: "blue",
          },
          {
            label: "Green deposits",
            value: inrCr(g.greenDepositsINRCr),
            sub: "RBI guideline monitoring",
            tone: "violet",
          },
          {
            label: "SLL book",
            value: `${g.sllCount} facilities`,
            sub: `KPI perf ${g.sllAvgKpiPerformancePct}% · ${g.sllStepTriggersActive} active pricing triggers`,
            tone: "amber",
          },
        ]}
      />

      <section>
        <Scope3SectionLabel
          title="Green loan portfolio"
          description="Use-of-proceeds, verification, and BRSR reportability."
          action={
            <button type="button" className={bankBtnPrimary} onClick={() => setExported(true)}>
              Export BRSR green finance section
            </button>
          }
        />
        {exported ? <p className="mb-3 text-xs font-medium text-[var(--success)]">Mock export queued — BRSR Annexure pack (Excel) generation.</p> : null}
        <div className={bankTableShell}>
          <table className={`min-w-[900px] ${bankTable}`}>
            <thead>
              <tr>
                {["Borrower", "Sector", "Green type", "₹ cr", "Verification", "UoP %", "CO₂e avoided/yr", "Maturity", "BRSR"].map((h) => (
                  <th key={h} className={bankTh}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.greenLoanRows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)] last:border-b-0">
                  <td className={`${bankTd} font-medium`}>{r.borrower}</td>
                  <td className={`${bankTd} text-[var(--foreground-muted)]`}>{r.sector}</td>
                  <td className={bankTd}>{r.greenType}</td>
                  <td className={`${bankTd} font-mono text-xs`}>{r.amountINRCr.toLocaleString("en-IN")}</td>
                  <td className={`${bankTd} text-xs`}>{r.verification}</td>
                  <td className={`${bankTd} font-mono text-xs`}>{r.uopAlignmentPct}%</td>
                  <td className={`${bankTd} font-mono text-xs`}>{r.co2eAvoidedPerYr.toLocaleString("en-IN")}</td>
                  <td className={`${bankTd} text-xs`}>{r.maturity}</td>
                  <td className={bankTd}>{r.brsrReportable ? "Yes" : "No"}</td>
                </tr>
              ))}
              <tr className="border-b-0 bg-[var(--muted)]/40 font-semibold">
                <td className={bankTd} colSpan={3}>
                  Total
                </td>
                <td className={`${bankTd} font-mono text-xs`}>{totalLoans.toLocaleString("en-IN")}</td>
                <td className={`${bankTd} text-xs`} colSpan={5}>
                  Verified {g.verifiedGreenPct}% (book-level)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Scope3Panel>
          <Scope3SectionLabel title="Green bond impact report" description="Series-level allocation & impact metrics." />
          <div className="space-y-4">
            {g.bondSeries.map((b) => (
              <div key={b.isin} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono font-semibold text-[var(--foreground)]">{b.isin}</div>
                  <div className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-bold">{b.cbiCertified ? "CBI certified" : "Non-CBI"}</div>
                </div>
                <div className="mt-2 grid gap-1 text-[var(--foreground-muted)]">
                  <div>
                    <strong>Amount:</strong> {inrCr(b.amountINRCr)} · <strong>Coupon:</strong> {b.couponPct}% · <strong>Maturity:</strong> {b.maturity}
                  </div>
                  <div>
                    <strong>Allocation:</strong> {b.allocationPct}% · <strong>SPO:</strong> {b.opinionProvider}
                  </div>
                  <div>
                    <strong>Use of proceeds:</strong> {b.useOfProceeds.join(", ")}
                  </div>
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-xs text-[var(--foreground-muted)]">
              <div className="font-semibold text-[var(--foreground)]">Impact (mock)</div>
              <div className="mt-1">
                Renewable generation financed: <strong>{g.impact.mwhRenewable.toLocaleString("en-IN")} MWh</strong>
              </div>
              <div>
                CO₂e avoided (est.): <strong>{g.impact.tco2eAvoided.toLocaleString("en-IN")} t/yr</strong>
              </div>
              <div>
                Green area financed: <strong>{g.impact.greenSqKm} sq km</strong> (afforestation + green buildings)
              </div>
            </div>
          </div>
        </Scope3Panel>

        <Scope3Panel>
          <Scope3SectionLabel title="RBI green deposits compliance" description="RBI/2023-24/104 style checklist (illustrative)." />
          <ul className="space-y-2 text-sm">
            {g.rbiGreenDepositChecklist.map((c) => (
              <li key={c.item} className="flex items-start justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <span className="text-[var(--foreground)]">{c.item}</span>
                <span className="shrink-0 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-bold uppercase">{c.status}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--foreground-muted)]">
            Audit trail: third-party allocator confirmation <strong>In Progress</strong> · ring-fence documentation <strong>Compliant</strong> (mock).
          </p>
        </Scope3Panel>
      </div>

      <Scope3Panel>
        <Scope3SectionLabel title="SEBI green bond framework checklist" description="Eight disclosure / process items." />
        <div className="grid gap-2 sm:grid-cols-2">
          {g.sebiGreenBondChecklist.map((c) => (
            <div key={c.item} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
              <span>{c.item}</span>
              <span className={c.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}>{c.ok ? "OK" : "Gap"}</span>
            </div>
          ))}
        </div>
      </Scope3Panel>
    </div>
  );
}
