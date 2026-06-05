'use client';

import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { FAST_TAG_HEAT_MAP_FILLS } from '../fastTagJourneyHeatmap';
import { getRtoFromStateName } from '../indiaStateRto';
import type { IndiaOverallSummary } from './fastTagIssuesPeriodData';
import type { StateComplaintDatum } from './fastTagIssuesStateComplaints';

const INDIA_GEO_URLS = [
  '/geo/india-states.json',
  'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson',
] as const;

const MAP_W = 280;
const MAP_H = 300;

const MAP_LEGEND = [
  { risk: 'none', label: 'None', swatch: '#f1f5f9' },
  { risk: 'low', label: 'Low', swatch: '#d1fae5' },
  { risk: 'medium', label: 'Med', swatch: '#fef3c7' },
  { risk: 'high', label: 'High', swatch: '#fed7aa' },
  { risk: 'critical', label: 'Critical', swatch: '#fca5a5' },
] as const;

type StatePath = {
  key: string;
  d: string;
  stateName: string;
  rto: string | null;
  datum: StateComplaintDatum | null;
  fill: string;
  stroke: string;
};

type Props = {
  prefix: string;
  states: StateComplaintDatum[];
  overall: IndiaOverallSummary;
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
  byRto: Record<string, StateComplaintDatum>,
  hoverRto: string | null,
): StatePath[] {
  const projection = geoMercator().fitExtent(
    [
      [4, 4],
      [MAP_W - 4, MAP_H - 4],
    ],
    geo,
  );
  const pathGen = geoPath(projection);
  const paths: StatePath[] = [];

  for (let i = 0; i < geo.features.length; i++) {
    const f = geo.features[i] as Feature<Geometry, { ST_NM?: string }>;
    const stateName = f.properties?.ST_NM ?? `state-${i}`;
    const rto = getRtoFromStateName(stateName);
    const d = pathGen(f);
    if (!d) continue;

    const datum = rto ? byRto[rto] ?? null : null;
    const risk = datum?.risk ?? 'none';
    const palette = FAST_TAG_HEAT_MAP_FILLS[risk];
    let fill = palette.fill;
    let stroke = palette.stroke;
    if (rto && rto === hoverRto) {
      fill = '#4f46e5';
      stroke = '#312e81';
    }

    paths.push({
      key: rto ? `rto-${rto}` : `state-${stateName}`,
      d,
      stateName,
      rto,
      datum,
      fill,
      stroke,
    });
  }
  return paths;
}

function OverallIndiaDetail({ prefix, overall }: { prefix: string; overall: IndiaOverallSummary }) {
  return (
    <div className={`${prefix}-iq-map-hover-panel`}>
      <div className={`${prefix}-iq-map-detail-head`}>
        <strong>Overall India</strong>
        <span className={`${prefix}-up`}>+{overall.deltaPct}%</span>
      </div>
      <div className={`${prefix}-iq-map-detail-grid`}>
        <div>
          <span className={`${prefix}-label`}>Complaints</span>
          <div className={`${prefix}-iq-map-detail-val`}>{overall.complaints.toLocaleString()}</div>
          <span className={`${prefix}-faint`}>vs {overall.prior.toLocaleString()} prior</span>
        </div>
        <div>
          <span className={`${prefix}-label`}>Regions rising</span>
          <div className={`${prefix}-iq-map-detail-sub`}>
            {overall.risingRegions} / {overall.totalRegions}
          </div>
        </div>
        <div>
          <span className={`${prefix}-label`}>Top issue</span>
          <div className={`${prefix}-iq-map-detail-sub`}>{overall.topIssue}</div>
        </div>
        <div>
          <span className={`${prefix}-label`}>Top channel</span>
          <div className={`${prefix}-iq-map-detail-sub`}>{overall.topChannel}</div>
        </div>
        <div>
          <span className={`${prefix}-label`}>High-risk states</span>
          <div className={`${prefix}-iq-map-detail-sub`}>{overall.criticalStates}</div>
        </div>
      </div>
    </div>
  );
}

