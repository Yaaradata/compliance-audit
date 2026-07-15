import { UkProcessAuditAppLayout, ukProcessAuditAppMetadata } from "../_shared/UkProcessAuditAppLayout";
import { UkpaV3SessionProvider } from "@/components/UK_Process_Audit/v3/UkpaV3SessionProvider";

export const metadata = ukProcessAuditAppMetadata;

export default function UKProcessAuditV3Layout({ children }: { children: React.ReactNode }) {
  return (
    <UkProcessAuditAppLayout version="v3">
      <UkpaV3SessionProvider>{children}</UkpaV3SessionProvider>
    </UkProcessAuditAppLayout>
  );
}
