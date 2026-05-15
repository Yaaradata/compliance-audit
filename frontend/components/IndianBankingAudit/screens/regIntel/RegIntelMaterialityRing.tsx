'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { RegIntelHelpTip } from './RegIntelHelpTip';
import { REG_INTEL_HELP } from './regIntelHelpCopy';

export interface RegIntelMaterialityRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showScore?: boolean;
  /** When omitted, stroke uses materiality heat (higher score = hotter). */
  sourceColor?: string;
}

function bandStroke(score: number): string {
  if (score >= 80) return '#DC2626';
  if (score >= 60) return '#F59E0B';
  return '#15803D';
}

export function RegIntelMaterialityRing({
  score,
  size = 64,
  strokeWidth = 6,
  showScore = true,
  sourceColor,
}: RegIntelMaterialityRingProps) {
  const stroke = sourceColor ?? bandStroke(score);
  const r = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * r, [r]);
  const targetOffset = circumference * (1 - Math.min(100, Math.max(0, score)) / 100);
  const [dashOffset, setDashOffset] = useState(circumference);

  useEffect(() => {
    setDashOffset(circumference);
    const id = requestAnimationFrame(() => setDashOffset(targetOffset));
    return () => cancelAnimationFrame(id);
  }, [circumference, targetOffset, score]);

  const showLabel = size >= 80;
  const fontSize = size >= 72 ? 20 : size >= 56 ? 17 : 16;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: size, height: size }}
      {...(showScore
        ? { role: 'img' as const, 'aria-label': `Materiality score ${score} out of 100` }
        : {})}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 shrink-0"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      {showScore ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
          <span className="font-bold tabular-nums text-slate-900" style={{ fontSize: `${fontSize}px` }}>
            {score}
          </span>
          {showLabel ? (
            <span className="mt-1 flex max-w-[90%] items-center justify-center gap-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Materiality
              <span className="pointer-events-auto">
                <RegIntelHelpTip text={REG_INTEL_HELP.materialityScore} label="Materiality score help" align="start" />
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
