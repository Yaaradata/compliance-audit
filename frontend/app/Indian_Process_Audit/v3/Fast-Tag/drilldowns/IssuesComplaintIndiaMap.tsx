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

function MapDetailCell({
  prefix,
  label,
  value,
  sub,
  variant = 'sub',
}: {
  prefix: string;
  label: string;
  value: string;
  sub?: string;
  variant?: 'hero' | 'sub';
}) {
  return (
    <div className={`${prefix}-iq-map-detail-cell`}>
      <span className={`${prefix}-label`}>{label}</span>
      {variant === 'hero' ? (
        <>
          <div className={`${prefix}-iq-map-detail-val`}>{value}</div>
          {sub ? <span className={`${prefix}-faint`}>{sub}</span> : null}
        </>
      ) : (
        <div className={`${prefix}-iq-map-detail-sub`}>{value}</div>
      )}
    </div>
  );
}

function OverallIndiaDetail({ prefix, overall }: { prefix: string; overall: IndiaOverallSummary }) {
  return (
    <div className={`${prefix}-iq-map-hover-panel`}>
      <div className={`${prefix}-iq-map-detail-head`}>
        <strong>Overall India</strong>
        <span className={`${prefix}-up`}>+{overall.deltaPct}%</span>
      </div>
      <div className={`${prefix}-iq-map-detail-grid`}>
        <MapDetailCell
          prefix={prefix}
          label="Complaints"
          value={overall.complaints.toLocaleString()}
          sub={`vs ${overall.prior.toLocaleString()} prior`}
          variant="hero"
        />
        <MapDetailCell
          prefix={prefix}
          label="Regions rising"
          value={`${overall.risingRegions} / ${overall.totalRegions}`}
        />
        <MapDetailCell prefix={prefix} label="Top issue" value={overall.topIssue} />
        <MapDetailCell prefix={prefix} label="Top channel" value={overall.topChannel} />
        <MapDetailCell
          prefix={prefix}
          label="Hotspot region"
          value={`${overall.topRegion} (+${overall.topRegionDeltaPct}%)`}
        />
        <MapDetailCell
          prefix={prefix}
          label="Channel spike"
          value={`+${overall.channelSpikePct}% WoW`}
        />
        <MapDetailCell
          prefix={prefix}
          label="High-risk states"
          value={String(overall.criticalStates)}
        />
        <MapDetailCell
          prefix={prefix}
          label="States tracked"
          value={String(overall.statesTracked)}
        />
        <MapDetailCell prefix={prefix} label="Heaviest state" value={overall.worstState} />
        <MapDetailCell
          prefix={prefix}
          label="SLA at risk"
          value={overall.slaAtRisk.toLocaleString()}
        />
      </div>
    </div>
  );
}

function StateHoverDetail({
  prefix,
  datum,
  overall,
  rank,
}: {
  prefix: string;
  datum: StateComplaintDatum;
  overall: IndiaOverallSummary;
  rank: number;
}) {
  const riskLabel = datum.risk === 'medium' ? 'Med' : datum.risk;
  const sharePct =
    overall.complaints > 0 ? Math.round((datum.complaints / overall.complaints) * 1000) / 10 : 0;
  const vsNational = datum.deltaPct - overall.deltaPct;
  const vsNationalLabel = vsNational > 0 ? `+${vsNational} pts vs India` : `${vsNational} pts vs India`;

  return (
    <div className={`${prefix}-iq-map-hover-panel`}>
      <div className={`${prefix}-iq-map-detail-head`}>
        <strong>{datum.stateName}</strong>
        <span className={`${prefix}-up`}>+{datum.deltaPct}%</span>
      </div>
      <div className={`${prefix}-iq-map-detail-grid`}>
        <MapDetailCell
          prefix={prefix}
          label="Complaints"
          value={datum.complaints.toLocaleString()}
          sub={`vs ${datum.prior.toLocaleString()} prior`}
          variant="hero"
        />
        <MapDetailCell prefix={prefix} label="Share of India" value={`${sharePct}%`} />
        <MapDetailCell prefix={prefix} label="Top issue" value={datum.topIssue} />
        <MapDetailCell prefix={prefix} label="Top channel" value={datum.topChannel} />
        <MapDetailCell
          prefix={prefix}
          label="Severity"
          value={riskLabel}
        />
        <MapDetailCell prefix={prefix} label="Volume rank" value={`#${rank} nationally`} />
        <MapDetailCell prefix={prefix} label="Vs national" value={vsNationalLabel} />
        <MapDetailCell
          prefix={prefix}
          label="Prior period"
          value={`${datum.prior.toLocaleString()} complaints`}
        />
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
  const stateRankByVolume = useMemo(() => {
    const ranked = [...states].sort((a, b) => b.complaints - a.complaints);
    return Object.fromEntries(ranked.map((row, index) => [row.rto, index + 1]));
  }, [states]);

  return (
    <div className={`${prefix}-iq-map`}>
      <div className={`${prefix}-iq-map-split`}>
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

        <div className={`${prefix}-iq-map-head ${prefix}-iq-map-head--detail`}>
          <span className={`${prefix}-iq-map-section-label`}>State details</span>
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

        {hoverDatum ? (
          <StateHoverDetail
            prefix={prefix}
            datum={hoverDatum}
            overall={overall}
            rank={stateRankByVolume[hoverDatum.rto] ?? 0}
          />
        ) : (
          <OverallIndiaDetail prefix={prefix} overall={overall} />
        )}
      </div>
    </div>
  );
}
