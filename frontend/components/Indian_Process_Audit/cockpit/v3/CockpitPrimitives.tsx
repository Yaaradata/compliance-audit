'use client';

import type { ReactNode } from 'react';
import { useId } from 'react';
import type { CockpitTrend } from '@/lib/Indian_Process_Audit/riskCommandCenter';

export function CockpitCard({
  children,
  className = '',
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${pad ? 'p-4' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
      <h2 className="m-0 text-[15px] font-bold tracking-wide text-slate-900">{children}</h2>
      {right}
    </div>
  );
}

export function TrendArrow({ dir }: { dir: CockpitTrend }) {
  const ch = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→';
  return <span className="text-[15px] leading-none">{ch}</span>;
}

export function Sparkline({
  data,
  color,
  width = 132,
  height = 46,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 4 - ((v - min) / rng) * (height - 12);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = pts.join(' ');
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block shrink-0">
      <defs>
        <linearGradient id={`sp-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sp-${uid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeatLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
      <span className="h-1.5 w-3.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
