/**
 * Route: `/UK_Process_Audit/v1`
 *
 * UI: `@/components/UK_Process_Audit/UKProcessAuditDashboard`
 * Data: `@/lib/UK_Process_Audit` via `getUkProcessAuditData()`
 */
import UKProcessAuditDashboard from "@/components/UK_Process_Audit/UKProcessAuditDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Process Audit",
};

export default function UKProcessAuditV1Page() {
  return <UKProcessAuditDashboard />;
}
