'use client';

import { useEffect, useMemo } from 'react';
import { kriObservations, kris, observationsForKRI } from '../dataModel';
import { EmptyState, Stat } from '../primitives';
import { useOriDemoHints } from '../OriDemoContext';
import { KriMonitoringDashboard } from './kriMonitoring/KriMonitoringDashboard';
import type { DrillFromDrawer, OpenDrawer } from '../types';

function lastNObsValues(kriId: string, n: number): number[] {
  const obs = observationsForKRI(kriId);
  return obs.slice(-n).map((o) => o.value);
}

/** v2 — domain KRI grid + AI summary wall (height-synced). */
export function KriMonitoringV2({ openDrawer, drillFromDrawer }: { openDrawer: OpenDrawer; drillFromDrawer: DrillFromDrawer }) {
  const demo = useOriDemoHints();

  useEffect(() => {
    if (!demo?.scrollToKriId) return;
    const t = window.setTimeout(() => {
      document.querySelector(`[data-ori-kri-card="${demo.scrollToKriId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
    return () => window.clearTimeout(t);
  }, [demo?.scrollToKriId, demo?.step]);

  const refTs = useMemo(() => {
    let m = 0;
    for (const o of kriObservations) m = Math.max(m, new Date(o.as_of_ts).getTime());
    return m || Date.now();
  }, []);

  const fourWeekMs = 28 * 86400000;

  const kpis = useMemo(() => {
    let red = 0;
    let amber = 0;
    const breachKris = new Set<string>();
    let deteriorating = 0;

    for (const k of kris) {
      const obs = observationsForKRI(k.kri_id);
      const lo = obs.length ? obs[obs.length - 1] : null;
      if (!lo) continue;
      if (lo.band === 'red') red += 1;
      else if (lo.band === 'amber') amber += 1;
      for (const o of obs) {
        if (new Date(o.as_of_ts).getTime() < refTs - fourWeekMs) continue;
        if (o.band === 'amber' || o.band === 'red') breachKris.add(k.kri_id);
      }
      const last3 = lastNObsValues(k.kri_id, 3);
      if (last3.length === 3 && last3[0] < last3[1] && last3[1] < last3[2]) deteriorating += 1;
    }

    return { red, amber, breaches: breachKris.size, deteriorating };
  }, [refTs, fourWeekMs]);

  if (!kris?.length) {
    return (
      <EmptyState message="No KRIs are configured in this demo dataset." hint="Reload the page or check mock data import." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat k="KRIs in red" v={kpis.red} sub="Latest obs · value ≥ red" tone="rose" />
        <Stat k="KRIs in amber" v={kpis.amber} sub="Between amber & red" tone="amber" />
        <Stat k="Breaches (4w)" v={kpis.breaches} sub="Distinct KRIs · amber/red in window" tone="violet" />
        <Stat k="Deteriorating (3w)" v={kpis.deteriorating} sub="Last 3 obs strictly ↑" tone="amber" />
      </div>

      <KriMonitoringDashboard kris={kris} openDrawer={openDrawer} drillFromDrawer={drillFromDrawer} />
    </div>
  );
}
