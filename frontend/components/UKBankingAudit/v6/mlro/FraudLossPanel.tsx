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
 * no chart library, hand-rolled table.
 */
export function FraudLossPanel() {
  const posture = getFraudPosture();

  return (
    <div className="space-y-5">
      {/* Verdict-first banner */}
      <div className="rounded-xl border-[1.5px] border-rose-300 bg-rose-50 p-5">
        <ClaimLine derivation="RULE" evidenceRef="FRAUD-TOTAL-NET-LOSS-12MO">
          <span className="text-[13px] font-bold text-rose-700">
            FRAUD · {formatGBP(posture.totalConfirmedNetLossGBP)} confirmed net loss (12mo) · APP
            reimbursement exposure {formatGBP(posture.appReimbursementExposureGBP)}
          </span>
        </ClaimLine>
      </div>

      {/* Hand-rolled table — no chart library */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-[minmax(0,2.2fr)_1fr_0.8fr_1fr_1fr] gap-x-3 border-b border-slate-100 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Type</span>
          <span className="text-right">Confirmed net loss</span>
          <span className="text-right">Volume</span>
          <span className="text-right">Trend</span>
          <span className="text-right">APP apportionment</span>
        </div>

        <div className="divide-y divide-slate-100">
          {posture.rows.map((row) => (
            <ClaimLine key={row.id} derivation="RULE" evidenceRef={claimRef(row, "ROW")}>
              <div className="grid grid-cols-[minmax(0,2.2fr)_1fr_0.8fr_1fr_1fr] items-center gap-x-3 py-1.5 text-[12px]">
                <span className="font-medium text-slate-900">{row.label}</span>
                <span className="text-right font-semibold text-slate-900">
                  {formatGBP(row.confirmedNetLossGBP)}
                </span>
                <span className="text-right text-slate-700">{row.volume.toLocaleString()}</span>
                <span className="text-right">
                  <TrendBadge trendWoW={row.trendWoW} />
                </span>
                <span className="text-right text-slate-700">
                  {row.appApportionmentGBP != null ? formatGBP(row.appApportionmentGBP) : "—"}
                </span>
              </div>
            </ClaimLine>
          ))}
        </div>
      </div>

      <p className="text-[10.5px] leading-relaxed text-slate-500">
        APP reimbursement mandatory under PSR rules since Oct 2024; the reimbursement share is a
        direct board-level exposure.
      </p>

      <PathToGreenStrip entityRef="fraud:app" />
    </div>
  );
}
