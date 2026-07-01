import { UkProcessAuditAppLayout, ukProcessAuditAppMetadata } from "../_shared/UkProcessAuditAppLayout";

export const metadata = ukProcessAuditAppMetadata;

export default function UKProcessAuditV1Layout({ children }: { children: React.ReactNode }) {
  return <UkProcessAuditAppLayout version="v1">{children}</UkProcessAuditAppLayout>;
}
