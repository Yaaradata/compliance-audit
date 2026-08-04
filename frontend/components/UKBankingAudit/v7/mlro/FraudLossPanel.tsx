"use client";

import { useId, useState } from "react";
import { getFraudPosture } from "@/lib/ukbankingaudit/v7/fraudData";
import type { FraudLossRow } from "@/lib/ukbankingaudit/v7/fraudData";
import { ClaimLine } from "../ClaimLine";
import { PathToGreenStrip } from "../PathToGreenStrip";

function formatGBP(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(2)}m`;
  if (value >= 1_000) return `£${Math.round(value / 1_000)}k`;
  return `£${value.toLocaleString()}`;
}

function claimRef(row: FraudLossRow, suffix: string): string {
  return `FRAUD-${row.id.toUpperCase()}-${suffix}`;
}

function TrendBadge({ trendWoW }: { trendWoW: number }) {
  if (trendWoW === 0) {
    return <span className="text-[11px] font-semibold text-slate-500">flat</span>;
  }
  const worse = trendWoW > 0; // up = worse for a loss metric
  return (
    <span className={`text-[11px] font-semibold ${worse ? "text-rose-600" : "text-emerald-600"}`}>
      {worse ? "↗" : "↘"} {worse ? "+" : ""}
      {trendWoW}% w/w
    </span>
  );
}

/**
 * Same status rule as riskDomainsV7 Fraud & Scams sub-category — majority of
 * types trending up ⇒ AMBER. Totals come only from getFraudPosture().
 */
function fraudStatusFromPosture(rows: FraudLossRow[]): "AMBER" | "GREEN" {
  const risingCount = rows.filter((r) => r.trendWoW > 0).length;
  return risingCount >= Math.ceil(rows.length / 2) ? "AMBER" : "GREEN";
}

/**
 * Fraud summary card for the Operational Dashboard — collapsed by default;
 * expands to the full type breakdown. Path to Green stays visible when amber/red.
 */
export function FraudLossPanel() {
  const posture = getFraudPosture();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const risingCount = posture.rows.filter((r) => r.trendWoW > 0).length;
  const status = fraudStatusFromPosture(posture.rows);
  const showPath = status === "AMBER";

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50/80"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Fraud risk
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Confirmed net loss (12mo)
              </div>
              <div className="mt-0.5 text-[15px] font-bold tabular-nums text-slate-900">
                {formatGBP(posture.totalConfirmedNetLossGBP)}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                APP reimbursement (PSR)
              </div>
              <div className="mt-0.5 text-[15px] font-bold tabular-nums text-slate-900">
                {formatGBP(posture.appReimbursementExposureGBP)}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Types trending up w/w
              </div>
              <div className="mt-0.5 text-[15px] font-bold tabular-nums text-slate-900">
                {risingCount} of {posture.rows.length}
              </div>
            </div>
          </div>
          <div className="mt-2 border-t border-slate-100 pt-1.5">
            <span className="block text-[10px] leading-snug text-slate-500">{posture.sourceLabel}</span>
          </div>
        </div>
        <span
          className={`mt-1 shrink-0 text-[11px] text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {showPath ? (
        <div className="border-t border-slate-100 px-4 pb-3">
          <PathToGreenStrip entityRef="fraud:app" />
        </div>
      ) : null}

      {open ? (
        <div id={panelId} className="space-y-4 border-t border-slate-100 px-4 py-4">
          <div className="rounded-xl border-[1.5px] border-rose-300 bg-rose-50 p-5">
            <ClaimLine layout="stack" derivation="RULE" evidenceRef="FRAUD-TOTAL-NET-LOSS-12MO">
              <span className="text-[13px] font-bold text-rose-700">
                FRAUD · {formatGBP(posture.totalConfirmedNetLossGBP)} confirmed net loss (12mo) · APP
                reimbursement exposure {formatGBP(posture.appReimbursementExposureGBP)}
              </span>
            </ClaimLine>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <th scope="col" className="pb-2 pr-3 font-semibold">
                    Type
                  </th>
                  <th scope="col" className="pb-2 pr-3 text-right font-semibold">
                    Confirmed net loss
                  </th>
                  <th scope="col" className="pb-2 pr-3 text-right font-semibold">
                    Volume
                  </th>
                  <th scope="col" className="pb-2 pr-3 text-right font-semibold">
                    Trend
                  </th>
                  <th scope="col" className="pb-2 text-right font-semibold">
                    APP apportionment
                  </th>
                </tr>
              </thead>
              <tbody>
                {posture.rows.map((row) => {
                  const ref = claimRef(row, "ROW");
                  return (
                    <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-3 pr-3 align-middle">
                        <div className="flex items-start gap-2.5">
                          <span
                            className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700"
                            title="RULE · matched deterministically"
                            aria-label="RULE"
                          />
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium leading-snug text-slate-900">
                              {row.label}
                            </div>
                            <div
                              className="mt-0.5 truncate font-mono text-[9.5px] text-slate-400"
                              title={ref}
                            >
                              {ref}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 align-middle text-right text-[12px] font-semibold tabular-nums text-slate-900">
                        {formatGBP(row.confirmedNetLossGBP)}
                      </td>
                      <td className="py-3 pr-3 align-middle text-right text-[12px] tabular-nums text-slate-700">
                        {row.volume.toLocaleString()}
                      </td>
                      <td className="py-3 pr-3 align-middle text-right">
                        <TrendBadge trendWoW={row.trendWoW} />
                      </td>
                      <td className="py-3 align-middle text-right text-[12px] tabular-nums text-slate-700">
                        {row.appApportionmentGBP != null ? formatGBP(row.appApportionmentGBP) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[10.5px] leading-relaxed text-slate-500">
            APP reimbursement mandatory under PSR rules since Oct 2024; the reimbursement share is a
            direct board-level exposure.
          </p>
        </div>
      ) : null}
    </div>
  );
}
