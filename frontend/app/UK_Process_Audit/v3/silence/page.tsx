/**
 * Route: `/UK_Process_Audit/v3/silence` — Heartbeat Grid (presence map).
 */
import UkSilenceHeartbeatPage from "@/components/UK_Process_Audit/v3/UkSilenceHeartbeatPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Heartbeat Grid",
};

export default function UKProcessAuditV3SilencePage() {
  return <UkSilenceHeartbeatPage />;
}
