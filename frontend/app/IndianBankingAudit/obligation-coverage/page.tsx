'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ObligationCoverageScreen } from '@/components/IndianBankingAudit/screens/obligationCoverage/ObligationCoverageScreen';

function ObligationCoveragePageInner() {
  const sp = useSearchParams();
  return (
    <ObligationCoverageScreen
      obligationIdParam={sp.get('obligation')}
      instrumentParam={sp.get('instrument')}
    />
  );
}

export default function ObligationCoveragePage() {
  return (
    <Suspense
      fallback={
        <ObligationCoverageScreen obligationIdParam={null} instrumentParam={null} />
      }
    >
      <ObligationCoveragePageInner />
    </Suspense>
  );
}
