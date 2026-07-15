"use client";

import { useMemo } from "react";
import { getUkProcessAuditData } from "@/lib/UK_Process_Audit";
import { buildUkLiveIntel } from "@/lib/UK_Process_Audit/v3/liveIntel";
import { UkpaV3Shell } from "./UkpaV3Shell";
import { SignalsInbox } from "./SignalsInbox";

/**
 * UK Process Audit v3 home — Signals Inbox.
 * Persona: Chief Compliance Officer (Internal Audit toggle = read-only).
 */
export default function UkProcessAuditDashboardV3() {
  const data = useMemo(() => getUkProcessAuditData(), []);
  const allControls = useMemo(
    () => Object.values(data.controlsByDomain).flat(),
    [data.controlsByDomain],
  );
  const liveIntel = useMemo(() => buildUkLiveIntel(allControls), [allControls]);

  return (
    <UkpaV3Shell cycleLabel={data.overview.lastAuditCycle} activeNav="inbox">
      <SignalsInbox signals={liveIntel.signals} />
    </UkpaV3Shell>
  );
}
