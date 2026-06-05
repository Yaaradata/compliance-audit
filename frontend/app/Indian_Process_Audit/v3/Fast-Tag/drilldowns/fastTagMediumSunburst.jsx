'use client';

import React, { useMemo, useState } from 'react';

const CX = 120;
const CY = 120;
const R_HOLE = 28;
const R_MAIN_IN = 32;
const R_MAIN_OUT = 72;
const R_SUB_IN = 78;
const R_SUB_OUT = 108;
const GAP = 0.75;

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r0, r1, a0, a1) {
  if (a1 - a0 <= 0.05) return '';
  const large = a1 - a0 > 180 ? 1 : 0;
  const p0 = polar(cx, cy, r0, a0);
  const p1 = polar(cx, cy, r1, a0);
  const p2 = polar(cx, cy, r1, a1);
  const p3 = polar(cx, cy, r0, a1);
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${r0} ${r0} 0 ${large} 1 ${p3.x} ${p3.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${r1} ${r1} 0 ${large} 0 ${p1.x} ${p1.y}`,
    'Z',
  ].join(' ');
}

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

function buildMainSegments(mediums) {
  const segments = [];
  let cursor = 0;
  mediums.forEach((medium) => {
    const pct = medium.joinSharePct;
    const start = cursor + GAP / 2;
    const end = cursor + pct * 3.6 - GAP / 2;
    cursor += pct * 3.6;
    segments.push({
      key: medium.id,
      medium,
      startAngle: start,
      endAngle: end,
      midAngle: (start + end) / 2,
      pct,
    });
  });
  return segments;
}

/** Sub-segments fan out only within the parent wedge (sunburst explode). */
function buildExplodedSegments(medium, parentStart, parentEnd) {
  const span = parentEnd - parentStart;
  const segments = [];
  let cursor = parentStart + GAP / 3;
  medium.drill.subMix.forEach((sub, si) => {
    const wedge = (span * sub.pct) / 100;
    const start = cursor + GAP / 4;
    const end = cursor + wedge - GAP / 4;
    cursor += wedge;
    segments.push({
      key: `${medium.id}-${sub.label}`,
      sub,
      startAngle: start,
      endAngle: end,
      pct: sub.pct,
      fill: shadeHex(medium.color, 0.06 + si * 0.2),
      revenueCr: (medium.revenueCr * sub.pct) / 100,
      index: si,
    });
  });
  return segments;
}

function SunburstSegment({
  cx,
  cy,
  r0,
  r1,
  startAngle,
  endAngle,
  fill,
  muted,
  active,
  className = '',
  style,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ariaLabel,
}) {
  const d = arcPath(cx, cy, r0, r1, startAngle, endAngle);
  if (!d) return null;
  return (
    <path
      d={d}
      fill={fill}
      stroke="#fff"
      strokeWidth={2}
      className={`pf-sun-seg${active ? ' is-active' : ''}${muted ? ' is-muted' : ''} ${className}`.trim()}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e);
        }
      }}
    />
  );
}

const VIEW = 240;

function SlicePctLabel({ a0, a1, r0, r1, pct, className = '' }) {
  const span = a1 - a0;
  if (span < 9 || pct == null) return null;
  const mid = (a0 + a1) / 2;
  const r = (r0 + r1) / 2;
  const { x, y } = polar(CX, CY, r, mid);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      className={`pf-sun-pct ${className}`.trim()}
    >
      {pct}%
    </text>
  );
}

function quadFromMid(mid) {
  if (mid >= 0 && mid < 90) return 'br';
  if (mid >= 90 && mid < 180) return 'bl';
  if (mid >= 180 && mid < 270) return 'tl';
  return 'tr';
}

function popupFromKey(mix, key) {
  const medium = mix.mediums.find((m) => key === m.id || key.startsWith(`${m.id}-`));
  if (!medium) return null;

  if (key.includes('-')) {
    const sub = medium.drill.subMix.find((s) => `${medium.id}-${s.label}` === key);
    if (!sub) return null;
    const rev = (medium.revenueCr * sub.pct) / 100;
    const shareOfTotal = ((medium.joinSharePct * sub.pct) / 100).toFixed(1);
    const revLabel = rev >= 1 ? `₹${rev.toFixed(1)}Cr` : `₹${(rev * 10).toFixed(0)}L`;
    return {
      title: sub.label,
      kicker: medium.shortLabel,
      color: medium.color,
      primary: `${sub.pct}%`,
      secondary: `${shareOfTotal}% of total · ${revLabel} net`,
    };
  }

  return {
    title: medium.label,
    kicker: 'Channel',
    color: medium.color,
    primary: `${medium.joinSharePct}%`,
    secondary: `${medium.revenueSharePct}% rev · ${medium.newTagsLabel} · ₹${medium.revenueCr.toFixed(1)}Cr`,
  };
}

function anchorForKey(key, main, exploded) {
  const subSeg = exploded.find((s) => s.key === key);
  if (subSeg) {
    const mid = (subSeg.startAngle + subSeg.endAngle) / 2;
    const inner = polar(CX, CY, (R_SUB_IN + R_SUB_OUT) / 2, mid);
    const tip = polar(CX, CY, R_SUB_OUT + 14, mid);
    return {
      mid,
      xPct: (tip.x / VIEW) * 100,
      yPct: (tip.y / VIEW) * 100,
      lx: inner.x,
      ly: inner.y,
      tx: tip.x,
      ty: tip.y,
    };
  }

  const mainSeg = main.find((s) => s.key === key);
  if (mainSeg) {
    const mid = (mainSeg.startAngle + mainSeg.endAngle) / 2;
    const inner = polar(CX, CY, (R_MAIN_IN + R_MAIN_OUT) / 2, mid);
    const tip = polar(CX, CY, R_MAIN_OUT + 12, mid);
    return {
      mid,
      xPct: (tip.x / VIEW) * 100,
      yPct: (tip.y / VIEW) * 100,
      lx: inner.x,
      ly: inner.y,
      tx: tip.x,
      ty: tip.y,
    };
  }

  return null;
}

function SegmentPopover({ data, anchor, pinned, onClose }) {
  if (!data || !anchor) return null;
  const quad = quadFromMid(anchor.mid);
  return (
    <div
      className={`pf-sun-popover pf-sun-popover--${quad}${pinned ? ' is-pinned' : ''}`}
      role={pinned ? 'dialog' : 'tooltip'}
      aria-live="polite"
      style={{
        left: `${anchor.xPct}%`,
        top: `${anchor.yPct}%`,
        '--pop-color': data.color,
      }}
    >
      {pinned ? (
        <button type="button" className="pf-sun-popover-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      ) : null}
      <span className="pf-sun-popover-val" style={{ color: data.color }}>
        {data.primary}
      </span>
      <span className="pf-sun-popover-title">{data.title}</span>
      <span className="pf-faint pf-sun-popover-sub">{data.secondary}</span>
      <span className="pf-faint pf-sun-popover-kicker">{data.kicker}</span>
    </div>
  );
}

export function ConsumerMediumSunburst({ mix }) {
  const [drillId, setDrillId] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const [subFocus, setSubFocus] = useState(null);

  const main = useMemo(() => buildMainSegments(mix.mediums), [mix.mediums]);
  const drilled = drillId ? mix.mediums.find((m) => m.id === drillId) : null;
  const activeMain = drillId ? main.find((s) => s.medium.id === drillId) : null;
  const exploded = useMemo(
    () =>
      drilled && activeMain
        ? buildExplodedSegments(drilled, activeMain.startAngle, activeMain.endAngle)
        : [],
    [drilled, activeMain],
  );

  const focusSub =
    subFocus && drilled
      ? drilled.drill.subMix.find((s) => s.label === subFocus)
      : null;

  const maxJoin = Math.max(...mix.mediums.map((m) => m.joinSharePct), 1);

  const pinnedKey =
    subFocus && drillId ? `${drillId}-${subFocus}` : drillId ?? null;
  const showKey = hoverKey ?? pinnedKey;
  const isPinned = Boolean(pinnedKey && (!hoverKey || hoverKey === pinnedKey));

  const popup = useMemo(
    () => (showKey ? popupFromKey(mix, showKey) : null),
    [mix, showKey],
  );

  const anchor = useMemo(
    () => (showKey ? anchorForKey(showKey, main, exploded) : null),
    [showKey, main, exploded],
  );

  const drillTo = (id) => {
    setSubFocus(null);
    setDrillId((prev) => (prev === id ? null : id));
  };

  const clearDrill = () => {
    setDrillId(null);
    setSubFocus(null);
    setHoverKey(null);
  };

  const onChartLeave = () => setHoverKey(null);

  return (
    <div className={`pf-medium-donut pf-medium-sunburst${drillId ? ' is-drilled' : ''}`}>
      <div className="pf-medium-donut-layout">
        <div className="pf-medium-donut-chart-col">
          <div className="pf-medium-donut-chart-wrap" onMouseLeave={onChartLeave}>
            <svg viewBox="0 0 240 240" className="pf-medium-donut-svg" role="application">
              <defs>
                {mix.mediums.map((m) => (
                  <linearGradient
                    key={m.id}
                    id={`pf-med-grad-${m.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={m.color} />
                    <stop offset="100%" stopColor={shadeHex(m.color, 0.18)} />
                  </linearGradient>
                ))}
              </defs>

              <circle cx={CX} cy={CY} r={R_HOLE} className="pf-donut-hole" />

              <g className="pf-sun-main-ring">
                {main.map((seg) => {
                  const active = drillId === seg.medium.id;
                  const hot = hoverKey === seg.key;
                  const muted = drillId && !active;
                  const r1 = active && drillId ? R_MAIN_OUT + 2 : R_MAIN_OUT;
                  return (
                    <g key={seg.key}>
                      <SunburstSegment
                        cx={CX}
                        cy={CY}
                        r0={R_MAIN_IN}
                        r1={r1}
                        startAngle={seg.startAngle}
                        endAngle={seg.endAngle}
                        fill={`url(#pf-med-grad-${seg.medium.id})`}
                        active={active || hot}
                        muted={muted}
                        className="pf-sun-main-seg"
                        onMouseEnter={() => setHoverKey(seg.key)}
                        onMouseLeave={() => setHoverKey(null)}
                        onClick={() => drillTo(seg.medium.id)}
                        ariaLabel={`${seg.medium.label} ${seg.pct}%`}
                      />
                      <SlicePctLabel
                        a0={seg.startAngle}
                        a1={seg.endAngle}
                        r0={R_MAIN_IN}
                        r1={r1}
                        pct={seg.pct}
                        className={muted ? 'is-muted' : ''}
                      />
                    </g>
                  );
                })}
              </g>

              {drilled && activeMain ? (
                <g key={drillId} className="pf-sun-explode-ring">
                  {exploded.map((seg) => {
                    const active = subFocus === seg.sub.label;
                    const hot = hoverKey === seg.key;
                    return (
                      <g key={seg.key} className="pf-sun-explode-seg-wrap">
                        <SunburstSegment
                          cx={CX}
                          cy={CY}
                          r0={R_SUB_IN}
                          r1={R_SUB_OUT}
                          startAngle={seg.startAngle}
                          endAngle={seg.endAngle}
                          fill={seg.fill}
                          active={active || hot}
                          muted={false}
                          className="pf-sun-explode-seg"
                          style={{ animationDelay: `${seg.index * 55}ms` }}
                          onMouseEnter={() => setHoverKey(seg.key)}
                          onMouseLeave={() => setHoverKey(null)}
                        onClick={() =>
                          setSubFocus(active ? null : seg.sub.label)
                        }
                        ariaLabel={`${seg.sub.label} ${seg.pct}%`}
                      />
                      <SlicePctLabel
                        a0={seg.startAngle}
                        a1={seg.endAngle}
                        r0={R_SUB_IN}
                        r1={R_SUB_OUT}
                        pct={seg.pct}
                      />
                      </g>
                    );
                  })}
                </g>
              ) : null}
            </svg>

            {anchor && popup ? (
              <svg
                viewBox="0 0 240 240"
                className="pf-sun-popover-leader"
                aria-hidden
              >
                <line
                  x1={anchor.lx}
                  y1={anchor.ly}
                  x2={anchor.tx}
                  y2={anchor.ty}
                  className="pf-sun-popover-leader-line"
                  style={{ stroke: popup.color }}
                />
              </svg>
            ) : null}

            <SegmentPopover
              key={showKey}
              data={popup}
              anchor={anchor}
              pinned={isPinned}
              onClose={() => {
                if (subFocus) setSubFocus(null);
                else clearDrill();
              }}
            />
          </div>

        </div>

        <div className="pf-medium-donut-rail">
          <div className="pf-medium-donut-rail-head">
            <span className="pf-medium-donut-rail-title">Channels</span>
            <span className="pf-faint">join · net</span>
          </div>

          <ul className="pf-medium-donut-channel-list">
            {mix.mediums.map((m) => {
              const active = drillId === m.id;
              const hot = hoverKey === m.id || hoverKey?.startsWith(`${m.id}-`);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`pf-medium-donut-channel${active ? ' is-active' : ''}${hot ? ' is-hot' : ''}`}
                    onClick={() => drillTo(m.id)}
                    onMouseEnter={() => setHoverKey(m.id)}
                    onMouseLeave={() => setHoverKey(null)}
                  >
                    <span className="pf-medium-donut-channel-top">
                      <span className="pf-medium-donut-channel-swatch" style={{ background: m.color }} aria-hidden />
                      <span className="pf-medium-donut-channel-name">{m.shortLabel}</span>
                      <span className="pf-medium-donut-channel-pct" style={{ color: m.color }}>
                        {m.joinSharePct}%
                      </span>
                    </span>
                    <span className="pf-medium-donut-channel-bar">
                      <span
                        className="pf-medium-donut-channel-fill"
                        style={{ width: `${(m.joinSharePct / maxJoin) * 100}%`, background: m.color }}
                      />
                    </span>
                    <span className="pf-faint pf-medium-donut-channel-rev">₹{m.revenueCr.toFixed(1)}Cr net</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
