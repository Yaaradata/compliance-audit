'use client';

import { useMemo, useState } from 'react';
import { performanceTheme } from './drilldowns/fastTagDrilldownTheme';
import { InsightSectionHead } from './drilldowns/fastTagDrilldownUi';
import FastTagStateClusterPanel, {
  STATE_CLUSTER_PERFORMANCE_VISIBLE_ROWS,
  StateClusterFilterBar,
  useStateClusterFilters,
} from './FastTagStateClusterPanel';
import { buildPerformanceRegionDemoCases } from './fastTagPerformanceRegionDemo';

const { C } = performanceTheme();

type CaseLike = {
  id?: string;
  subject?: string;
  overallStatus?: string;
  trail?: { status: string }[];
};

type Props = {
  cases?: CaseLike[];
  /** Fits §3 panel beside contribution split. */
  compact?: boolean;
};

/** Scrollable state drill-down for performance view (replaces India map). */
export default function FastTagPerformanceRegionSection({
  cases = [],
  compact = false,
}: Props) {
  const [selectedRegionCode, setSelectedRegionCode] = useState('');
  const filterState = useStateClusterFilters();

  const demoCases = useMemo(() => buildPerformanceRegionDemoCases(), []);
  const tableCases = cases.length > 0 ? cases : demoCases;

  return (
    <>
      <InsightSectionHead
        prefix="pf"
        n="3"
        accent={C.teal}
        insight="Region-wise Performance"
        trail={null}
        className="pf-region-head"
        right={
          <StateClusterFilterBar
            {...filterState}
            inline
            className="pf-region-filters-inline"
          />
        }
      />
      <div
        className={compact ? 'pf-region-drill pf-region-drill--compact' : 'pf-region-drill'}
        aria-label="State drill-down"
      >
        <FastTagStateClusterPanel
          cases={tableCases}
          allIndianStates
          selectedRegionCode={selectedRegionCode}
          onSelectRegion={(code) => setSelectedRegionCode((prev) => (prev === code ? '' : code))}
          visibleRowCount={compact ? STATE_CLUSTER_PERFORMANCE_VISIBLE_ROWS : undefined}
          selectionHint={compact ? undefined : 'Scroll to browse states — click a row to focus.'}
          metricsMode="business"
          hideHeader
          denseRows={compact}
          filterState={filterState}
        />
      </div>
    </>
  );
}
