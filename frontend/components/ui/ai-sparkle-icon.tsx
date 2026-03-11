"use client";

import { useId } from "react";

/**
 * Golden star with sprinkling sparkles — represents AI.
 * Implemented as inline SVG (no image file).
 * Matches reference: 4-pointed star with radiating golden dots.
 */
export function AISparkleIcon({ className, size = 14 }: { className?: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // 4-pointed star (sparkle/burst shape): outer and inner points
  const outerR = cx * 0.48;
  const innerR = cx * 0.18;
  const points: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  const starD = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") + " Z";

  // Sparkle dots (sprinkling effect) around the star — scale with size
  const k = s / 14;
  const sparkles: { x: number; y: number; r: number; opacity: number }[] = [
    { x: cx + 4.2 * k, y: cy - 1.5 * k, r: 0.35 * k, opacity: 0.9 },
    { x: cx - 4.0 * k, y: cy + 1.8 * k, r: 0.3 * k, opacity: 0.85 },
    { x: cx + 2.0 * k, y: cy - 4.5 * k, r: 0.25 * k, opacity: 0.8 },
    { x: cx - 1.8 * k, y: cy - 4.2 * k, r: 0.3 * k, opacity: 0.75 },
    { x: cx + 4.5 * k, y: cy + 3.2 * k, r: 0.25 * k, opacity: 0.85 },
    { x: cx - 3.8 * k, y: cy + 3.5 * k, r: 0.3 * k, opacity: 0.8 },
    { x: cx + 0.8 * k, y: cy + 4.8 * k, r: 0.2 * k, opacity: 0.7 },
    { x: cx - 1.2 * k, y: cy - 2.8 * k, r: 0.25 * k, opacity: 0.75 },
  ];

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`ai-star-glow-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id={`ai-star-soft-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.25" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Sprinkling sparkles */}
      {sparkles.map((sp, i) => (
        <circle
          key={i}
          cx={sp.x}
          cy={sp.y}
          r={sp.r}
          fill="#fbbf24"
          opacity={sp.opacity}
        />
      ))}
      {/* Central 4-point star */}
      <path
        d={starD}
        fill={`url(#ai-star-glow-${id})`}
        filter={`url(#ai-star-soft-${id})`}
      />
    </svg>
  );
}
