import { redirect } from "next/navigation";

/** Legacy silence route — redirect to latest UK Process Audit (v2). */
export default function UKProcessAuditV3SilenceRedirectPage() {
  redirect("/UK_Process_Audit/v2");
}
