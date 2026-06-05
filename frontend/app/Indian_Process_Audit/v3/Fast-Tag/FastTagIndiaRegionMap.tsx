'use client';

import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import {
  FASTAG_INDIA_SCOPE_HEADING,
  FASTAG_OVERALL_SCOPE_BUTTON,
  FASTAG_REGION_LABEL,
} from './auditData';
import {
  FAST_TAG_HEAT_MAP_FILLS,
  getFastTagRegionMapRisk,
  type FastTagRegionPeerStat,
  type FastTagHeatRisk,
} from './fastTagJourneyHeatmap';
import { getRtoFromStateName } from './indiaStateRto';

const INDIA_GEO_URLS = [
  '/geo/india-states.json',
  'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson',
] as const;

const MAP_W = 280;
const MAP_H = 300;

const MAP_LEGEND: { risk: FastTagHeatRisk; label: string; swatch: string }[] = [
  { risk: 'none', label: 'None', swatch: 'bg-slate-100 ring-slate-200' },
  { risk: 'low', label: 'Low', swatch: 'bg-emerald-100 ring-emerald-200' },
  { risk: 'medium', label: 'Med', swatch: 'bg-amber-100 ring-amber-200' },
  { risk: 'high', label: 'High', swatch: 'bg-orange-200 ring-orange-300' },
  { risk: 'critical', label: 'Critical', swatch: 'bg-red-300 ring-red-400' },
];

type StatePath = {
  key: string;
  d: string;
  stateName: string;
  rto: string | null;
  hasData: boolean;
  caseCount: number;
  failedCount: number;
  failureSharePct: number;
  risk: FastTagHeatRisk | null;
  fill: string;
  stroke: string;
};

type Props = {
  selectedCode: string;
  allIndiaActive?: boolean;
  compact?: boolean;
  /** RTO codes that appear in the issuance case sample */
  availableCodes: readonly string[];
  /** All issuance cases per RTO (drives map color) */
  caseCounts?: Readonly<Record<string, number>>;
  /** Failed cases per RTO (shown in tooltip) */
  failedCounts?: Readonly<Record<string, number>>;
  onSelect: (code: string) => void;
  onAllIndia: () => void;
};

