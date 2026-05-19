'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import { COCKPIT } from '../cockpitTokens';

export function KpiTrendSparkline({
  data,
  stroke,
  height = 52,
}: {
  data: number[];
  stroke: string;
  height?: number;
}) {
  const chartData = useMemo(() => data.map((v, i) => ({ i, v })), [data]);
  const gradientId = useMemo(() => `kpi-spark-${stroke.replace('#', '')}`, [stroke]);

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = Math.max(0.5, (max - min) * 0.15);

  return (
    <div className="h-full w-full min-w-0" style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function kpiSparklineStroke(status: 'good' | 'warning' | 'danger' | 'neutral'): string {
  if (status === 'good') return COCKPIT.green.bar;
  if (status === 'warning') return COCKPIT.amber.bar;
  if (status === 'danger') return COCKPIT.red.bar;
  return COCKPIT.gray.g400;
}
