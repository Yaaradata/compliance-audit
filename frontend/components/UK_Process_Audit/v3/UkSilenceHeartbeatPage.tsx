"use client";

import { useMemo } from "react";
import { getUkProcessAuditData } from "@/lib/UK_Process_Audit";
import { HeartbeatGridView } from "@/components/UK_Process_Audit/v3/HeartbeatGrid";
import { UkpaV3Shell } from "@/components/UK_Process_Audit/v3/UkpaV3Shell";

export default function UkSilenceHeartbeatPage() {
  const data = useMemo(() => getUkProcessAuditData(), []);

  return (
    <UkpaV3Shell cycleLabel={data.overview.lastAuditCycle} activeNav="silence">
      <HeartbeatGridView />
    </UkpaV3Shell>
  );
}
