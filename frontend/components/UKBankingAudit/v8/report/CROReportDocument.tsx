import type { ReactNode } from "react";
import type { CroReportView, ReportHorizonRow } from "@/lib/ukbankingaudit/v8/croReportView";

/**
 * The CRO Report as a formal A4 paper. Self-contained CSS, so the on-screen page,
 * the browser's print output and a generated PDF all share one layout.
 */
export const REPORT_CSS = `
@page { size: A4; margin: 0; }
.cr-doc { font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #1f2937; font-size: 9.5pt; line-height: 1.42; }
.cr-doc *, .cr-doc *::before, .cr-doc *::after { box-sizing: border-box; }
.cr-sheet { position: relative; width: 210mm; height: 297mm; padding: 15mm 17mm 17mm; background: #fff; overflow: hidden; }
.cr-running { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 2mm; margin-bottom: 7mm; border-bottom: 0.4mm solid #12263f; font-size: 8pt; color: #4b5563; }
.cr-running strong { color: #12263f; font-weight: 600; }
.cr-footer { position: absolute; left: 17mm; right: 17mm; bottom: 8mm; display: flex; justify-content: space-between; padding-top: 2mm; border-top: 0.2mm solid #d1d5db; font-size: 7.5pt; color: #6b7280; }
.cr-masthead { margin: -15mm -17mm 7mm; padding: 13mm 17mm 9mm; background: #12263f; color: #fff; }
.cr-eyebrow { font-size: 8.5pt; letter-spacing: 0.08em; text-transform: uppercase; color: #c7d2e0; }
.cr-title { margin: 1.5mm 0 0; font-size: 24pt; line-height: 1.15; font-weight: 600; color: #fff; }
.cr-subtitle { margin: 1mm 0 0; font-size: 12pt; color: #dbe3ee; }
.cr-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin: 0 0 7mm; padding-bottom: 4mm; border-bottom: 0.2mm solid #d1d5db; }
.cr-meta dt { font-size: 7.5pt; color: #6b7280; }
.cr-meta dd { margin: 0.5mm 0 0; font-weight: 600; color: #12263f; }
.cr-h1 { margin: 0 0 4mm; font-size: 15pt; line-height: 1.2; font-weight: 600; color: #12263f; }
.cr-h2 { margin: 6mm 0 2mm; font-size: 10.5pt; font-weight: 600; color: #12263f; }
.cr-lead { margin: 0 0 4mm; color: #374151; }
.cr-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; margin-bottom: 6mm; }
.cr-kpi { padding: 3mm 3.5mm; border: 0.2mm solid #d1d5db; border-top: 0.8mm solid #6b7280; }
.cr-kpi.t-red { border-top-color: #b91c1c; }
.cr-kpi.t-amber { border-top-color: #b45309; }
.cr-kpi.t-green { border-top-color: #047857; }
.cr-kpi-label { font-size: 7.5pt; color: #6b7280; }
.cr-kpi-value { margin-top: 1mm; font-size: 12.5pt; line-height: 1.2; font-weight: 600; color: #12263f; white-space: nowrap; }
.cr-kpi-note { margin-top: 1mm; font-size: 8pt; line-height: 1.3; color: #4b5563; }
.cr-list { margin: 0; padding: 0; list-style: none; }
.cr-list li { position: relative; padding: 0 0 2mm 4mm; }
.cr-list li::before { content: ""; position: absolute; left: 0; top: 1.9mm; width: 1.4mm; height: 1.4mm; background: #12263f; }
.cr-matters { padding: 3.5mm 4mm 2mm; background: #f3f5f8; border-left: 1mm solid #12263f; }
.cr-matters h2 { margin: 0 0 2mm; font-size: 10.5pt; font-weight: 600; color: #12263f; }
.cr-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; line-height: 1.32; }
.cr-table th { padding: 1.5mm 2mm 1.5mm 0; text-align: left; vertical-align: bottom; font-weight: 600; font-size: 7.5pt; color: #12263f; border-bottom: 0.4mm solid #12263f; }
.cr-table td { padding: 1.7mm 2mm 1.7mm 0; vertical-align: top; border-bottom: 0.2mm solid #e5e7eb; }
.cr-table .num { text-align: right; padding-right: 3mm; white-space: nowrap; }
.cr-table .nowrap { white-space: nowrap; }
.cr-strong { font-weight: 600; color: #111827; }
.cr-muted { color: #6b7280; }
.cr-small { font-size: 7.5pt; }
.cr-pill { display: inline-block; padding: 0.2mm 1.6mm; font-size: 7pt; font-weight: 700; letter-spacing: 0.02em; color: #fff; text-transform: uppercase; border-radius: 0.6mm; white-space: nowrap; }
.cr-pill.red { background: #b91c1c; }
.cr-pill.amber { background: #b45309; }
.cr-pill.green { background: #047857; }
.cr-bar { display: block; width: 100%; height: 1.6mm; margin-top: 0.8mm; background: #e5e7eb; }
.cr-bar > span { display: block; height: 100%; background: #12263f; }
.cr-note { margin-top: 5mm; padding-top: 2mm; border-top: 0.2mm solid #d1d5db; font-size: 7.5pt; line-height: 1.35; color: #6b7280; }
.cr-doc a { color: #1d4ed8; text-decoration: none; }
@media screen {
  .cr-doc { padding: 6mm 0; }
  .cr-sheet { margin: 0 auto 6mm; box-shadow: 0 1px 6px rgba(15, 23, 42, 0.18); }
}
@media print {
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  .report-no-print { display: none !important; }
  .report-root { padding: 0 !important; background: #fff !important; }
  .cr-doc { padding: 0; }
  .cr-sheet { margin: 0; box-shadow: none; break-after: page; page-break-after: always; }
  .cr-sheet:last-child { break-after: auto; page-break-after: auto; }
  .cr-doc * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

const CLASSIFICATION = "Confidential";

function Pill({ colour }: { colour: string }) {
  return <span className={`cr-pill ${colour}`}>{colour}</span>;
}

function Sheet({
  report,
  page,
  total,
  masthead,
  children,
}: {
  report: CroReportView;
  page: number;
  total: number;
  masthead?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="cr-sheet">
      {masthead ? null : (
        <div className="cr-running">
          <strong>CRO Risk Report</strong>
          <span>{report.periodLong}</span>
        </div>
      )}
      {children}
      <div className="cr-footer">
        <span>
          {CLASSIFICATION} · Position as at {report.asOfText}
        </span>
        <span>
          Page {page} of {total}
        </span>
      </div>
    </section>
  );
}

function HorizonTable({ rows }: { rows: ReportHorizonRow[] }) {
  return (
    <table className="cr-table">
      <thead>
        <tr>
          <th style={{ width: "27%" }}>Item</th>
          <th style={{ width: "18%" }}>Source</th>
          <th style={{ width: "11%" }}>Date</th>
          <th>Why it matters</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="cr-strong">{row.title}</td>
            <td>{row.sourceUrl ? <a href={row.sourceUrl}>{row.source}</a> : row.source}</td>
            <td className="nowrap">{row.date}</td>
            <td>{row.summary}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const TOTAL_PAGES = 5;

/** Summary, then 1 Risk profile, 2 Risk appetite, 3 Controls and incidents, 4 Horizon scanning. */
export function CROReportDocument({ report }: { report: CroReportView }) {
  const kpis = report.headlineTiles.filter((tile) => tile.id !== "horizon");

  return (
    <div className="cr-doc">
      <style>{REPORT_CSS}</style>

      <Sheet report={report} page={1} total={TOTAL_PAGES} masthead>
        <header className="cr-masthead">
          <div className="cr-eyebrow">Paper for the Board Risk Committee</div>
          <h1 className="cr-title">CRO Risk Report</h1>
          <p className="cr-subtitle">{report.periodLong}</p>
        </header>
        <dl className="cr-meta">
          <div>
            <dt>Presented by</dt>
            <dd>Chief Risk Officer (SMF4)</dd>
          </div>
          <div>
            <dt>Reporting period</dt>
            <dd>{report.periodLong}</dd>
          </div>
          <div>
            <dt>Position as at</dt>
            <dd>{report.asOfText}</dd>
          </div>
          <div>
            <dt>Classification</dt>
            <dd>{CLASSIFICATION}</dd>
          </div>
        </dl>

        <h2 className="cr-h1">Executive summary</h2>
        <div className="cr-kpis">
          {kpis.map((tile) => (
            <div key={tile.id} className={`cr-kpi t-${tile.tone}`}>
              <div className="cr-kpi-label">{tile.label}</div>
              <div className="cr-kpi-value">{tile.value}</div>
              <div className="cr-kpi-note">{tile.note}</div>
            </div>
          ))}
        </div>

        <h3 className="cr-h2" style={{ marginTop: 0 }}>
          Key messages
        </h3>
        <ul className="cr-list">
          {report.summary.map((sentence) => (
            <li key={sentence.text}>
              {sentence.text}
              {sentence.cites.length > 0 ? (
                <span className="cr-muted cr-small"> [{sentence.cites.join(", ")}]</span>
              ) : null}
            </li>
          ))}
        </ul>

        {report.matters.length > 0 ? (
          <div className="cr-matters" style={{ marginTop: "4mm" }}>
            <h2>Matters for the Committee</h2>
            <ul className="cr-list">
              {report.matters.map((matter) => (
                <li key={matter}>{matter}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Sheet>

      <Sheet report={report} page={2} total={TOTAL_PAGES}>
        <h2 className="cr-h1">1. Risk profile</h2>
        <p className="cr-lead">
          Firm risk posture is <Pill colour={report.firmColour} /> ({report.firmTrend}).{" "}
          {report.firmRule}
          {report.drivers.length > 0 ? `; driven by ${report.drivers.join(", ")}` : ""}.
        </p>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "23%" }}>Level-1 risk</th>
              <th style={{ width: "9%" }}>Rating</th>
              <th style={{ width: "13%" }}>Since last review</th>
              <th className="num" style={{ width: "10%" }}>RAMs red / amber</th>
              <th className="num" style={{ width: "9%" }}>Critical controls</th>
              <th className="num" style={{ width: "7%" }}>Sev-1/2</th>
              <th>Basis of rating</th>
            </tr>
          </thead>
          <tbody>
            {report.ratings.map((row) => (
              <tr key={row.id}>
                <td className="cr-strong">{row.label}</td>
                <td><Pill colour={row.colour} /></td>
                <td title={row.trend}>{row.trendWord}</td>
                <td className="num">
                  {row.ramRed} / {row.ramAmber}
                </td>
                <td className="num">{row.criticalPct}%</td>
                <td className="num">{row.sevOneTwo}</td>
                <td>
                  {row.why}
                  {row.path ? <div className="cr-muted cr-small">Path to green: {row.path}</div> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cr-note">
          <strong>Assurance:</strong> {report.assurance}. <strong>Rating rule:</strong> {report.ratingRule}
        </div>
      </Sheet>

      <Sheet report={report} page={3} total={TOTAL_PAGES}>
        <h2 className="cr-h1">2. Risk appetite</h2>
        <p className="cr-lead">
          Of {report.appetiteTotals.total} risk appetite metrics, {report.appetiteTotals.green} are green,{" "}
          {report.appetiteTotals.amber} amber and {report.appetiteTotals.red} red. Red and amber metrics are set out below.
        </p>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "24%" }}>Metric</th>
              <th className="num" style={{ width: "10%" }}>Value</th>
              <th className="num" style={{ width: "7%" }}>Limit</th>
              <th className="num" style={{ width: "8%" }}>Tolerance</th>
              <th style={{ width: "22%" }}>Cause</th>
              <th style={{ width: "11%" }}>Path to green</th>
              <th>Second line and committee</th>
            </tr>
          </thead>
          <tbody>
            {report.appetite.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="cr-strong">{row.name}</span>
                  <div style={{ marginTop: "0.6mm" }}>
                    <Pill colour={row.colour} /> <span className="cr-muted cr-small">{row.categoryLabel}</span>
                  </div>
                </td>
                <td className="num cr-strong">{row.value}</td>
                <td className="num">{row.limit}</td>
                <td className="num">{row.tolerance}</td>
                <td>{row.cause}</td>
                <td>{row.path}</td>
                <td>
                  {row.secondLine}
                  <div className="cr-muted cr-small">{row.committee}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>

      <Sheet report={report} page={4} total={TOTAL_PAGES}>
        <h2 className="cr-h1">3. Controls and incidents</h2>
        <p className="cr-lead">
          {report.controlsPct}% of critical controls are effective
          {report.controlsPrevPct !== null ? `, against ${report.controlsPrevPct}% in the previous period` : ""}.
        </p>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "34%" }}>Level-1 risk</th>
              <th className="num" style={{ width: "13%" }}>This period</th>
              <th className="num" style={{ width: "13%" }}>Previous</th>
              <th>Critical controls effective</th>
            </tr>
          </thead>
          <tbody>
            {report.controlCategories.map((row) => (
              <tr key={row.id}>
                <td className="cr-strong">{row.label}</td>
                <td className="num">{row.pct}%</td>
                <td className="num">{row.prevPct === null ? "None" : `${row.prevPct}%`}</td>
                <td>
                  <span className="cr-bar">
                    <span style={{ width: `${row.pct}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="cr-h2">Month-on-month movement</h3>
        {report.moves.length === 0 ? (
          <p>No critical control result changed in the period.</p>
        ) : (
          <ul className="cr-list">
            {report.moves.map((move) => (
              <li key={move}>{move.replace(" — ", ". ")}</li>
            ))}
          </ul>
        )}

        <h3 className="cr-h2">Sev-1 and Sev-2 incidents</h3>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Date</th>
              <th style={{ width: "8%" }}>Severity</th>
              <th style={{ width: "34%" }}>Incident</th>
              <th style={{ width: "19%" }}>Category</th>
              <th style={{ width: "7%" }}>Status</th>
              <th>Linked controls</th>
            </tr>
          </thead>
          <tbody>
            {report.incidents.map((row) => (
              <tr key={row.id}>
                <td className="nowrap">{row.date}</td>
                <td className="cr-strong nowrap">{row.severity.replace(/^Sev(\d)$/, "Sev-$1")}</td>
                <td>{row.title}</td>
                <td>{row.category}</td>
                <td style={{ textTransform: "capitalize" }}>{row.status}</td>
                <td>{row.controls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>

      <Sheet report={report} page={5} total={TOTAL_PAGES}>
        <h2 className="cr-h1">4. Horizon scanning</h2>
        <h3 className="cr-h2" style={{ marginTop: 0 }}>Regulatory</h3>
        <HorizonTable rows={report.horizon.regulatory} />
        <h3 className="cr-h2">Industry events</h3>
        <HorizonTable rows={report.horizon.industry} />
        <h3 className="cr-h2">Emerging risks</h3>
        <HorizonTable rows={report.horizon.emerging} />
        <div className="cr-note">
          Ratings in this paper are calculated by rule from risk appetite metrics, control test results and incidents.
          Identifiers in square brackets refer to the underlying records.
        </div>
      </Sheet>
    </div>
  );
}
