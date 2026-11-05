"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { buildCroReport, type ReportHorizonRow } from "@/lib/ukbankingaudit/v8/croReportView";
import { useRiskState } from "../useRiskStore";

const RAG_CHIP: Record<string, string> = {
  red: "bg-red-600 text-white",
  amber: "bg-amber-500 text-white",
  green: "bg-emerald-600 text-white",
};

const PRINT_CSS = `
@page { size: A4; margin: 12mm 13mm 15mm; }
.report-page { width: 182mm; }
@media print {
  html, body { background: #fff !important; }
  .report-no-print { display: none !important; }
  .report-root { background: #fff !important; padding: 0 !important; }
  .report-page { break-after: page; box-shadow: none !important; border: 0 !important; margin: 0 !important; padding: 0 !important; width: auto; }
  .report-page:last-of-type { break-after: auto; }
  .report-page-footer { display: none !important; }
  .report-print-footer { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

function Chip({ colour }: { colour: string }) {
  return (
    <span className={`inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase ${RAG_CHIP[colour] ?? "bg-slate-500 text-white"}`}>
      {colour}
    </span>
  );
}

const TH = "py-1 pr-2 text-left text-[9px] font-semibold uppercase tracking-wide text-slate-500";
const TD = "py-1 pr-2 align-top text-[10px] leading-snug text-slate-700";

function ReportPage({ title, footer, children }: { title: string; footer: string; children: ReactNode }) {
  return (
    <section className="report-page mx-auto mb-6 flex flex-col rounded-lg border border-slate-200 bg-white p-[12mm] shadow-sm">
      <h2 className="mb-3 border-b-2 border-slate-900 pb-1 text-[15px] font-extrabold text-slate-900">{title}</h2>
      <div className="flex-1">{children}</div>
      <p className="report-page-footer mt-4 border-t border-slate-200 pt-1 text-[9px] text-slate-500">{footer}</p>
    </section>
  );
}

function HorizonGroup({ title, rows }: { title: string; rows: ReportHorizonRow[] }) {
  return (
    <div className="mb-4">
      <h3 className="mb-1 text-[11px] font-bold text-slate-900">{title}</h3>
      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li key={row.id} className="text-[10px] leading-snug text-slate-700">
            <span className="font-semibold text-slate-900">{row.title}</span> · {row.source} · {row.date}
            <br />
            {row.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Print-ready committee pack: a summary plus four pages, A4. */
export function CROReportV8() {
  const router = useRouter();
  const { data } = useRiskState();
  const report = buildCroReport(data.config.currentPeriod, data);
  const footer = `CRO Report · Reporting period ${report.periodText} · ${report.asOfText}`;

  return (
    <div className="report-root min-h-screen bg-slate-100 py-6">
      <style>{PRINT_CSS}</style>
      <div className="report-no-print mx-auto mb-4 flex w-[182mm] max-w-full flex-wrap items-center justify-between gap-2 px-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Board View
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Download PDF
        </button>
      </div>

      <p className="report-print-footer hidden text-center text-[9px] text-slate-500">{footer}</p>

      <ReportPage title={`CRO Report: ${report.periodText}`} footer={footer}>
        <h3 className="mb-2 text-[12px] font-bold text-slate-900">Summary</h3>
        <ul className="space-y-2">
          {report.summary.map((sentence) => (
            <li key={sentence.text} className="text-[12px] leading-relaxed text-slate-800">
              {sentence.text}
              {sentence.cites.length > 0 ? (
                <span className="ml-1 font-mono text-[9px] text-slate-500">[{sentence.cites.join(", ")}]</span>
              ) : null}
            </li>
          ))}
        </ul>
      </ReportPage>

      <ReportPage title="1. Risk profile" footer={footer}>
        <div className="mb-3 text-[11px] text-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">Firm risk posture</span>
            <Chip colour={report.firmColour} />
            <span className="text-slate-600">{report.firmTrend}</span>
          </div>
          <p className="mt-1">Rule: {report.firmRule}.</p>
          {report.drivers.length > 0 ? <p>Driven by: {report.drivers.join(", ")}.</p> : null}
          <p>Assurance: {report.assurance}.</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-300">
              <th className={TH}>Level-1 risk</th>
              <th className={TH}>Rating</th>
              <th className={TH}>Trend</th>
              <th className={TH}>Why</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.ratings.map((row) => (
              <tr key={row.id}>
                <td className={`${TD} font-semibold text-slate-900`}>{row.label}</td>
                <td className={TD}><Chip colour={row.colour} /></td>
                <td className={`${TD} whitespace-nowrap`}>{row.trend}</td>
                <td className={TD}>
                  {row.why}
                  {row.path ? <span className="block text-slate-500">Path to green: {row.path}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportPage>

      <ReportPage title="2. Risk appetite" footer={footer}>
        <p className="mb-2 text-[11px] text-slate-800">
          {report.appetiteTotals.total} metrics: {report.appetiteTotals.green} green · {report.appetiteTotals.amber} amber ·{" "}
          {report.appetiteTotals.red} red. Red and amber metrics:
        </p>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-300">
              <th className={TH}>Metric</th>
              <th className={TH}>Value</th>
              <th className={TH}>Cause</th>
              <th className={TH}>Path to green</th>
              <th className={TH}>2nd line</th>
              <th className={TH}>Committee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.appetite.map((row) => (
              <tr key={row.id}>
                <td className={TD}>
                  <span className="font-semibold text-slate-900">{row.name}</span> <Chip colour={row.colour} />
                  <span className="block text-slate-500">{row.categoryLabel}</span>
                </td>
                <td className={TD}>{row.measure}</td>
                <td className={TD}>{row.cause}</td>
                <td className={`${TD} whitespace-nowrap`}>{row.path}</td>
                <td className={TD}>{row.secondLine}</td>
                <td className={TD}>{row.committee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportPage>

      <ReportPage title="3. Controls and incidents" footer={footer}>
        <p className="mb-2 text-[11px] text-slate-800">
          Critical controls effective: {report.controlsPct}%
          {report.controlsPrevPct !== null ? ` (previous period ${report.controlsPrevPct}%)` : ""}.
        </p>
        <table className="mb-3 w-full">
          <thead>
            <tr className="border-b border-slate-300">
              <th className={TH}>Level-1 risk</th>
              <th className={TH}>This period</th>
              <th className={TH}>Previous</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.controlCategories.map((row) => (
              <tr key={row.id}>
                <td className={TD}>{row.label}</td>
                <td className={`${TD} font-semibold text-slate-900`}>{row.pct}%</td>
                <td className={TD}>{row.prevPct === null ? "None" : `${row.prevPct}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mb-1 text-[11px] font-bold text-slate-900">Month-on-month movement</h3>
        {report.moves.length === 0 ? (
          <p className="mb-3 text-[10px] text-slate-700">No critical control result changed.</p>
        ) : (
          <ul className="mb-3 space-y-0.5 text-[10px] text-slate-700">
            {report.moves.map((move) => (
              <li key={move}>{move}</li>
            ))}
          </ul>
        )}
        <h3 className="mb-1 text-[11px] font-bold text-slate-900">Sev-1 and Sev-2 incidents</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-300">
              <th className={TH}>Date</th>
              <th className={TH}>Severity</th>
              <th className={TH}>Incident</th>
              <th className={TH}>Category</th>
              <th className={TH}>Status</th>
              <th className={TH}>Linked controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.incidents.map((row) => (
              <tr key={row.id}>
                <td className={`${TD} whitespace-nowrap`}>{row.date}</td>
                <td className={`${TD} font-bold`}>{row.severity}</td>
                <td className={TD}>{row.title}</td>
                <td className={TD}>{row.category}</td>
                <td className={`${TD} capitalize`}>{row.status}</td>
                <td className={TD}>{row.controls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportPage>

      <ReportPage title="4. Horizon scanning" footer={footer}>
        <HorizonGroup title="Regulatory" rows={report.horizon.regulatory} />
        <HorizonGroup title="Industry events" rows={report.horizon.industry} />
        <HorizonGroup title="Emerging risks" rows={report.horizon.emerging} />
      </ReportPage>
    </div>
  );
}