async function fetchIndiaGeo(): Promise<FeatureCollection<Geometry>> {
  let lastError: Error | null = null;
  for (const url of INDIA_GEO_URLS) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Map data failed (${res.status})`);
      return (await res.json()) as FeatureCollection<Geometry>;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError ?? new Error('Could not load India map data');
}

function buildPaths(
  geo: FeatureCollection<Geometry>,
  available: Set<string>,
  selectedCode: string,
  caseCounts: Record<string, number>,
  failedCounts: Record<string, number>,
): StatePath[] {
  const projection = geoMercator().fitExtent(
    [
      [4, 4],
      [MAP_W - 4, MAP_H - 4],
    ],
    geo,
  );
  const pathGen = geoPath(projection);

  const peerStats: FastTagRegionPeerStat[] = [...available].map((code) => ({
    failed: failedCounts[code] ?? 0,
    total: caseCounts[code] ?? 0,
  }));

  const paths: StatePath[] = [];
  for (let i = 0; i < geo.features.length; i++) {
    const f = geo.features[i] as Feature<Geometry, { ST_NM?: string }>;
    const stateName = f.properties?.ST_NM ?? `state-${i}`;
    const rto = getRtoFromStateName(stateName);
    const d = pathGen(f);
    if (!d) continue;

    const hasData = Boolean(rto && available.has(rto));
    const isSelected = Boolean(rto && rto === selectedCode);
    const caseCount = rto && hasData ? (caseCounts[rto] ?? 0) : 0;
    const failedCount = rto && hasData ? (failedCounts[rto] ?? 0) : 0;
    const failureSharePct =
      caseCount > 0 ? Math.round((failedCount / caseCount) * 1000) / 10 : 0;
    const risk = hasData ? getFastTagRegionMapRisk(failedCount, caseCount, peerStats) : null;
    const palette = risk ? FAST_TAG_HEAT_MAP_FILLS[risk] : { fill: '#f8fafc', stroke: '#e2e8f0' };

    let fill = palette.fill;
    let stroke = palette.stroke;
    if (isSelected) {
      fill = '#4f46e5';
      stroke = '#312e81';
    }

    paths.push({
      key: rto ? `rto-${rto}` : `state-${stateName}`,
      d,
      stateName,
      rto,
      hasData,
      caseCount,
      failedCount,
      failureSharePct,
      risk,
      fill,
      stroke,
    });
  }
  return paths;
}

export default function FastTagIndiaRegionMap({
  selectedCode,
  allIndiaActive = false,
  compact = false,
  availableCodes,
  caseCounts = {},
  failedCounts = {},
  onSelect,
  onAllIndia,
}: Props) {
  const [geo, setGeo] = useState<FeatureCollection<Geometry> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hover, setHover] = useState<StatePath | null>(null);

  const available = useMemo(() => new Set(availableCodes), [availableCodes]);

  useEffect(() => {
    let cancelled = false;
    fetchIndiaGeo()
      .then((data) => {
        if (!cancelled) setGeo(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load map');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const paths = useMemo(
    () =>
      geo
        ? buildPaths(geo, available, selectedCode, { ...caseCounts }, { ...failedCounts })
        : [],
    [geo, available, selectedCode, caseCounts, failedCounts],
  );

  const selectedLabel = allIndiaActive
    ? FASTAG_INDIA_SCOPE_HEADING
    : selectedCode
      ? FASTAG_REGION_LABEL[selectedCode]
        ? `${FASTAG_REGION_LABEL[selectedCode]} (${selectedCode})`
        : selectedCode
      : 'Select a state';

  const handlePathClick = (p: StatePath) => {
    if (!p.rto || !p.hasData) return;
    onSelect(p.rto === selectedCode ? '' : p.rto);
  };

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      <div className="flex items-center justify-between gap-2">
        <p
          className={`min-w-0 truncate font-medium text-slate-800 ${compact ? 'text-[10px]' : 'text-xs'}`}
          title={selectedLabel}
        >
          {selectedLabel}
        </p>
        <button
          type="button"
          onClick={onAllIndia}
          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors ${
            allIndiaActive
              ? 'bg-indigo-600 text-white ring-indigo-600 hover:bg-indigo-700'
              : 'text-indigo-700 ring-indigo-200 hover:bg-indigo-50'
          }`}
        >
          {FASTAG_OVERALL_SCOPE_BUTTON}
        </button>
      </div>

      <div className="relative rounded-md bg-slate-50/80 ring-1 ring-slate-200/90">
        {loadError ? (
          <p className="px-3 py-8 text-center text-xs text-red-600">{loadError}</p>
        ) : !geo ? (
          <p className="px-3 py-8 text-center text-xs text-slate-500">Loading map…</p>
        ) : (
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className={`mx-auto block h-auto w-full max-w-full ${compact ? 'max-h-[108px]' : ''}`}
            role="img"
            aria-label="India map colored by failed-case share per state"
          >
            {paths.map((p) => (
              <path
                key={p.key}
                d={p.d}
                fill={p.fill}
                stroke={p.stroke}
                strokeWidth={p.rto === selectedCode ? 1.25 : 0.6}
                vectorEffect="non-scaling-stroke"
                className={
                  p.hasData
                    ? 'cursor-pointer transition-[fill,stroke,filter] duration-150 hover:brightness-[0.97]'
                    : 'pointer-events-none opacity-60'
                }
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover((h) => (h?.key === p.key ? null : h))}
                onClick={() => handlePathClick(p)}
                aria-label={
                  p.hasData
                    ? `${p.stateName}${p.rto ? `, ${p.rto}, ${p.caseCount} cases, ${p.failedCount} failed` : ''}`
                    : undefined
                }
              />
            ))}
          </svg>
        )}

        {hover && geo ? (
          <div
            className="pointer-events-none absolute bottom-2 left-2 right-2 rounded-md bg-slate-900/90 px-2.5 py-1.5 text-[10px] leading-snug text-white shadow-md"
            role="tooltip"
          >
            <span className="font-semibold">{hover.stateName}</span>
            {hover.rto ? (
              <span className="text-slate-300">
                {' '}
                · {hover.rto}
                {hover.hasData ? (
                  <>
                    {' '}
                    · {hover.caseCount} case{hover.caseCount === 1 ? '' : 's'}
                    {hover.failedCount > 0
                      ? ` · ${hover.failedCount} failed (${hover.failureSharePct}%)`
                      : ' · 0% failed'}
                  </>
                ) : (
                  ' · no cases in sample'
                )}
              </span>
            ) : null}
            {hover.hasData ? (
              <span className="mt-0.5 block text-slate-400">Click to filter</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={`flex flex-wrap gap-1.5 text-slate-500 ${compact ? 'text-[9px]' : 'gap-2 text-[10px]'}`}>
        {MAP_LEGEND.map(({ risk, label, swatch }) => (
          <span key={risk} className="inline-flex items-center gap-0.5">
            <span className={`rounded-sm ring-1 ${swatch} ${compact ? 'h-2 w-2' : 'h-2.5 w-2.5'}`} />{' '}
            {label}
          </span>
        ))}
      </div>

      {!compact ? (
        <p className="text-[10px] leading-snug text-slate-500">
          Colors rank each state vs others (None = no findings, Low → Critical = higher
          exception density in the 10-case sample). Tooltip shows total and failed counts.
        </p>
      ) : null}
    </div>
  );
}
