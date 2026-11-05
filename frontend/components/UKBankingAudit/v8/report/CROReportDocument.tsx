import type { ReactNode } from "react";
import { formatDate } from "@/lib/ukbankingaudit/v8/boardView";
import type { CroReportView, ReportHorizonRow } from "@/lib/ukbankingaudit/v8/croReportView";

/**
 * The CRO Report in UK board paper form: cover block, decisions first, the CRO's
 * overview, principal risks against appetite, emerging risks, then an appendix.
 *
 * Self-contained CSS. On screen the paper fills the window. In print and PDF each
 * section is one A4 sheet, and a sheet that overflows adds a page rather than clipping.
 */
export const REPORT_CSS = `
@page { size: A4; margin: 0; }
.cr-doc { font-family: Arial, Helvetica, sans-serif; color: #1f2933; font-size: 9pt; line-height: 1.4; background: #fff; }
.cr-doc *, .cr-doc *::before, .cr-doc *::after { box-sizing: border-box; }
.cr-sheet { position: relative; background: #fff; }
.cr-running { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 1.5mm; margin-bottom: 5mm; border-bottom: 0.25mm solid #1b2a41; font-size: 7.5pt; color: #52606d; letter-spacing: 0.02em; }
.cr-footer { display: flex; justify-content: space-between; padding-top: 1.5mm; border-top: 0.2mm solid #cbd2d9; font-size: 7pt; color: #616e7c; }
.cr-org { font-size: 8pt; letter-spacing: 0.14em; text-transform: uppercase; color: #52606d; }
.cr-title { margin: 1mm 0 0; font-family: Georgia, "Times New Roman", serif; font-size: 22pt; line-height: 1.15; font-weight: 400; color: #1b2a41; }
.cr-titlerule { height: 0.7mm; margin: 2.5mm 0 3.5mm; background: #1b2a41; }
.cr-cover { width: 100%; border-collapse: collapse; margin-bottom: 4.5mm; font-size: 8.5pt; }
.cr-cover th, .cr-cover td { padding: 1.1mm 2mm; border: 0.2mm solid #cbd2d9; text-align: left; vertical-align: top; }
.cr-cover th { width: 16%; font-weight: 700; color: #1b2a41; background: #f0f3f7; }
.cr-cover td { width: 34%; }
.cr-h1 { margin: 0 0 2.5mm; font-family: Georgia, "Times New Roman", serif; font-size: 13.5pt; line-height: 1.2; font-weight: 400; color: #1b2a41; }
.cr-h2 { margin: 4mm 0 1.5mm; font-size: 9.5pt; font-weight: 700; color: #1b2a41; }
.cr-lead { margin: 0 0 2.5mm; }
.cr-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-bottom: 3.5mm; border: 0.2mm solid #cbd2d9; }
.cr-kpi { padding: 2mm 2.5mm; border-left: 0.2mm solid #cbd2d9; }
.cr-kpi:first-child { border-left: 0; }
.cr-kpi-label { font-size: 7pt; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: #52606d; }
.cr-kpi-value { margin-top: 0.7mm; font-family: Georgia, "Times New Roman", serif; font-size: 13pt; line-height: 1.2; color: #1b2a41; white-space: nowrap; }
.cr-kpi-value.t-red { color: #a61b1b; }
.cr-kpi-note { margin-top: 0.5mm; font-size: 7.5pt; line-height: 1.25; color: #52606d; }
.cr-numbered { margin: 0; padding: 0 0 0 5mm; list-style: decimal; }
.cr-numbered li { padding: 0 0 1.2mm 0.5mm; }
.cr-plain { margin: 0; padding: 0 0 0 4mm; list-style: disc; }
.cr-plain li { padding: 0 0 1mm 0; }
.cr-signoff { margin: 2mm 0 0; font-weight: 700; color: #1b2a41; }
.cr-decisions { margin-bottom: 4mm; padding: 2.5mm 3mm 1.5mm; border: 0.3mm solid #1b2a41; }
.cr-decisions h2 { margin: 0 0 1.5mm; font-size: 9.5pt; font-weight: 700; color: #1b2a41; }
.cr-table { width: 100%; border-collapse: collapse; font-size: 8pt; line-height: 1.28; }
.cr-table th { padding: 1.1mm 1.5mm; text-align: left; vertical-align: bottom; font-weight: 700; font-size: 7.25pt; color: #1b2a41; background: #f0f3f7; border-top: 0.3mm solid #1b2a41; border-bottom: 0.3mm solid #1b2a41; }
.cr-table td { padding: 1.1mm 1.5mm; vertical-align: top; border-bottom: 0.15mm solid #d9dee4; }
.cr-table.tight { font-size: 7.25pt; line-height: 1.15; }
.cr-table.tight td { padding: 0.55mm 1.5mm; }
.cr-table .num { text-align: right; white-space: nowrap; }
.cr-table .nowrap { white-space: nowrap; }
.cr-strong { font-weight: 700; color: #1f2933; }
.cr-muted { color: #616e7c; }
.cr-small { font-size: 7pt; }
.cr-rag { display: inline-block; font-size: 7pt; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
.cr-rag::before { content: ""; display: inline-block; width: 2mm; height: 2mm; margin-right: 1mm; vertical-align: -0.2mm; background: currentColor; }
.cr-rag.red { color: #a61b1b; }
.cr-rag.amber { color: #a15c00; }
.cr-rag.green { color: #17693f; }
.cr-bar { display: block; width: 100%; height: 1.5mm; margin-top: 1mm; background: #e4e7eb; }
.cr-bar > span { display: block; height: 100%; background: #1b2a41; }
.cr-note { margin-top: 3mm; padding-top: 1.5mm; border-top: 0.2mm solid #cbd2d9; font-size: 7.25pt; line-height: 1.3; color: #52606d; }
.cr-doc a { color: #1f4e8c; text-decoration: none; }
@media screen {
  .cr-sheet { width: 100%; padding: 28px clamp(16px, 3vw, 56px) 20px; border-bottom: 1px solid #cbd2d9; }
  .cr-footer { margin-top: 20px; }
  .cr-doc { font-size: 10.5pt; }
  .cr-table { font-size: 9.5pt; }
  .cr-table th { font-size: 8.5pt; }
  .cr-table.tight { font-size: 9pt; }
  .cr-kpi-value { font-size: 18pt; }
  .cr-kpi-note, .cr-kpi-label { font-size: 8.5pt; }
  .cr-cover { font-size: 10pt; }
  .cr-title { font-size: 26pt; }
  .cr-h1 { font-size: 16pt; }
}
@media print {
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  .report-no-print { display: none !important; }
  .report-root { padding: 0 !important; background: #fff !important; }
  .cr-sheet { width: 210mm; min-height: 296.5mm; padding: 12mm 16mm 15mm; break-after: page; page-break-after: always; }
  .cr-sheet:last-child { break-after: auto; page-break-after: auto; }
  .cr-footer { position: absolute; left: 16mm; right: 16mm; bottom: 7mm; }
  .cr-doc * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;

const CLASSIFICATION = "Confidential";
const TOTAL_PAGES = 7;

function Rag({ colour }: { colour: string }) {
  return <span className={`cr-rag ${colour}`}>{colour}</span>;
}

function Sheet({
  report,
  page,
  first = false,
  children,
}: {
  report: CroReportView;
  page: number;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="cr-sheet">
      {first ? null : (
        <div className="cr-running">
          <span>Board Risk Committee · CRO Risk Report</span>
          <span>{report.periodLong}</span>
        </div>
      )}
      {children}
      <div className="cr-footer">
        <span>
          {CLASSIFICATION} · Position as at {report.asOfText}
        </span>
        <span>
          Page {page} of {TOTAL_PAGES}
        </span>
      </div>
    </section>
  );
}

function HorizonTable({ rows, showRelevance = false }: { rows: ReportHorizonRow[]; showRelevance?: boolean }) {
  return (
    <table className="cr-table">
      <thead>
        <tr>
          <th style={{ width: "23%" }}>Item</th>
          <th style={{ width: "15%" }}>Source</th>
          <th style={{ width: "10%" }}>Date</th>
          <th>Why it matters</th>
          {showRelevance ? <th style={{ width: "9%" }}>Relevant to us?</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.kind}-${row.id}`}>
            <td>
              <span className="cr-strong">{row.title}</span>
              {row.decision ? <div className="cr-muted cr-small">Decision: {row.decision}</div> : null}
            </td>
            <td>{row.sourceUrl ? <a href={row.sourceUrl}>{row.source}</a> : row.source}</td>
            <td className="nowrap">{row.date}</td>
            <td>{row.summary}</td>
            {showRelevance ? <td>{row.relevance}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Green reads "Within appetite" here: the controls figure already has its own column. */
function basisOfRating(why: string, colour: string): string {
  return colour === "green" ? why.split(" · ")[0] : why;
}

const TREND_WORD = { worse: "Worsened", better: "Improved", flat: "Unchanged" };
const SEVERITY = /^Sev(\d)$/;

export function CROReportDocument({ report }: { report: CroReportView }) {
  const headline = report.headlineTiles.filter((tile) => tile.id !== "horizon");
  const decisions = report.matters.filter((m) => m.startsWith("Decide"));
  const toNote = report.matters.filter((m) => !m.startsWith("Decide"));

  return (
    <div className="cr-doc">
      <style>{REPORT_CSS}</style>

      <Sheet report={report} page={1} first>
        <div className="cr-org">Board Risk Committee</div>
        <h1 className="cr-title">Chief Risk Officer&apos;s Report</h1>
        <div className="cr-titlerule" />
        <table className="cr-cover">
          <tbody>
            <tr>
              <th scope="row">Meeting</th>
              <td>Board Risk Committee</td>
              <th scope="row">Reporting period</th>
              <td>{report.periodLong}</td>
            </tr>
            <tr>
              <th scope="row">Presented by</th>
              <td>{report.preparedBy}</td>
              <th scope="row">Position as at</th>
              <td>{report.asOfText}</td>
            </tr>
            <tr>
              <th scope="row">Purpose</th>
              <td>{decisions.length > 0 ? "For decision and noting" : "For noting"}</td>
              <th scope="row">Classification</th>
              <td>{CLASSIFICATION}</td>
            </tr>
          </tbody>
        </table>

        {report.matters.length > 0 ? (
          <div className="cr-decisions">
            <h2>Decisions requested and matters to note</h2>
            <ol className="cr-numbered">
              {[...decisions, ...toNote].map((matter) => (
                <li key={matter}>{matter}</li>
              ))}
            </ol>
          </div>
        ) : null}

        <h2 className="cr-h1">Chief Risk Officer&apos;s overview</h2>
        <div className="cr-kpis">
          {headline.map((tile) => (
            <div key={tile.id} className="cr-kpi">
              <div className="cr-kpi-label">{tile.label}</div>
              <div className={`cr-kpi-value ${tile.id === "firm" ? `t-${tile.tone}` : ""}`}>{tile.value}</div>
              <div className="cr-kpi-note">{tile.note}</div>
            </div>
          ))}
        </div>
        <ol className="cr-numbered">
          {report.summary.map((sentence) => (
            <li key={sentence.text}>
              {sentence.text}
              {sentence.cites.length > 0 ? (
                <span className="cr-muted cr-small"> [{sentence.cites.join(", ")}]</span>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="cr-signoff">{report.preparedBy}</p>
      </Sheet>

      <Sheet report={report} page={2}>
        <h2 className="cr-h1">1. Risk profile</h2>
        <p className="cr-lead">
          The risk profile against Board-approved risk appetite is <Rag colour={report.firmColour} /> ({report.firmTrend}). Rule: {report.firmRule}
          {report.drivers.length > 0 ? `. Driven by ${report.drivers.join(" and ")}` : ""}.
        </p>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "24%" }}>Principal risk</th>
              <th style={{ width: "8%" }}>Rating</th>
              <th style={{ width: "10%" }}>Since last review</th>
              <th className="num" style={{ width: "8%" }}>RAMs red / amber</th>
              <th className="num" style={{ width: "8%" }}>Critical controls</th>
              <th className="num" style={{ width: "6%" }}>Sev-1/2</th>
              <th>Basis of rating and path to green</th>
            </tr>
          </thead>
          <tbody>
            {report.ratings.map((row) => (
              <tr key={row.id}>
                <td className="cr-strong">{row.label}</td>
                <td><Rag colour={row.colour} /></td>
                <td title={row.trend}>{row.trendWord}</td>
                <td className="num">
                  {row.ramRed} / {row.ramAmber}
                </td>
                <td className="num">{row.criticalPct}%</td>
                <td className="num">{row.sevOneTwo}</td>
                <td>
                  {basisOfRating(row.why, row.colour)}
                  {row.path ? <div className="cr-muted cr-small">Path to green: {row.path}</div> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="cr-h2">Top material items</h3>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "24%" }}>Item</th>
              <th style={{ width: "17%" }}>Position</th>
              <th>Cause and proposed action</th>
              <th style={{ width: "15%" }}>Owner</th>
              <th style={{ width: "10%" }}>Target</th>
            </tr>
          </thead>
          <tbody>
            {report.spotlight.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="cr-strong">{row.name}</span>
                  <div className="cr-muted cr-small">{row.categoryLabel}</div>
                </td>
                <td>{row.measure.replace(/\bSev(\d)\b/, "Sev-$1")}</td>
                <td>
                  {row.cause ?? "No path to green"}
                  {row.response ? <div className="cr-muted cr-small">Action: {row.response}</div> : null}
                </td>
                <td>{row.owner}</td>
                <td className="nowrap">
                  {row.targetDate ? formatDate(row.targetDate) : "None"}
                  {row.overdue ? <div className="cr-small cr-strong">Overdue</div> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="cr-h2">What changed from last review</h3>
        <ol className="cr-numbered">
          {report.whatChanged.map((row) => (
            <li key={row.id}>
              {row.text.replace(/\bSev(\d)\b/, "Sev-$1")} <span className="cr-muted cr-small">[{row.evidenceRef}]</span>
            </li>
          ))}
        </ol>
      </Sheet>

      <Sheet report={report} page={3}>
        <h2 className="cr-h1">2. Risk appetite position</h2>
        <p className="cr-lead">
          Of {report.appetiteTotals.total} risk appetite metrics, {report.appetiteTotals.green} are green,{" "}
          {report.appetiteTotals.amber} amber and {report.appetiteTotals.red} red. Metrics outside appetite follow, with the
          proposed action for each; Appendix A lists all of them.
        </p>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Metric</th>
              <th style={{ width: "8%" }}>Status</th>
              <th className="num" style={{ width: "9%" }}>Value</th>
              <th className="num" style={{ width: "6%" }}>Limit</th>
              <th className="num" style={{ width: "7%" }}>Tolerance</th>
              <th style={{ width: "22%" }}>Cause and proposed action</th>
              <th style={{ width: "10%" }}>Path to green</th>
              <th>Second line and committee</th>
            </tr>
          </thead>
          <tbody>
            {report.appetite.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="cr-strong">{row.name}</span>
                  <div className="cr-muted cr-small">{row.owner}</div>
                </td>
                <td><Rag colour={row.colour} /></td>
                <td className="num cr-strong">{row.value}</td>
                <td className="num">{row.limit}</td>
                <td className="num">{row.tolerance}</td>
                <td>
                  {row.cause}
                  {row.response ? <div className="cr-muted cr-small">Action: {row.response}</div> : null}
                </td>
                <td>{row.path}</td>
                <td>
                  {row.secondLine}
                  <div className="cr-muted cr-small">{row.committee}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="cr-h2">What has not changed</h3>
        <table className="cr-table">
          <thead>
            <tr>
              <th>Standing position</th>
              <th className="num" style={{ width: "8%" }}>Days</th>
              <th style={{ width: "13%" }}>Next target</th>
              <th style={{ width: "30%" }}>Committee</th>
            </tr>
          </thead>
          <tbody>
            {report.standing.map((row) => (
              <tr key={row.id}>
                <td>{row.text}</td>
                <td className="num">{row.durationDays}</td>
                <td className="nowrap">
                  {row.targetDate ? formatDate(row.targetDate) : "None"}
                  {row.overdue ? <div className="cr-small cr-strong">Overdue</div> : null}
                </td>
                <td>{row.committee ?? "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>

      <Sheet report={report} page={4}>
        <h2 className="cr-h1">3. Controls and incidents</h2>
        <p className="cr-lead">
          {report.controlsPct}% of critical controls are effective
          {report.controlsPrevPct !== null ? `, against ${report.controlsPrevPct}% in the previous period` : ""}.
        </p>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "34%" }}>Principal risk</th>
              <th className="num" style={{ width: "11%" }}>This period</th>
              <th className="num" style={{ width: "11%" }}>Previous</th>
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
          <p className="cr-lead">No critical control result changed in the period.</p>
        ) : (
          <ul className="cr-plain">
            {report.moves.map((move) => (
              <li key={move}>{move.replace(" — ", ". ")}</li>
            ))}
          </ul>
        )}

        <h3 className="cr-h2">Sev-1 and Sev-2 incidents</h3>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "11%" }}>Date</th>
              <th style={{ width: "8%" }}>Severity</th>
              <th style={{ width: "33%" }}>Incident</th>
              <th style={{ width: "20%" }}>Category</th>
              <th style={{ width: "7%" }}>Status</th>
              <th>Linked controls</th>
            </tr>
          </thead>
          <tbody>
            {report.incidents.map((row) => (
              <tr key={row.id}>
                <td className="nowrap">{row.date}</td>
                <td className="cr-strong nowrap">{row.severity.replace(SEVERITY, "Sev-$1")}</td>
                <td>{row.title}</td>
                <td>{row.category}</td>
                <td style={{ textTransform: "capitalize" }}>{row.status}</td>
                <td>{row.controls}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="cr-h2">Testing and evidence</h3>
        <ul className="cr-plain">
          <li>{report.assurance}.</li>
          {report.evidenceWarnings.map((warning) => (
            <li key={warning}>{warning}.</li>
          ))}
          {report.overdueTests.map((test) => (
            <li key={test.id}>
              Test overdue: {test.id} {test.name}, {test.categoryLabel}, due {formatDate(test.dueDate)}.
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet report={report} page={5}>
        <h2 className="cr-h1">4. Horizon scanning and emerging risks</h2>
        <h3 className="cr-h2" style={{ marginTop: 0 }}>Regulatory</h3>
        <HorizonTable rows={report.horizon.regulatory} />
        <h3 className="cr-h2">Industry events</h3>
        <HorizonTable rows={report.horizon.industry} showRelevance />
        <h3 className="cr-h2">Emerging risks</h3>
        <HorizonTable rows={report.horizon.emerging} />
      </Sheet>

      <Sheet report={report} page={6}>
        <h2 className="cr-h1">Appendix A: Risk appetite metric register</h2>
        <table className="cr-table tight">
          <thead>
            <tr>
              <th style={{ width: "42%" }}>Metric</th>
              <th style={{ width: "24%" }}>Category</th>
              <th className="num">Value</th>
              <th className="num">Limit</th>
              <th className="num">Tolerance</th>
              <th>Status</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {report.metricRegister.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.categoryLabel}</td>
                <td className="num">{row.valueText}</td>
                <td className="num">{row.limitText}</td>
                <td className="num">{row.toleranceText}</td>
                <td><Rag colour={row.status} /></td>
                <td>{TREND_WORD[row.trend]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>

      <Sheet report={report} page={7}>
        <h2 className="cr-h1">Appendix B: RCSA major gaps</h2>
        <p className="cr-lead">{report.rcsaNote}.</p>
        <table className="cr-table">
          <thead>
            <tr>
              <th style={{ width: "13%" }}>Obligation</th>
              <th style={{ width: "13%" }}>Coverage</th>
              <th style={{ width: "15%" }}>Owner</th>
              <th>Remediation action</th>
              <th style={{ width: "11%" }}>Target close</th>
              <th style={{ width: "10%" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {report.majorGaps.map((row) => (
              <tr key={row.obligationId}>
                <td>
                  <span className="cr-strong">{row.citation}</span>
                  <div className="cr-muted cr-small">{row.regulator}</div>
                </td>
                <td>{row.coverage}</td>
                <td>{row.owner}</td>
                <td>{row.action ?? "No action recorded"}</td>
                <td className="nowrap">{row.targetDate ? formatDate(row.targetDate) : "Not set"}</td>
                <td>{row.status ?? "Not recorded"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="cr-h1" style={{ marginTop: "7mm" }}>Governance notes</h2>
        <table className="cr-cover">
          <tbody>
            <tr>
              <th scope="row">Prepared by</th>
              <td>{report.preparedBy}</td>
              <th scope="row">Next review</th>
              <td>{report.nextReview}</td>
            </tr>
          </tbody>
        </table>
        <p className="cr-lead">
          <strong>Firm rating rule:</strong> {report.firmRule}.
        </p>
        <p className="cr-lead">
          <strong>Category rating rule:</strong> {report.ratingRule}
        </p>
        <p className="cr-lead">
          Ratings are calculated by rule from risk appetite metrics, control test results and incidents. Identifiers in
          square brackets refer to the underlying records.
        </p>
      </Sheet>
    </div>
  );
}
