import { DM_Sans, Syne } from 'next/font/google';
import { ProcessAuditAppLayout, processAuditAppMetadata } from '../_shared/ProcessAuditAppLayout';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });

export const metadata = processAuditAppMetadata;

export default function IndianProcessAuditV3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${syne.variable} ${dmSans.variable} min-h-full`}>
      <ProcessAuditAppLayout version="v3">{children}</ProcessAuditAppLayout>
    </div>
  );
}
