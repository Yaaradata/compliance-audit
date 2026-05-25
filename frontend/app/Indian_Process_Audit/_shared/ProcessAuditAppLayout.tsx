import type { Metadata } from 'next';
import { IpaVersionProvider } from '@/components/Indian_Process_Audit/ipa/IpaVersionProvider';
import type { IpaVersion } from '@/components/Indian_Process_Audit/ipa/ipaVersion';

export const processAuditAppMetadata: Metadata = {
  title: {
    template: '%s | Indian Process Audit',
    default: 'Indian Process Audit',
  },
  description: 'Process and control intelligence for Indian banking internal audit',
};

export function ProcessAuditAppLayout({ version, children }: { version: IpaVersion; children: React.ReactNode }) {
  return <IpaVersionProvider version={version}>{children}</IpaVersionProvider>;
}
