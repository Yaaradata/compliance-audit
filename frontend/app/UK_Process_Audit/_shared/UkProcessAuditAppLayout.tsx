import type { Metadata } from "next";
import { UkpaVersionProvider } from "@/components/UK_Process_Audit/ukpa/UkpaVersionProvider";
import type { UkpaVersion } from "@/components/UK_Process_Audit/ukpa/ukpaVersion";

export const ukProcessAuditAppMetadata: Metadata = {
  title: {
    template: "%s | UK Process Audit",
    default: "UK Process Audit",
  },
  description: "Process and control intelligence for UK banking internal audit",
};

export function UkProcessAuditAppLayout({
  version,
  children,
}: {
  version: UkpaVersion;
  children: React.ReactNode;
}) {
  return <UkpaVersionProvider version={version}>{children}</UkpaVersionProvider>;
}
