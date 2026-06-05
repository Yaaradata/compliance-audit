'use client';

import React, { useMemo, useState } from 'react';

const W = 340;
const H = 210;
const X_L = 52;
const X_R = 288;
const Y0 = 24;
const Y1 = 186;
const PLOT_H = Y1 - Y0;
const SCALE_MAX = 50;

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

function yScale(pct) {
  return Y1 - (pct / SCALE_MAX) * PLOT_H;
}

function revDelta(joinPct, revPct) {
  const d = revPct - joinPct;
  if (d === 0) return { text: 'Aligned', tone: 'flat' };
  if (d > 0) return { text: `+${d} pts lift`, tone: 'up' };
  return { text: `${d} pts gap`, tone: 'down' };
}

function SlopeLine({
  x1,
  y1,
  x2,
  y2,
  color,
  strokeWidth = 2.5,
  active,
  hot,
  muted,
  dashed,
  onClick,
  onEnter,
  onLeave,
  ariaLabel,
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g
      className={`pf-medium-sl-line${active ? ' is-active' : ''}${hot ? ' is-hot' : ''}${muted ? ' is-muted' : ''}`}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={active || hot ? strokeWidth + 1.5 : strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashed ? '5 4' : undefined}
        className="pf-medium-sl-stroke"
      />
      <circle cx={x1} cy={y1} r={active || hot ? 6 : 5} fill={color} stroke="#fff" strokeWidth={2} />
      <circle cx={x2} cy={y2} r={active || hot ? 6 : 5} fill={color} stroke="#fff" strokeWidth={2} />
      <line
        x1={mx - 18}
        y1={my}
        x2={mx + 18}
        y2={my}
        stroke="transparent"
        strokeWidth={14}
        className="pf-medium-sl-hit"
      />
    </g>
  );
}

function SlopeChart({ mix, drillId, hoverKey, subFocus, onSelect, onHover, onLeave, onSubSelect }) {
  const drilled = drillId ? mix.mediums.find((m) => m.id === drillId) : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pf-medium-sl-svg" role="application">
      {[0, 10, 20, 30, 40, 50].map((tick) => {
        const y = yScale(tick);
        return (
          <g key={tick} className="pf-medium-sl-grid">
            <line x1={X_L} y1={y} x2={X_R} y2={y} />
            <text x={X_L - 6} y={y + 3} textAnchor="end" className="pf-medium-sl-tick">
              {tick}
            </text>
            <text x={X_R + 6} y={y + 3} textAnchor="start" className="pf-medium-sl-tick">
              {tick}
            </text>
          </g>
        );
      })}

      <line x1={X_L} y1={Y0} x2={X_L} y2={Y1} className="pf-medium-sl-axis" />
      <line x1={X_R} y1={Y0} x2={X_R} y2={Y1} className="pf-medium-sl-axis" />
      <text x={X_L} y={14} textAnchor="middle" className="pf-medium-sl-axis-title">
        Join %
      </text>
      <text x={X_R} y={14} textAnchor="middle" className="pf-medium-sl-axis-title">
        Rev %
      </text>

      {!drilled
        ? mix.mediums.map((m) => {
            const y1 = yScale(m.joinSharePct);
            const y2 = yScale(m.revenueSharePct);
            const key = m.id;
            const active = drillId === key;
            const hot = hoverKey === key;
            const muted = drillId && !active;
            const mx = (X_L + X_R) / 2;
            const my = (y1 + y2) / 2;

            return (
              <g key={key}>
                <SlopeLine
                  x1={X_L}
                  y1={y1}
                  x2={X_R}
                  y2={y2}
                  color={m.color}
                  active={active}
                  hot={hot}
                  muted={muted}
                  onClick={() => onSelect(key)}
                  onEnter={() => onHover(key)}
                  onLeave={onLeave}
                  ariaLabel={`${m.label} join ${m.joinSharePct}% revenue ${m.revenueSharePct}%`}
                />
                {(active || hot) && (
                  <text x={mx} y={my - 8} textAnchor="middle" className="pf-medium-sl-label">
                    {m.shortLabel}
                  </text>
                )}
              </g>
            );
          })
        : drilled.drill.subMix.map((sub, si) => {
            const joinTotal = (drilled.joinSharePct * sub.pct) / 100;
            const revTotal = (drilled.revenueSharePct * sub.pct) / 100;
            const y1 = yScale(joinTotal);
            const y2 = yScale(revTotal);
            const key = `${drilled.id}-${sub.label}`;
            const fill = shadeHex(drilled.color, 0.12 + si * 0.2);
            const active = subFocus === sub.label;
            const hot = hoverKey === key;

            return (
              <g key={key}>
                <SlopeLine
                  x1={X_L}
                  y1={y1}
                  x2={X_R}
                  y2={y2}
                  color={fill}
                  strokeWidth={2}
                  active={active}
                  hot={hot}
                  muted={false}
                  dashed={!active && !hot}
                  onClick={() => onSubSelect(active ? null : sub.label)}
                  onEnter={() => onHover(key)}
                  onLeave={onLeave}
                  ariaLabel={`${sub.label} ${sub.pct}% of ${drilled.shortLabel}`}
                />
                {(active || hot) && (
                  <text
                    x={(X_L + X_R) / 2}
                    y={(y1 + y2) / 2 - 7}
                    textAnchor="middle"
                    className="pf-medium-sl-label pf-medium-sl-label--sub"
                  >
                    {sub.label.length > 18 ? `${sub.label.slice(0, 16)}…` : sub.label}
                  </text>
                )}
              </g>
            );
          })}
    </svg>
  );
}

