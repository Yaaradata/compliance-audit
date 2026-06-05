'use client';

import React, { useMemo, useState } from 'react';

const W = 400;
const H = 200;
const PAD = 3;

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

function revDelta(joinPct, revPct) {
  const d = revPct - joinPct;
  if (d === 0) return { text: 'Aligned', tone: 'flat' };
  if (d > 0) return { text: `+${d} pts`, tone: 'up' };
  return { text: `${d} pts`, tone: 'down' };
}

/** Horizontal slice treemap for a small set of weighted items. */
function layoutRow(items, x, y, w, h, weight, gap = PAD) {
  if (!items.length) return [];
  const total = items.reduce((s, it) => s + weight(it), 0) || 1;
  const rects = [];
  let cursor = x;
  items.forEach((item, idx) => {
    const isLast = idx === items.length - 1;
    const share = weight(item) / total;
    const rawW = isLast ? x + w - cursor : w * share;
    const cellW = Math.max(isLast ? rawW : rawW - gap / 2, 28);
    rects.push({
      item,
      x: cursor,
      y,
      w: cellW,
      h,
    });
    cursor += cellW + (isLast ? 0 : gap / 2);
  });
  return rects;
}

function TreemapCell({
  rect,
  label,
  sublabel,
  fill,
  active,
  hot,
  muted,
  onClick,
  onEnter,
  onLeave,
  ariaLabel,
}) {
  const { x, y, w, h } = rect;
  const compact = w < 72 || h < 52;
  const tiny = w < 48;

  return (
    <g
      className={`pf-medium-tm-cell${active ? ' is-active' : ''}${hot ? ' is-hot' : ''}${muted ? ' is-muted' : ''}`}
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
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        ry={6}
        fill={fill}
        className="pf-medium-tm-cell-bg"
      />
      {!tiny ? (
        <>
          <text
            x={x + w / 2}
            y={y + (compact ? 14 : 18)}
            textAnchor="middle"
            className="pf-medium-tm-label"
          >
            {compact && label.length > 10 ? `${label.slice(0, 8)}…` : label}
          </text>
          {!compact && sublabel ? (
            <text x={x + w / 2} y={y + 32} textAnchor="middle" className="pf-medium-tm-sublabel">
              {sublabel}
            </text>
          ) : null}
        </>
      ) : null}
    </g>
  );
}

