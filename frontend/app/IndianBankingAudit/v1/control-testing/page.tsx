'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ControlTestingScreen } from '@/components/IndianBankingAudit/screens/controlTesting/ControlTestingScreen';

function ControlTestingPageInner() {
  const sp = useSearchParams();
  return <ControlTestingScreen controlIdParam={sp.get('control')} />;
}

export default function ControlTestingPage() {
  return (
    <Suspense fallback={<ControlTestingScreen controlIdParam={null} />}>
      <ControlTestingPageInner />
    </Suspense>
  );
}
