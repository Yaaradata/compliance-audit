'use client';

import { useId, useMemo } from 'react';
import type { KriBand } from './kriMonitoringTokens';
import { KRI_BAND_TOKEN } from './kriMonitoringTokens';
import { buildKriSparklineScale, KRI_SPARKLINE_HEIGHT, KRI_SPARKLINE_WIDTH } from './kriSparklineScale';

export function KriSparkline({
  data,
  thresholds,
  band,
  height = KRI_SPARKLINE_HEIGHT,
  className = '',
}: {
  data: number[];
  thresholds: { amber: number; red: number };
  band: KriBand;
  height?: number;
  className?: string;
}) {
  const gradId = useId().replace(/:/g, '');
  const scale = useMemo(() => buildKriSparklineScale(data, thresholds, height), [data, thresholds, height]);

  if (data.length < 2) {
    return (
      <div
        className={`rounded border border-dashed border-slate-200 bg-slate-50 ${className}`}
        style={{ height, minHeight: height, width: '100%' }}
      />
    );
  }

  const { min, max, amberY, redY } = scale;
  const range = max - min || 1;
  const plotH = height - 4;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * KRI_SPARKLINE_WIDTH,
    y: height - ((v - min) / range) * plotH - 2,
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${KRI_SPARKLINE_WIDTH} ${height} L 0 ${height} Z`;
  const tok = KRI_BAND_TOKEN[band];

  return (
    <div className={`min-w-0 ${className}`} style={{ height, width: '100%' }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${KRI_SPARKLINE_WIDTH} ${height}`}
        preserveAspectRatio="none"
        className="block h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tok.solid} stopOpacity={0.25} />
            <stop offset="100%" stopColor={tok.solid} stopOpacity={0} />
          </linearGradient>
        </defs>

        {amberY != null && (
          <line
            x1={0}
            y1={amberY}
            x2={KRI_SPARKLINE_WIDTH}
            y2={amberY}
            stroke="#D97706"
            strokeDasharray="2 3"
            strokeWidth={1}
            opacity={0.45}
            vectorEffect="non-scaling-stroke"
          />
        )}
        {redY != null && (
          <line
            x1={0}
            y1={redY}
            x2={KRI_SPARKLINE_WIDTH}
            y2={redY}
            stroke="#DC2626"
            strokeDasharray="2 3"
            strokeWidth={1}
            opacity={0.5}
            vectorEffect="non-scaling-stroke"
          />
        )}

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={path}
          fill="none"
          stroke={tok.solid}
          strokeWidth={1.75}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={tok.solid}
          stroke="white"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

