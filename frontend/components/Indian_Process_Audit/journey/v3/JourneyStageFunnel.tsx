'use client';

import type { RccDomain } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { pct } from './journeyCommandCenterStyles';

type Props = {
  domain: RccDomain;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  className?: string;
};

/** SVG-only stage funnel — header/legend belong in the parent panel. */
export function JourneyStageFunnel({ domain, selectedKey, onSelect, className = '' }: Props) {
  const stages = domain.stages;
  const W = 1000;
  const H = 280;
  const padL = 28;
  const padR = 28;
  const padT = 28;
  const padB = 48;
  const plotH = H - padT - padB;
  const baseY = padT + plotH;
  const maxR = Math.max(...stages.map((s) => s.reached), 1);
  const n = stages.length;
  const colW = (W - padL - padR) / n;
  const barW = Math.min(44, colW * 0.48);
  const hOf = (v: number) => (v / maxR) * plotH;
  const cx = (i: number) => padL + colW * i + colW / 2;

  const topPts = stages.map((s, i) => `${cx(i)},${(baseY - hOf(s.reached)).toFixed(1)}`);
  const areaPath = `M ${padL},${baseY} L ${topPts.join(' L ')} L ${W - padR},${baseY} Z`;

  return (
    <div className={`h-full min-h-[200px] w-full ${className}`.trim()}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-full w-full"
        role="img"
        aria-label={`${domain.name} journey control funnel`}
      >
        <path d={areaPath} fill="#0f172a" opacity="0.04" />
        <polyline
          points={topPts.join(' ')}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />
        <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke="#dbe2ea" strokeWidth="1" />

        {stages.map((s, i) => {
          const rH = hOf(s.reached);
          const pH = hOf(s.passed);
          const vH = hOf(s.review);
          const fH = hOf(s.failed);
          const x = cx(i) - barW / 2;
          const yReachTop = baseY - rH;
          const yPass = baseY - pH;
          const yRev = yPass - vH;
          const yFail = yRev - fH;
          const sel = s.key === selectedKey;
          const passRate = pct(s.passed, s.reached);
          const countY = yReachTop - 8;
          const dropY = yReachTop - 22;

          return (
            <g
              key={s.key}
              className="cursor-pointer"
              onClick={() => onSelect(s.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(s.key);
              }}
            >
              <rect
                x={cx(i) - colW / 2}
                y={padT}
                width={colW}
                height={plotH + padB}
                fill="transparent"
              />
              <rect x={x} y={yPass} width={barW} height={pH} fill="#16a34a" opacity="0.92" />
              {vH > 0 ? (
                <rect x={x} y={yRev} width={barW} height={vH} fill="#2563eb" opacity="0.92" />
              ) : null}
              {fH > 0 ? <rect x={x} y={yFail} width={barW} height={fH} fill="#dc2626" /> : null}
              <rect
                x={x}
                y={yReachTop}
                width={barW}
                height={rH}
                fill="none"
                stroke={sel ? '#0f172a' : '#cbd5e1'}
                strokeWidth={sel ? 2 : 1}
                rx="4"
              />
              {s.failed > 0 ? (
                <text
                  x={cx(i)}
                  y={dropY}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill="#dc2626"
                >
                  ▾{s.failed}
                </text>
              ) : null}
              <text x={cx(i)} y={countY} textAnchor="middle" fontSize="10.5" fill="#64748b">
                {s.reached}
              </text>
              <text
                x={cx(i)}
                y={baseY + 16}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={sel ? '#0f172a' : '#475569'}
              >
                {s.key}
              </text>
              <text x={cx(i)} y={baseY + 30} textAnchor="middle" fontSize="10" fill="#94a3b8">
                {passRate}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
