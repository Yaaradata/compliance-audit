"use client";

import { useId, useState } from "react";
import { getFraudPosture } from "@/lib/ukbankingaudit/v8/fraudData";
import type { FraudLossRow } from "@/lib/ukbankingaudit/v8/fraudData";
import { ClaimLine } from "../ClaimLine";
import { PathToGreenStrip } from "../PathToGreenStrip";
import { StatTile } from "../StatTile";
import { WidgetCardFooter } from "../WidgetShell";

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
 * Same status rule as riskDomainsV8 Fraud & Scams sub-category — majority of
 * types trending up ⇒ AMBER. Totals come only from getFraudPosture().
 */
function fraudStatusFromPosture(rows: FraudLossRow[]): "AMBER" | "GREEN" {
  const risingCount = rows.filter((r) => r.trendWoW > 0).length;
  return risingCount >= Math.ceil(rows.length / 2) ? "AMBER" : "GREEN";
}

const BAND_SHELL: Record<"AMBER" | "GREEN", string> = {
  AMBER: "border-amber-300 bg-amber-50/40",
  GREEN: "border-emerald-300 bg-emerald-50/30",
};

/**
 * Fraud summary card for Zone C — content-height card (no stretch filler).
 * Compact xs StatTiles stacked; expands to type breakdown. PTG below when amber.
 */
export function FraudLossPanel() {
  const posture = getFraudPosture();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const risingCount = posture.rows.filter((r) => r.trendWoW > 0).length;
  const status = fraudStatusFromPosture(posture.rows);
  const showPath = status === "AMBER";

  return (
    <div className="min-w-0 h-full">
      <div
        className={`flex h-full min-w-0 flex-col overflow-hidden rounded-xl border-2 shadow-sm ${BAND_SHELL[status]}`}
      >
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 opacity-80">
                Fraud risk
              </div>
              <h3 className="mt-0.5 text-sm font-bold text-slate-900">
                Confirmed losses &amp; APP exposure
              </h3>
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              aria-label={open ? "Collapse fraud type breakdown" : "Expand fraud type breakdown"}
            >
              <span
                className={`text-[11px] transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden
              >
                ▾
              </span>
            </button>
          </div>

          <div className="mt-2 grid min-w-0 grid-cols-1 gap-1.5">
            <StatTile
              label="Confirmed net loss (12mo)"
              size="xs"
              value={formatGBP(posture.totalConfirmedNetLossGBP)}
            />
            <StatTile
              label="APP reimbursement (PSR)"
              size="xs"
              value={formatGBP(posture.appReimbursementExposureGBP)}
            />
            <StatTile
              label="Types trending up w/w"
              size="xs"
              value={`${risingCount} of ${posture.rows.length}`}
            />
          </div>

          <div className="mt-2 border-t border-slate-200/80 pt-1.5">
            <span className="block text-[10px] leading-snug text-slate-500">
              {posture.sourceLabel}
            </span>
          </div>

          {open ? (
            <div id={panelId} className="mt-3 min-w-0 space-y-3 border-t border-slate-200/80 pt-3">
              <div className="rounded-xl border-[1.5px] border-rose-300 bg-rose-50 p-3">
                <ClaimLine layout="stack" derivation="RULE" evidenceRef="FRAUD-TOTAL-NET-LOSS-12MO">
                  <span className="text-[12px] font-bold text-rose-700">
                    FRAUD · {formatGBP(posture.totalConfirmedNetLossGBP)} confirmed net loss (12mo) ·
                    APP reimbursement exposure {formatGBP(posture.appReimbursementExposureGBP)}
                  </span>
                </ClaimLine>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3">
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
                          <td className="py-2.5 pr-3 align-middle">
                            <div className="flex items-start gap-2">
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
                          <td className="py-2.5 pr-3 align-middle text-right text-[12px] font-semibold tabular-nums text-slate-900">
                            {formatGBP(row.confirmedNetLossGBP)}
                          </td>
                          <td className="py-2.5 pr-3 align-middle text-right text-[12px] tabular-nums text-slate-700">
                            {row.volume.toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-3 align-middle text-right">
                            <TrendBadge trendWoW={row.trendWoW} />
                          </td>
                          <td className="py-2.5 align-middle text-right text-[12px] tabular-nums text-slate-700">
                            {row.appApportionmentGBP != null
                              ? formatGBP(row.appApportionmentGBP)
                              : "—"}
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

        {showPath ? (
          <WidgetCardFooter>
            <PathToGreenStrip entityRef="fraud:app" />
          </WidgetCardFooter>
        ) : null}
      </div>
    </div>
  );
}
