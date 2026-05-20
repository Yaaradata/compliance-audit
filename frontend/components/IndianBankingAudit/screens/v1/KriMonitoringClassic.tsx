'use client';

import React, { useEffect, useMemo } from 'react';
import { getRisk, getSeniorManager, kriObservations, kris, observationsForKRI, type KRI } from '../../dataModel';
import { EmptyState, SectionCard, Stat } from '../../primitives';
import { oriCardHover, oriFocusRing } from '../../theme';
import { useOriDemoHints } from '../../OriDemoContext';
import type { DrillFromDrawer, OpenDrawer } from '../../types';

const W = 200;
const H = 60;
const PAD = { l: 4, r: 4, t: 6, b: 14 };

function bandTone(band: string): 'rose' | 'amber' | 'emerald' | 'slate' {
  if (band === 'red') return 'rose';
  if (band === 'amber') return 'amber';
  if (band === 'green') return 'emerald';
  return 'slate';
}

function latestObs(kriId: string) {
  const obs = observationsForKRI(kriId);
  return obs.length ? obs[obs.length - 1] : null;
}

function lastNObsValues(kriId: string, n: number): number[] {
  const obs = observationsForKRI(kriId);
  const slice = obs.slice(-n);
  return slice.map((o) => o.value);
}

function smoothSeries(raw: number[]): number[] {
  if (raw.length < 3) return raw;
  return raw.map((y, i) => {
    if (i === 0 || i === raw.length - 1) return y;
    return (raw[i - 1] + y + raw[i + 1]) / 3;
  });
}