/** Dumbbell slope — join rail to revenue rail; line angle = lift. */
export function ConsumerMediumSlope({ mix }) {
  const [drillId, setDrillId] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const [subFocus, setSubFocus] = useState(null);

  const drilled = drillId ? mix.mediums.find((m) => m.id === drillId) : null;
  const focusSub =
    subFocus && drilled ? drilled.drill.subMix.find((s) => s.label === subFocus) : null;

  const focusMedium = useMemo(() => {
    if (!hoverKey && !drillId) return null;
    if (hoverKey?.includes('-')) {
      const medium = mix.mediums.find((m) => hoverKey.startsWith(`${m.id}-`));
      if (!medium) return null;
      const sub = medium.drill.subMix.find((s) => `${medium.id}-${s.label}` === hoverKey);
      return sub ? { medium, sub } : { medium };
    }
    const id = hoverKey ?? drillId;
    const medium = mix.mediums.find((m) => m.id === id);
    return medium ? { medium, sub: focusSub } : null;
  }, [hoverKey, drillId, mix.mediums, focusSub]);

  const drillTo = (id) => {
    setSubFocus(null);
    setDrillId((prev) => (prev === id ? null : id));
  };

  const clear = () => {
    setDrillId(null);
    setSubFocus(null);
    setHoverKey(null);
  };

  return (
    <div className={`pf-medium-sl${drillId ? ' is-drilled' : ''}`}>
      <div className="pf-medium-sl-stage">
        <div className="pf-medium-sl-toolbar">
          {drilled ? (
            <button type="button" className="pf-medium-sl-back" onClick={clear}>
              ← All channels
            </button>
          ) : (
            <span className="pf-faint pf-medium-sl-hint">
              Upward slope = more revenue share than join · downward = join-heavy
            </span>
          )}
        </div>

        <div className="pf-medium-sl-canvas">
          <SlopeChart
            mix={mix}
            drillId={drillId}
            hoverKey={hoverKey}
            subFocus={subFocus}
            onSelect={drillTo}
            onHover={setHoverKey}
            onLeave={() => setHoverKey(null)}
            onSubSelect={setSubFocus}
          />
        </div>

        <ul className="pf-medium-sl-legend">
          {mix.mediums.map((m) => {
            const delta = revDelta(m.joinSharePct, m.revenueSharePct);
            const active = drillId === m.id;
            const hot = hoverKey === m.id;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  className={`pf-medium-sl-leg${active ? ' is-active' : ''}${hot ? ' is-hot' : ''}`}
                  onClick={() => drillTo(m.id)}
                  onMouseEnter={() => setHoverKey(m.id)}
                  onMouseLeave={() => setHoverKey(null)}
                  aria-pressed={active}
                >
                  <span className="pf-medium-sl-swatch" style={{ background: m.color }} aria-hidden />
                  <span className="pf-medium-sl-leg-name">{m.shortLabel}</span>
                  <span className="pf-medium-sl-leg-metric">
                    {m.joinSharePct}→{m.revenueSharePct}%
                  </span>
                  <span className={`pf-medium-sl-leg-delta pf-medium-sl-leg-delta--${delta.tone}`}>
                    {delta.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {focusMedium?.medium ? (
          <div
            className="pf-medium-sl-detail"
            style={{ borderColor: `${focusMedium.medium.color}44` }}
          >
            <span className="pf-medium-sl-detail-title" style={{ color: focusMedium.medium.color }}>
              {focusMedium.sub ? focusMedium.sub.label : focusMedium.medium.label}
            </span>
            <span className="pf-faint pf-medium-sl-detail-sub">
              {focusMedium.sub
                ? `${focusMedium.sub.pct}% within ${focusMedium.medium.shortLabel}`
                : `${focusMedium.medium.joinDetail}`}
            </span>
            <span className="pf-faint">
              {focusMedium.medium.mom} MoM · {focusMedium.medium.yoy} YoY · ₹
              {focusMedium.medium.revenueCr.toFixed(1)}Cr
            </span>
          </div>
        ) : null}

        <div className="pf-medium-sl-foot">
          <span className="pf-faint">
            {mix.totalNewTagsLabel} tags · ₹{mix.totalConsumerRevenueCr.toFixed(1)}Cr net
          </span>
        </div>
      </div>
    </div>
  );
}
