"use client";

import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { d10HeadlineExposure } from "@/lib/Srilanka_Retail/derivations";
import { isTaggedRange } from "@/lib/Srilanka_Retail/types";
import { MetricStat, RangeValue, NUM } from "../primitives";

/**
 * Cross-screen headline band (SHARED by C1 and C5).
 *
 * The "exposure" metric is rendered from company.exposureBand via D10 — so the
 * band shown on C1 and the band shown on C5 are literally the SAME store field
 * referenced twice, never two literals. exposureBand is standing context, so it
 * is NOT rendered in red (red is reserved for the live rupees-at-risk variance).
 */
export function HeadlineMetricsBand() {
  const metrics = useKeystoneStore((s) => s.headlineMetrics);
  const exposure = useKeystoneStore(d10HeadlineExposure);

  return (
    <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((m) => {
        if (m.key === "exposure") {
          return (
            <MetricStat key={m.key} label={m.label} tag={exposure.sourceTag} emphasis={m.emphasis}>
              <RangeValue range={exposure.range} kind="rupee" />
            </MetricStat>
          );
        }

        const v = m.value;
        if (isTaggedRange(v)) {
          return (
            <MetricStat key={m.key} label={m.label} tag={v.sourceTag} emphasis={m.emphasis}>
              <RangeValue range={v.range} kind="number" />
            </MetricStat>
          );
        }

        const numeric = typeof v.value === "number";
        return (
          <MetricStat key={m.key} label={m.label} tag={v.sourceTag} emphasis={m.emphasis}>
            <span className={numeric ? NUM : undefined}>{String(v.value)}</span>
          </MetricStat>
        );
      })}
    </div>
  );
}
