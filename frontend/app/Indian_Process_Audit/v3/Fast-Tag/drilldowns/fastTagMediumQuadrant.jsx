'use client';

import React, { useMemo, useState } from 'react';

const W = 360;
const H = 220;
const PAD = { l: 36, r: 14, t: 14, b: 30 };
const PLOT_W = W - PAD.l - PAD.r;
const PLOT_H = H - PAD.t - PAD.b;
const AXIS_MAX = 50;

function shadeHex(hex, t) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c) => Math.round(c + (255 - c) * t);
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

function plotXY(joinPct, revPct) {
  return {
    x: PAD.l + (joinPct / AXIS_MAX) * PLOT_W,
    y: PAD.t + PLOT_H - (revPct / AXIS_MAX) * PLOT_H,
  };
}

function bubbleR(revenueCr, maxCr) {
  const t = revenueCr / maxCr;
  return 10 + t * 14;
}

function revDelta(joinPct, revPct) {
  const d = revPct - joinPct;
  if (d === 0) return { text: 'On diagonal', tone: 'flat' };
  if (d > 0) return { text: `+${d} pts above join`, tone: 'up' };
  return { text: `${d} pts below join`, tone: 'down' };
}

function QuadrantSvg({ mix, drillId, hoverId, onSelect, onHover, onLeave }) {
  const maxCr = Math.max(...mix.mediums.map((m) => m.revenueCr), 0.1);
  const alignLine = [
    plotXY(0, 0),
    plotXY(AXIS_MAX, AXIS_MAX),
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pf-medium-qd-svg" role="img">
      <defs>
        {mix.mediums.map((m) => (
          <linearGradient key={m.id} id={`pf-qd-grad-${m.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={m.color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={shadeHex(m.color, 0.25)} stopOpacity="0.95" />
          </linearGradient>
        ))}
      </defs>

      {[10, 20, 30, 40].map((tick) => {
        const { x } = plotXY(tick, 0);
        const { y } = plotXY(0, tick);
        return (
          <g key={tick} className="pf-medium-qd-grid">
            <line x1={x} y1={PAD.t} x2={x} y2={PAD.t + PLOT_H} />
            <line x1={PAD.l} y1={y} x2={PAD.l + PLOT_W} y2={y} />
            <text x={x} y={H - 8} textAnchor="middle" className="pf-medium-qd-tick">
              {tick}
            </text>
            <text x={PAD.l - 6} y={y + 3} textAnchor="end" className="pf-medium-qd-tick">
              {tick}
            </text>
          </g>
        );
      })}

      <line
        x1={alignLine[0].x}
        y1={alignLine[0].y}
        x2={alignLine[1].x}
        y2={alignLine[1].y}
        className="pf-medium-qd-align"
      />
      <text x={PAD.l + PLOT_W - 4} y={PAD.t + 10} textAnchor="end" className="pf-medium-qd-align-label">
        Aligned
      </text>

      <text x={PAD.l + PLOT_W / 2} y={H - 2} textAnchor="middle" className="pf-medium-qd-axis">
        Join share %
      </text>
      <text
        x={12}
        y={PAD.t + PLOT_H / 2}
        textAnchor="middle"
        transform={`rotate(-90 12 ${PAD.t + PLOT_H / 2})`}
        className="pf-medium-qd-axis"
      >
        Net rev share %
      </text>

      <rect
        x={PAD.l}
        y={PAD.t}
        width={PLOT_W * 0.52}
        height={PLOT_H * 0.58}
        className="pf-medium-qd-zone pf-medium-qd-zone--lift"
      />
      <text x={PAD.l + 8} y={PAD.t + 12} textAnchor="start" className="pf-medium-qd-zone-label">
        Rev overweight
      </text>

      {mix.mediums.map((m) => {
        const { x, y } = plotXY(m.joinSharePct, m.revenueSharePct);
        const r = bubbleR(m.revenueCr, maxCr);
        const active = drillId === m.id;
        const hot = hoverId === m.id;
        const muted = drillId && !active;

        return (
          <g
            key={m.id}
            className={`pf-medium-qd-bubble${active ? ' is-active' : ''}${hot ? ' is-hot' : ''}${muted ? ' is-muted' : ''}`}
            onClick={() => onSelect(m.id)}
            onMouseEnter={() => onHover(m.id)}
            onMouseLeave={onLeave}
            role="button"
            tabIndex={0}
            aria-label={`${m.label} ${m.joinSharePct}% join ${m.revenueSharePct}% revenue`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(m.id);
              }
            }}
          >
            <circle
              cx={x}
              cy={y}
              r={r + (active || hot ? 2 : 0)}
              fill={`url(#pf-qd-grad-${m.id})`}
              className="pf-medium-qd-bubble-fill"
            />
            <text x={x} y={y + 3} textAnchor="middle" className="pf-medium-qd-bubble-pct">
              {m.joinSharePct}%
            </text>
            {(active || hot) && r >= 14 ? (
              <text x={x} y={y + r + 11} textAnchor="middle" className="pf-medium-qd-bubble-name">
                {m.shortLabel}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function SubMixPanel({ medium, subFocus, onSubSelect }) {
  return (
    <div className="pf-medium-qd-subs" style={{ borderColor: `${medium.color}33` }}>
      <div className="pf-medium-qd-subs-head">
        <span className="pf-medium-qd-swatch" style={{ background: medium.color }} aria-hidden />
        <span className="pf-medium-qd-subs-title" style={{ color: medium.color }}>
          {medium.shortLabel} sub-mix
        </span>
        <span className="pf-faint">
          {medium.joinSharePct}% join · {medium.revenueSharePct}% rev
        </span>
      </div>
      <ul className="pf-medium-qd-sublist">
        {medium.drill.subMix.map((sub, si) => {
          const active = subFocus === sub.label;
          const joinTotal = ((medium.joinSharePct * sub.pct) / 100).toFixed(1);
          const fill = shadeHex(medium.color, 0.1 + si * 0.18);
          return (
            <li key={sub.label}>
              <button
                type="button"
                className={`pf-medium-qd-sub${active ? ' is-active' : ''}`}
                onClick={() => onSubSelect(active ? null : sub.label)}
                aria-pressed={active}
              >
                <span className="pf-medium-qd-sub-label">{sub.label}</span>
                <span className="pf-medium-qd-sub-track">
                  <span className="pf-medium-qd-sub-fill" style={{ width: `${sub.pct}%`, background: fill }} />
                </span>
                <span className="pf-medium-qd-sub-pct" style={{ color: medium.color }}>
                  {sub.pct}%
                </span>
                <span className="pf-faint pf-medium-qd-sub-meta">{joinTotal}% total</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Quadrant map — join % vs revenue %; bubble size = ₹Cr net. */
export function ConsumerMediumQuadrant({ mix }) {
  const [drillId, setDrillId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [subFocus, setSubFocus] = useState(null);

  const drilled = drillId ? mix.mediums.find((m) => m.id === drillId) : null;
  const focusMedium = hoverId
    ? mix.mediums.find((m) => m.id === hoverId)
    : drilled;

  const tip = useMemo(() => {
    if (!focusMedium) return null;
    const delta = revDelta(focusMedium.joinSharePct, focusMedium.revenueSharePct);
    return {
      title: focusMedium.label,
      lines: [
        `${focusMedium.joinSharePct}% join · ${focusMedium.revenueSharePct}% net rev`,
        delta.text,
        `${focusMedium.newTagsLabel} tags · ₹${focusMedium.revenueCr.toFixed(1)}Cr`,
        `${focusMedium.mom} MoM · ${focusMedium.yoy} YoY`,
      ],
      color: focusMedium.color,
      tone: delta.tone,
    };
  }, [focusMedium]);

  const drillTo = (id) => {
    setSubFocus(null);
    setDrillId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`pf-medium-qd${drillId ? ' is-drilled' : ''}`}>
      <div className="pf-medium-qd-stage">
        <div className="pf-medium-qd-canvas">
          <QuadrantSvg
            mix={mix}
            drillId={drillId}
            hoverId={hoverId}
            onSelect={drillTo}
            onHover={setHoverId}
            onLeave={() => setHoverId(null)}
          />
        </div>

        {tip ? (
          <div className="pf-medium-qd-tip" style={{ '--tip-color': tip.color }}>
            <span className="pf-medium-qd-tip-title" style={{ color: tip.color }}>
              {tip.title}
            </span>
            {tip.lines.map((line) => (
              <span key={line} className={`pf-faint pf-medium-qd-tip-line pf-medium-qd-tip-line--${tip.tone}`}>
                {line}
              </span>
            ))}
          </div>
        ) : (
          <p className="pf-faint pf-medium-qd-hint">
            Above the diagonal = more revenue share than join share · bubble size = ₹Cr net
          </p>
        )}

        <div className="pf-medium-qd-foot">
          <span className="pf-faint">
            {mix.totalNewTagsLabel} tags · ₹{mix.totalConsumerRevenueCr.toFixed(1)}Cr consumer net
          </span>
        </div>
      </div>

      {drilled ? (
        <SubMixPanel
          medium={drilled}
          subFocus={subFocus}
          onSubSelect={setSubFocus}
        />
      ) : null}
    </div>
  );
}
