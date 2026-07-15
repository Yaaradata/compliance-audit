/**
 * Route: `/UK_Process_Audit/v3` (latest) — Signals Inbox.
 */
import UkProcessAuditDashboardV3 from "@/components/UK_Process_Audit/v3/UkProcessAuditDashboardV3";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signals Inbox",
};

export default function UKProcessAuditV3Page() {
  return <UkProcessAuditDashboardV3 />;
}
