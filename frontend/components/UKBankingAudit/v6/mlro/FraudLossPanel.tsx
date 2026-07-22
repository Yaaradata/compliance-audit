"use client";

import { getFraudPosture } from "@/lib/ukbankingaudit/v6/fraudData";
import type { FraudLossRow } from "@/lib/ukbankingaudit/v6/fraudData";
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
 * Verdict-first Fraud lens for the MLRO workspace. Fraud is a peer of
 * AML/sanctions, not a subset of it — reads only lib/ukbankingaudit/v6/fraudData,
 * no chart library. Uses a real HTML table so columns cannot drift.
 */
export function FraudLossPanel() {
  const posture = getFraudPosture();

  return (
    <div className="space-y-5">
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
                        <div className="text-[12px] font-medium leading-snug text-slate-900">{row.label}</div>
                        <div className="mt-0.5 truncate font-mono text-[9.5px] text-slate-400" title={ref}>
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

      <PathToGreenStrip entityRef="fraud:app" />
    </div>
  );
}
