'use client';

import React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

export function RegIntelSparkline({
  data,
  stroke = '#15803D',
  height = 36,
}: {
  data: number[];
  stroke?: string;
  height?: number;
}) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey="v" stroke={stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