function StateHoverDetail({ prefix, datum }: { prefix: string; datum: StateComplaintDatum }) {
  const riskLabel = datum.risk === 'medium' ? 'Med' : datum.risk;

  return (
    <div className={`${prefix}-iq-map-hover-panel`}>
      <div className={`${prefix}-iq-map-detail-head`}>
        <strong>{datum.stateName}</strong>
        <span className={`${prefix}-up`}>+{datum.deltaPct}%</span>
      </div>
      <div className={`${prefix}-iq-map-detail-grid`}>
        <div>
          <span className={`${prefix}-label`}>Complaints</span>
          <div className={`${prefix}-iq-map-detail-val`}>{datum.complaints.toLocaleString()}</div>
          <span className={`${prefix}-faint`}>vs {datum.prior.toLocaleString()} prior</span>
        </div>
        <div>
          <span className={`${prefix}-label`}>Top issue</span>
          <div className={`${prefix}-iq-map-detail-sub`}>{datum.topIssue}</div>
        </div>
        <div>
          <span className={`${prefix}-label`}>Top channel</span>
          <div className={`${prefix}-iq-map-detail-sub`}>{datum.topChannel}</div>
        </div>
        <div>
          <span className={`${prefix}-label`}>Severity</span>
          <div className={`${prefix}-iq-map-detail-sub`} style={{ textTransform: 'capitalize' }}>
            {riskLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IssuesComplaintIndiaMap({ prefix, states, overall }: Props) {
  const [geo, setGeo] = useState<FeatureCollection<Geometry> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hover, setHover] = useState<StatePath | null>(null);

  const byRto = useMemo(() => Object.fromEntries(states.map((s) => [s.rto, s])), [states]);

  useEffect(() => {
    let cancelled = false;
    fetchIndiaGeo()
      .then((data) => {
        if (!cancelled) setGeo(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load map');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hoverRto = hover?.rto ?? null;
  const paths = useMemo(
    () => (geo ? buildPaths(geo, byRto, hoverRto) : []),
    [geo, byRto, hoverRto],
  );

  const hoverDatum = hover?.datum ?? null;

  return (
    <div className={`${prefix}-iq-map`}>
      <div className={`${prefix}-iq-map-split`}>
        <div className={`${prefix}-iq-map-col`}>
          <div className={`${prefix}-iq-map-head`}>
            <span className={`${prefix}-iq-map-section-label`}>India</span>
            <div className={`${prefix}-iq-map-legend`} aria-label="Complaint severity legend">
              {MAP_LEGEND.map(({ risk, label, swatch }) => (
                <span key={risk} className={`${prefix}-iq-map-legend-item`}>
                  <span className={`${prefix}-iq-map-legend-dot`} style={{ background: swatch }} aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className={`${prefix}-iq-map-frame`}>
            {loadError ? (
              <p className={`${prefix}-iq-map-error`}>{loadError}</p>
            ) : !geo ? (
              <p className={`${prefix}-iq-map-loading`}>Loading map…</p>
            ) : (
              <svg
                viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                className={`${prefix}-iq-map-svg`}
                role="img"
                aria-label="India map colored by complaint spike severity per state"
              >
                {paths.map((p) => (
                  <path
                    key={p.key}
                    d={p.d}
                    fill={p.fill}
                    stroke={p.stroke}
                    strokeWidth={p.rto === hoverRto ? 1.25 : 0.6}
                    vectorEffect="non-scaling-stroke"
                    className={p.datum ? `${prefix}-iq-map-path` : `${prefix}-iq-map-path ${prefix}-iq-map-path--dim`}
                    onMouseEnter={() => p.datum && setHover(p)}
                    onMouseLeave={() => setHover((h) => (h?.key === p.key ? null : h))}
                    aria-label={
                      p.datum
                        ? `${p.stateName}, ${p.datum.complaints} complaints, +${p.datum.deltaPct}%`
                        : p.stateName
                    }
                  />
                ))}
              </svg>
            )}
          </div>
        </div>

        <div className={`${prefix}-iq-map-col ${prefix}-iq-map-col--detail`}>
          <div className={`${prefix}-iq-map-section-label`} style={{ marginBottom: 4 }}>
            State details
          </div>
          {hoverDatum ? (
            <StateHoverDetail prefix={prefix} datum={hoverDatum} />
          ) : (
            <OverallIndiaDetail prefix={prefix} overall={overall} />
          )}
        </div>
      </div>
    </div>
  );
}
