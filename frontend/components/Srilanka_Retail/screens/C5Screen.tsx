"use client";

import { useMemo } from "react";
import { AlertTriangle, LayoutGrid } from "lucide-react";
import { useKeystoneStore } from "@/lib/Srilanka_Retail/store";
import { d10HeadlineExposure, d9CommitteeRollup } from "@/lib/Srilanka_Retail/derivations";
import { isTaggedRange } from "@/lib/Srilanka_Retail/types";
import { Card } from "../primitives/ui";
import { RangeValue, KS } from "../primitives";
import { MetricCard } from "../shared/MetricCard";
import { PostureGridTable } from "../shared/PostureGridTable";

export function C5Screen() {
  const regulators = useKeystoneStore((s) => s.regulators);
  const controls = useKeystoneStore((s) => s.controls);
  const postureGrid = useKeystoneStore((s) => s.postureGrid);
  const headlineMetrics = useKeystoneStore((s) => s.headlineMetrics);
  const exposure = useKeystoneStore(d10HeadlineExposure);
  const rollupItems = useKeystoneStore((s) => s.committeeRollup.items);
  const routedTo = useKeystoneStore((s) => s.committeeRollup.routedTo);
  const regulatorsData = useKeystoneStore((s) => s.regulators);
  const controlsData = useKeystoneStore((s) => s.controls);

  const committee = useMemo(
    () =>
      d9CommitteeRollup({
        committeeRollup: { items: rollupItems, routedTo },
        postureGrid,
        regulators: regulatorsData,
        controls: controlsData,
      } as Parameters<typeof d9CommitteeRollup>[0]),
    [rollupItems, routedTo, postureGrid, regulatorsData, controlsData],
  );

  const auditReady = headlineMetrics.find((m) => m.key === "auditReady");
  const teamDays = headlineMetrics.find((m) => m.key === "teamDaysReturned");
  const detection = headlineMetrics.find((m) => m.key === "detectionLatency");

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <LayoutGrid size={18} style={{ color: "var(--ks-dim)" }} />
          <div>
            <div className="text-sm font-semibold">Live compliance posture</div>
            <div className="text-[11px]" style={{ color: "var(--ks-faint)" }}>
              &ldquo;Where you&rsquo;d stand if every regulator walked in tomorrow&rdquo; · CTO / CFO · Audit
              Committee
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Exposure under reconciliation" tag={exposure.sourceTag} primary>
            <RangeValue range={exposure.range} kind="rupee" />
          </MetricCard>
          {auditReady && !isTaggedRange(auditReady.value) && (
            <MetricCard label="Regulators audit-ready" tag={auditReady.value.sourceTag} primary>
              {String(auditReady.value.value)}
            </MetricCard>
          )}
          {teamDays && isTaggedRange(teamDays.value) && (
            <MetricCard label="Team-days returned / yr" tag={teamDays.value.sourceTag}>
              <RangeValue range={teamDays.value.range} kind="number" />
            </MetricCard>
          )}
          {detection && !isTaggedRange(detection.value) && (
            <MetricCard label="Detection latency" tag={detection.value.sourceTag}>
              {String(detection.value.value)}
            </MetricCard>
          )}
        </div>

        <div className="mt-5 w-full">
          <PostureGridTable
            regulators={regulators}
            controls={controls}
            postureGrid={postureGrid}
          />
        </div>

        {committee.length > 0 && (
          <div
            className="mt-4 flex w-full items-start gap-2 rounded-lg p-3.5"
            style={{ background: KS.amberDim, border: `1px solid ${KS.amberEdge}` }}
          >
            <AlertTriangle size={15} style={{ color: KS.amber }} className="mt-0.5 shrink-0" />
            <div>
              <div className="text-[12px] font-semibold" style={{ color: KS.amber }}>
                {committee.length} item → Audit Committee remit
              </div>
              <div className="text-[12px]" style={{ color: KS.dim }}>
                {committee[0].label}
              </div>
            </div>
          </div>
        )}
      </Card>

      <p className="text-center text-[13px] italic" style={{ color: "var(--ks-faint)" }}>
        Compliance you&rsquo;re in — not an event you survive.
      </p>
    </div>
  );
}
