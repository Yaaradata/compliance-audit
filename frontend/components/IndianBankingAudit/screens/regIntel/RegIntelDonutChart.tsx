'use client';

import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const RED = '#f43f5e';
const AMBER = '#f59e0b';
const GREEN = '#22c55e';

export function RegIntelDonutChart({
  uncovered,
  partial,
  covered,
  size = 108,
}: {
  uncovered: number;
  partial: number;
  covered: number;
  /** Outer diameter in px */
  size?: number;
}) {
  const data = useMemo(
    () => [
      { name: 'Uncovered', value: uncovered, color: RED },
      { name: 'Partial', value: partial, color: AMBER },
      { name: 'Covered', value: covered, color: GREEN },
    ],
    [uncovered, partial, covered]
  );
  const total = uncovered + partial + covered;
  const outerR = Math.round(size * 0.46);
  const innerR = Math.round(size * 0.28);

  if (total === 0) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full border-4 border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500"
        style={{ width: size, height: size }}
      >
        —
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerR}
            outerRadius={outerR}
            startAngle={90}
            endAngle={-270}
            stroke="#fff"
            strokeWidth={1}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
