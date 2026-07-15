/**
 * Route: `/UK_Process_Audit/v2`
 *
 * UI: `@/components/UK_Process_Audit/v2/UkProcessAuditDashboardV2`
 *     — the exact Indian Process Audit (v3) component system, driven by UK data.
 * Data: `@/lib/UK_Process_Audit/v2` via `getUkProcessAuditDataV2()`
 */
import UkProcessAuditDashboardV2 from "@/components/UK_Process_Audit/v2/UkProcessAuditDashboardV2";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Process Audit",
};

export default function UKProcessAuditV2Page() {
  return <UkProcessAuditDashboardV2 />;
}
