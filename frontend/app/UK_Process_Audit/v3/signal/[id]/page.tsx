import { redirect } from "next/navigation";

/** Legacy signal investigation route — redirect to latest UK Process Audit (v2). */
export default function UKProcessAuditV3SignalRedirectPage() {
  redirect("/UK_Process_Audit/v2");
}
