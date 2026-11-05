"use client";

import { useMemo, useState } from "react";
import { buildRiskAppetiteStrip, formatDate } from "@/lib/ukbankingaudit/v8/boardView";
import { buildRamRows, type RamRow, type RamTrend } from "@/lib/ukbankingaudit/v8/riskAppetiteView";
import type { RatingColour } from "@/lib/ukbankingaudit/v8/types";
import { PathToGreenDrawer, type PathTarget } from "../PathToGreenDrawer";
import { RAG_STYLES } from "../ragTokens";
import { useRiskState } from "../useRiskStore";

type StatusFilter = "all" | RatingColour;

const TREND: Record<RamTrend, { arrow: string; className: string; label: string }> = {
  worse: { arrow: "▲", className: "text-red-700", label: "Worse than last period" },
  better: { arrow: "▼", className: "text-emerald-700", label: "Better than last period" },
  flat: { arrow: "▬", className: "text-slate-500", label: "No change from last period" },
};

const SECOND_LINE_LABEL = { accepted: "accepted", challenged: "challenged", pending: "pending" };

function StatusChip({ status }: { status: RatingColour }) {
  const rag = RAG_STYLES[status];
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${rag.badge} ${rag.badgeText}`}>{status}</span>
  );
}

/** Six-month line. One colour, no axes: the table beside it carries the numbers. */
function Sparkline({ row }: { row: RamRow }) {
  const width = 76;
  const height = 22;
  const values = row.series.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => (values.length < 2 ? width / 2 : 3 + (i * (width - 6)) / (values.length - 1));
  const y = (v: number) => (max === min ? height / 2 : 3 + ((max - v) * (height - 6)) / (max - min));
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const summary = row.series.map((s) => `${s.period}: ${s.value.toLocaleString("en-GB")}`).join(", ");
  return (
    <svg width={width} height={height} role="img" aria-label={`${row.name}. ${summary}`} className="block">
      <title>{summary}</title>
      <polyline points={points} fill="none" stroke="#475569" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="2.5" fill="#1e293b" />
    </svg>
  );
}

/** Risk appetite: actual values against limit and tolerance, with the path back to green. */
export function RiskAppetiteTabV8() {
  const { data } = useRiskState();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pathTarget, setPathTarget] = useState<PathTarget | null>(null);

  const rows = useMemo(() => buildRamRows(data.config.currentPeriod, data), [data]);
  const strip = useMemo(() => buildRiskAppetiteStrip(data.config.currentPeriod, data), [data]);
  const spotlight = rows.filter((r) => r.status !== "green");
  const visible = rows.filter(
    (r) => (category === "all" || r.categoryId === category) && (status === "all" || r.status === status),
  );

  const applyFilter = (nextCategory: string, nextStatus: StatusFilter) => {
    setCategory(nextCategory);
    setStatus(nextStatus);
  };
  const openPath = (row: RamRow) =>
    setPathTarget({ targetType: "ram", targetId: row.id, label: row.name, owner: row.owner });

  const cellClass = (active: boolean) =>
    `w-full rounded px-2 py-1 text-center text-[13px] font-semibold transition hover:bg-slate-100 ${
      active ? "bg-indigo-100 text-indigo-800" : "text-slate-800"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Risk Appetite</h1>
        <p className="mt-1 text-sm text-slate-600">
          {strip.total} metrics across your {data.config.riskTaxonomy.length} Level-1 risks: {strip.green} green ·{" "}
          {strip.amber} amber · {strip.red} red
        </p>
      </div>

      {spotlight.length > 0 ? (
        <section aria-label="Red and amber metrics">
          <h2 className="mb-3 text-base font-bold text-slate-900">Outside appetite</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {spotlight.map((row) => {
              const rag = RAG_STYLES[row.status];
              return (
                <article key={row.id} className={`flex flex-col rounded-xl border-[1.5px] p-3.5 ${rag.bg} ${rag.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-bold leading-snug text-slate-900">{row.name}</h3>
                    <StatusChip status={row.status} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {row.valueText} vs limit {row.limitText}
                  </p>
                  {row.path ? (
                    <dl className="mt-2 space-y-1 text-[11.5px] text-slate-700">
                      <div>
                        <dt className="inline font-semibold">Cause: </dt>
                        <dd className="inline">{row.path.cause}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Owner: </dt>
                        <dd className="inline">{row.path.owner}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Path to green: </dt>
                        <dd className="inline">{formatDate(row.path.targetDate)}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">2nd line: </dt>
                        <dd className="inline">{SECOND_LINE_LABEL[row.path.secondLineVerdict]}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-2 text-[11px] font-bold text-red-700">No path to green</p>
                  )}
                  <button
                    type="button"
                    onClick={() => openPath(row)}
                    className="mt-3 self-start rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {row.path ? "Open path to green" : "Add path to green"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-slate-900">By Level-1 risk</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-1.5 pr-3">Level-1 risk</th>
                <th scope="col" className="w-20 text-center">Green</th>
                <th scope="col" className="w-20 text-center">Amber</th>
                <th scope="col" className="w-20 text-center">Red</th>
                <th scope="col" className="w-20 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {strip.byCategory.map((row) => {
                const isCategory = category === row.categoryId;
                const total = row.green + row.amber + row.red;
                const cells: { key: RatingColour; value: number }[] = [
                  { key: "green", value: row.green },
                  { key: "amber", value: row.amber },
                  { key: "red", value: row.red },
                ];
                return (
                  <tr key={row.categoryId}>
                    <th scope="row" className="py-1 pr-3 text-[13px] font-medium text-slate-800">{row.label}</th>
                    {cells.map((cell) => (
                      <td key={cell.key} className="px-1">
                        <button
                          type="button"
                          aria-label={`Show ${cell.key} metrics in ${row.label}: ${cell.value}`}
                          aria-pressed={isCategory && status === cell.key}
                          className={cellClass(isCategory && status === cell.key)}
                          onClick={() => applyFilter(row.categoryId, cell.key)}
                        >
                          {cell.value}
                        </button>
                      </td>
                    ))}
                    <td className="px-1">
                      <button
                        type="button"
                        aria-label={`Show all metrics in ${row.label}: ${total}`}
                        aria-pressed={isCategory && status === "all"}
                        className={cellClass(isCategory && status === "all")}
                        onClick={() => applyFilter(row.categoryId, "all")}
                      >
                        {total}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Metrics ({visible.length})</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <label className="flex items-center gap-1.5">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
              >
                <option value="all">All</option>
                {strip.byCategory.map((row) => (
                  <option key={row.categoryId} value={row.categoryId}>
                    {row.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
              >
                <option value="all">All</option>
                <option value="red">Red</option>
                <option value="amber">Amber</option>
                <option value="green">Green</option>
              </select>
            </label>
            {category !== "all" || status !== "all" ? (
              <button
                type="button"
                onClick={() => applyFilter("all", "all")}
                className="rounded border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pr-3">Metric</th>
                <th scope="col" className="pr-3">Category</th>
                <th scope="col" className="pr-3">Owner</th>
                <th scope="col" className="pr-3 text-right">Value</th>
                <th scope="col" className="pr-3 text-right">Limit</th>
                <th scope="col" className="pr-3 text-right">Tolerance</th>
                <th scope="col" className="pr-3">Status</th>
                <th scope="col" className="pr-3">Trend</th>
                <th scope="col">6 months</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((row) => {
                const trend = TREND[row.trend];
                return (
                  <tr key={row.id} className="align-middle">
                    <td className="py-2 pr-3">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      {row.forNextBoardRiskCommittee ? (
                        <div className="mt-0.5 text-[10.5px] font-semibold text-red-700">For next Board Risk Committee</div>
                      ) : null}
                      {row.status !== "green" ? (
                        <button
                          type="button"
                          onClick={() => openPath(row)}
                          className="mt-0.5 block text-[10.5px] font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2"
                        >
                          {row.path ? "Path to green" : "Add path to green"}
                        </button>
                      ) : null}
                    </td>
                    <td className="pr-3 text-slate-600">{row.categoryLabel}</td>
                    <td className="pr-3 text-slate-600">{row.owner}</td>
                    <td className="pr-3 text-right font-semibold text-slate-900">{row.valueText}</td>
                    <td className="pr-3 text-right text-slate-600">{row.limitText}</td>
                    <td className="pr-3 text-right text-slate-600">{row.toleranceText}</td>
                    <td className="pr-3"><StatusChip status={row.status} /></td>
                    <td className="pr-3">
                      <span title={trend.label} aria-label={trend.label} className={`font-bold ${trend.className}`}>
                        {trend.arrow}
                      </span>
                    </td>
                    <td><Sparkline row={row} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No metrics match these filters.</p>
          ) : null}
        </div>
      </section>

      {pathTarget ? <PathToGreenDrawer target={pathTarget} onClose={() => setPathTarget(null)} /> : null}
    </div>
  );
}
