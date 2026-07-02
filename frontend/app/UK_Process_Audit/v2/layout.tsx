import { UkProcessAuditAppLayout, ukProcessAuditAppMetadata } from "../_shared/UkProcessAuditAppLayout";

export const metadata = ukProcessAuditAppMetadata;

export default function UKProcessAuditV2Layout({ children }: { children: React.ReactNode }) {
  return <UkProcessAuditAppLayout version="v2">{children}</UkProcessAuditAppLayout>;
}