function KriSparklineSvg({
  values,
  dates,
  amber,
  red,
  band,
}: {
  values: number[];
  dates: string[];
  amber: number;
  red: number;
  band: string;
}) {
  if (values.length < 2) return <div className="h-[60px] w-[200px] rounded border border-dashed border-slate-200 bg-slate-50" />;

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const ys = smoothSeries(values);
  const vmin = Math.min(...ys, amber, red) * 0.92;
  const vmax = Math.max(...ys, amber, red) * 1.08;
  const vr = vmax - vmin || 1;

  const pts = ys.map((v, i) => {
    const x = PAD.l + (i / Math.max(1, ys.length - 1)) * innerW;
    const y = PAD.t + innerH - ((v - vmin) / vr) * innerH;
    return { x, y };
  });

  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(2)} ${PAD.t + innerH} L ${pts[0].x.toFixed(2)} ${PAD.t + innerH} Z`;

  const yLine = (val: number) => PAD.t + innerH - ((val - vmin) / vr) * innerH;
  const yA = yLine(amber);
  const yR = yLine(red);

  const fill =
    band === 'red'
      ? 'rgba(254, 202, 202, 0.45)'
      : band === 'amber'
        ? 'rgba(254, 243, 199, 0.55)'
        : 'rgba(209, 250, 229, 0.35)';
  const stroke = band === 'red' ? '#e11d48' : band === 'amber' ? '#d97706' : '#059669';

  const d0 = dates[0]?.slice(0, 10) || '';
  const d1 = dates[dates.length - 1]?.slice(0, 10) || '';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0" role="img" aria-hidden>
      <path d={areaD} fill={fill} stroke="none" />
      <line x1={PAD.l} x2={W - PAD.r} y1={yA} y2={yA} stroke="#d97706" strokeWidth={1} strokeDasharray="4 3" opacity={0.85} />
      <line x1={PAD.l} x2={W - PAD.r} y1={yR} y2={yR} stroke="#e11d48" strokeWidth={1} strokeDasharray="4 3" opacity={0.85} />
      <path d={lineD} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#fff" stroke={stroke} strokeWidth={1.2} />
      ))}
      <text x={PAD.l} y={H - 2} className="fill-slate-500" style={{ fontSize: 8 }}>
        {d0}
      </text>
      <text x={W - PAD.r} y={H - 2} textAnchor="end" className="fill-slate-500" style={{ fontSize: 8 }}>
        {d1}
      </text>
    </svg>
  );
}

export function KriMonitoringClassic({ openDrawer, drillFromDrawer }: { openDrawer: OpenDrawer; drillFromDrawer: DrillFromDrawer }) {
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
      const lo = latestObs(k.kri_id);
      if (!lo) continue;
      if (lo.band === 'red') red += 1;
      else if (lo.band === 'amber') amber += 1;
      const obs = observationsForKRI(k.kri_id);
      for (const o of obs) {
        if (new Date(o.as_of_ts).getTime() < refTs - fourWeekMs) continue;
        if (o.band === 'amber' || o.band === 'red') breachKris.add(k.kri_id);
      }
      const last3 = lastNObsValues(k.kri_id, 3);
      if (last3.length === 3 && last3[0] < last3[1] && last3[1] < last3[2]) deteriorating += 1;
    }

    return { red, amber, breaches: breachKris.size, deteriorating };
  }, [refTs, fourWeekMs]);

  const deteriorators = useMemo(() => {
    return [...kris]
      .map((k) => {
        const v = lastNObsValues(k.kri_id, 4);
        const trend = v.length >= 2 ? v[v.length - 1] - v[0] : 0;
        return { k, trend };
      })
      .sort((a, b) => b.trend - a.trend)
      .slice(0, 5);
  }, []);

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1 space-y-6">
        {!kris?.length ? (
          <EmptyState message="No KRIs are configured in this demo dataset." hint="Reload the page or check mock data import." />
        ) : (
          <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat k="KRIs in red" v={kpis.red} sub="Latest obs ┬╖ value ΓëÑ red" tone="rose" />
          <Stat k="KRIs in amber" v={kpis.amber} sub="Between amber & red" tone="amber" />
          <Stat k="Breaches (4w)" v={kpis.breaches} sub="Distinct KRIs ┬╖ amber/red in window" tone="violet" />
          <Stat k="Deteriorating (3w)" v={kpis.deteriorating} sub="Last 3 obs strictly Γåæ" tone="amber" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {kris.map((k) => (
            <KriCard key={k.kri_id} kri={k} openDrawer={openDrawer} drillFromDrawer={drillFromDrawer} />
          ))}
        </div>
          </>
        )}
      </div>

      <div className="w-full shrink-0 xl:w-56">
        <SectionCard title="Top deteriorators" subtitle="Largest rise ┬╖ last 4 weekly obs">
          <ol className="list-decimal space-y-2 pl-4 text-xs text-slate-800">
            {deteriorators.map(({ k, trend }) => (
              <li key={k.kri_id}>
                <button type="button" className={`text-left font-semibold text-indigo-700 hover:underline ${oriFocusRing}`} onClick={() => openDrawer('kri', k.kri_id, 'kriMonitoring')}>
                  {k.kri_id}
                </button>
                <div className="text-[10px] text-slate-500">╬ö {trend.toFixed(2)}</div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </div>
  );
}

function KriCard({
  kri,
  openDrawer,
  drillFromDrawer,
}: {
  kri: KRI;
  openDrawer: OpenDrawer;
  drillFromDrawer: DrillFromDrawer;
}) {
  const obs = observationsForKRI(kri.kri_id);
  const last12 = obs.slice(-12);
  const values = last12.map((o) => o.value);
  const dates = last12.map((o) => o.as_of_ts);
  const latest = last12.length ? last12[last12.length - 1] : null;
  const band = latest?.band || 'green';
  const risk = getRisk(kri.linked_risk_id);
  const sm = getSeniorManager(risk?.accountable_senior_manager_id || '');
  const tone = bandTone(band);
  const valDisp =
    kri.unit === 'ratio' && latest ? latest.value.toFixed(3) : latest != null ? `${latest.value}` : 'ΓÇö';

  const openKriDrawer = () => openDrawer('kri', kri.kri_id, 'kriMonitoring');

  return (
    <div
      role="button"
      tabIndex={0}
      data-ori-kri-card={kri.kri_id}
      onClick={openKriDrawer}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openKriDrawer();
        }
      }}
      className={`flex w-full cursor-pointer flex-col rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm ${oriCardHover} ${oriFocusRing}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[11px] font-bold text-slate-500">{kri.kri_id}</div>
          <div className="line-clamp-2 text-xs font-semibold leading-snug text-slate-800">{kri.name}</div>
        </div>
      </div>
      {risk && (
        <div className="mb-2">
          <button
            type="button"
            className={`inline-flex max-w-full items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-800 hover:bg-indigo-100 ${oriFocusRing}`}
            onClick={(e) => {
              e.stopPropagation();
              drillFromDrawer('risk', risk.risk_id);
            }}
          >
            <span className="truncate">{risk.risk_id}</span>
          </button>
        </div>
      )}
      <div className={`text-2xl font-bold ${tone === 'rose' ? 'text-rose-600' : tone === 'amber' ? 'text-amber-600' : tone === 'emerald' ? 'text-emerald-700' : 'text-slate-800'}`}>{valDisp}</div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <KriSparklineSvg values={values} dates={dates} amber={kri.threshold_amber} red={kri.threshold_red} band={band} />
      </div>
      <div className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">{kri.unit.replace(/_/g, ' ')}</div>
      {(band === 'amber' || band === 'red') && kri.breach_summary && (
        <p className="mt-2 line-clamp-3 border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-600">{kri.breach_summary}</p>
      )}
      {sm && (
        <button
          type="button"
          className={`mt-2 text-left text-[10px] text-indigo-700 hover:underline ${oriFocusRing}`}
          onClick={(e) => {
            e.stopPropagation();
            drillFromDrawer('seniorManager', sm.senior_manager_id);
          }}
        >
          Accountable ┬╖ {sm.name}
        </button>
      )}
    </div>
  );
}