function HoverCard({ tip, onClose }) {
  if (!tip) return null;
  return (
    <div
      className="pf-medium-tm-tip"
      style={{
        left: `${(tip.x / W) * 100}%`,
        top: `${(tip.y / H) * 100}%`,
        '--tip-color': tip.color,
      }}
      role="tooltip"
    >
      <span className="pf-medium-tm-tip-val" style={{ color: tip.color }}>
        {tip.primary}
      </span>
      <span className="pf-medium-tm-tip-title">{tip.title}</span>
      <span className="pf-faint pf-medium-tm-tip-sub">{tip.secondary}</span>
      {tip.pinned ? (
        <button type="button" className="pf-medium-tm-tip-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      ) : null}
    </div>
  );
}

/** Area-sized tiles — click a channel to zoom into its sub-mix. */
export function ConsumerMediumTreemap({ mix }) {
  const [drillId, setDrillId] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const [pinnedKey, setPinnedKey] = useState(null);

  const drilled = drillId ? mix.mediums.find((m) => m.id === drillId) : null;

  const rootRects = useMemo(
    () =>
      layoutRow(
        mix.mediums,
        PAD,
        PAD,
        W - PAD * 2,
        H - PAD * 2,
        (m) => m.joinSharePct,
      ),
    [mix.mediums],
  );

  const subRects = useMemo(() => {
    if (!drilled) return [];
    return layoutRow(
      drilled.drill.subMix.map((sub, si) => ({ sub, si })),
      PAD,
      PAD,
      W - PAD * 2,
      H - PAD * 2,
      (row) => row.sub.pct,
    );
  }, [drilled]);

  const showKey = hoverKey ?? (pinnedKey || (drillId ? drillId : null));

  const tip = useMemo(() => {
    if (!showKey) return null;
    const medium = mix.mediums.find((m) => showKey === m.id || showKey.startsWith(`${m.id}-`));
    if (!medium) return null;

    if (showKey.includes('-')) {
      const sub = medium.drill.subMix.find((s) => `${medium.id}-${s.label}` === showKey);
      if (!sub) return null;
      const joinTotal = ((medium.joinSharePct * sub.pct) / 100).toFixed(1);
      const rev = (medium.revenueCr * sub.pct) / 100;
      const rect = subRects.find((r) => r.item.sub.label === sub.label);
      return {
        title: sub.label,
        primary: `${sub.pct}%`,
        secondary: `${joinTotal}% joins · ₹${rev >= 1 ? rev.toFixed(1) : (rev * 10).toFixed(0)}Cr`,
        color: shadeHex(medium.color, 0.12 + (rect?.item.si ?? 0) * 0.18),
        x: rect ? rect.x + rect.w / 2 : W / 2,
        y: rect ? rect.y + rect.h / 2 : H / 2,
        pinned: pinnedKey === showKey,
      };
    }

    const rect = rootRects.find((r) => r.item.id === medium.id);
    const delta = revDelta(medium.joinSharePct, medium.revenueSharePct);
    return {
      title: medium.label,
      primary: `${medium.joinSharePct}%`,
      secondary: `${medium.revenueSharePct}% rev · ${delta.text} · ₹${medium.revenueCr.toFixed(1)}Cr`,
      color: medium.color,
      x: rect ? rect.x + rect.w / 2 : W / 2,
      y: rect ? rect.y + rect.h / 2 : H / 2,
      pinned: pinnedKey === showKey,
    };
  }, [showKey, mix.mediums, rootRects, subRects, pinnedKey]);

  const clear = () => {
    setDrillId(null);
    setHoverKey(null);
    setPinnedKey(null);
  };

  const drillTo = (id) => {
    setPinnedKey(null);
    setDrillId((prev) => (prev === id ? null : id));
  };

  const onCellClick = (key, isSub) => {
    if (isSub) {
      setPinnedKey((prev) => (prev === key ? null : key));
      return;
    }
    const id = key;
    drillTo(id);
  };

  return (
    <div className={`pf-medium-tm${drillId ? ' is-drilled' : ''}`}>
      <div className="pf-medium-tm-stage">
        <div className="pf-medium-tm-head">
          <span className="pf-faint pf-medium-tm-legend">
            Tile area = join share · label shows join % & rev lift
          </span>
          {drilled ? (
            <button type="button" className="pf-medium-tm-back" onClick={clear}>
              ← All channels
            </button>
          ) : null}
        </div>

        <div className="pf-medium-tm-canvas">
          <svg viewBox={`0 0 ${W} ${H}`} className="pf-medium-tm-svg" role="application">
            {!drilled
              ? rootRects.map((rect) => {
                  const m = rect.item;
                  const key = m.id;
                  const delta = revDelta(m.joinSharePct, m.revenueSharePct);
                  const active = drillId === key;
                  const hot = hoverKey === key;
                  const muted = drillId && !active;
                  return (
                    <TreemapCell
                      key={key}
                      rect={rect}
                      label={m.shortLabel}
                      sublabel={`${m.joinSharePct}% join · ${delta.text} rev`}
                      fill={m.color}
                      active={active || hot}
                      hot={hot}
                      muted={muted}
                      onClick={() => onCellClick(key, false)}
                      onEnter={() => setHoverKey(key)}
                      onLeave={() => setHoverKey(null)}
                      ariaLabel={`${m.label} ${m.joinSharePct}% join`}
                    />
                  );
                })
              : subRects.map((rect) => {
                  const { sub, si } = rect.item;
                  const key = `${drilled.id}-${sub.label}`;
                  const fill = shadeHex(drilled.color, 0.08 + si * 0.2);
                  const joinTotal = ((drilled.joinSharePct * sub.pct) / 100).toFixed(1);
                  const active = pinnedKey === key || hoverKey === key;
                  return (
                    <TreemapCell
                      key={key}
                      rect={rect}
                      label={sub.label}
                      sublabel={`${sub.pct}% · ${joinTotal}% total`}
                      fill={fill}
                      active={active}
                      hot={hoverKey === key}
                      muted={false}
                      onClick={() => onCellClick(key, true)}
                      onEnter={() => setHoverKey(key)}
                      onLeave={() => setHoverKey(null)}
                      ariaLabel={`${sub.label} ${sub.pct}% of ${drilled.shortLabel}`}
                    />
                  );
                })}
          </svg>
          <HoverCard
            tip={tip}
            onClose={() => {
              setPinnedKey(null);
              if (drillId && pinnedKey?.startsWith(drillId)) return;
              clear();
            }}
          />
        </div>

        <div className="pf-medium-tm-foot">
          <span className="pf-faint">
            {mix.totalNewTagsLabel} tags · ₹{mix.totalConsumerRevenueCr.toFixed(1)}Cr net
          </span>
          <span className="pf-faint">
            {drilled ? `Inside ${drilled.shortLabel}` : 'Click a tile to zoom in'}
          </span>
        </div>
      </div>
    </div>
  );
}
