'use client';

import React, { useMemo, useState } from 'react';

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

function scalePct(pct, maxScale) {
  return Math.max(4, (pct / maxScale) * 100);
}

function revDeltaLabel(joinPct, revPct) {
  const d = revPct - joinPct;
  if (d === 0) return { text: 'Aligned', tone: 'flat' };
  if (d > 0) return { text: `+${d} pts rev`, tone: 'up' };
  return { text: `${d} pts rev`, tone: 'down' };
}

function ButterflyBar({ pct, color, side, scale }) {
  const w = scalePct(pct, scale);
  return (
    <div className={`pf-medium-bf-bar pf-medium-bf-bar--${side}`}>
      <div className="pf-medium-bf-track">
        <div
          className="pf-medium-bf-fill"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
      <span className="pf-medium-bf-pct" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function MediumRow({
  medium,
  scale,
  active,
  hot,
  muted,
  onSelect,
  onHover,
  onLeave,
}) {
  const delta = revDeltaLabel(medium.joinSharePct, medium.revenueSharePct);

  return (
    <button
      type="button"
      className={`pf-medium-bf-row${active ? ' is-active' : ''}${hot ? ' is-hot' : ''}${muted ? ' is-muted' : ''}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-pressed={active}
    >
      <ButterflyBar
        pct={medium.joinSharePct}
        color={medium.color}
        side="join"
        scale={scale}
      />
      <div className="pf-medium-bf-mid">
        <span className="pf-medium-bf-swatch" style={{ background: medium.color }} aria-hidden />
        <span className="pf-medium-bf-name">{medium.shortLabel}</span>
        <span className={`pf-medium-bf-delta pf-medium-bf-delta--${delta.tone}`}>{delta.text}</span>
      </div>
      <ButterflyBar
        pct={medium.revenueSharePct}
        color={medium.color}
        side="rev"
        scale={scale}
      />
    </button>
  );
}

function SubRow({ medium, sub, si, active, onSelect, onHover, onLeave, scale }) {
  const joinTotal = ((medium.joinSharePct * sub.pct) / 100).toFixed(1);
  const revTotal = ((medium.revenueSharePct * sub.pct) / 100).toFixed(1);
  const fill = shadeHex(medium.color, 0.08 + si * 0.18);

  return (
    <button
      type="button"
      className={`pf-medium-bf-sub${active ? ' is-active' : ''}`}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-pressed={active}
    >
      <ButterflyBar pct={Number(joinTotal)} color={fill} side="join" scale={scale} />
      <div className="pf-medium-bf-mid pf-medium-bf-mid--sub">
        <span className="pf-medium-bf-swatch pf-medium-bf-swatch--sm" style={{ background: fill }} aria-hidden />
        <span className="pf-medium-bf-name">{sub.label}</span>
        <span className="pf-faint">{sub.pct}% of {medium.shortLabel}</span>
      </div>
      <ButterflyBar pct={Number(revTotal)} color={fill} side="rev" scale={scale} />
    </button>
  );
}

function DetailStrip({ medium, subFocus, onClose }) {
  if (!medium) return null;
  const sub = subFocus ? medium.drill.subMix.find((s) => s.label === subFocus) : null;
  const shareOfTotal = sub
    ? ((medium.joinSharePct * sub.pct) / 100).toFixed(1)
    : null;

  return (
    <div className="pf-medium-bf-detail" style={{ borderColor: `${medium.color}44` }}>
      <div className="pf-medium-bf-detail-head">
        <span className="pf-medium-bf-swatch" style={{ background: medium.color }} aria-hidden />
        <div className="pf-medium-bf-detail-copy">
          <span className="pf-medium-bf-detail-title" style={{ color: medium.color }}>
            {sub ? sub.label : medium.label}
          </span>
          <span className="pf-faint pf-medium-bf-detail-sub">
            {sub
              ? `${sub.pct}% within ${medium.shortLabel} · ${shareOfTotal}% of total joins`
              : `${medium.joinSharePct}% join · ${medium.revenueSharePct}% net · ₹${medium.revenueCr.toFixed(1)}Cr`}
          </span>
        </div>
        <span
          className="pf-badge pf-medium-bf-detail-badge"
          style={{
            color: medium.color,
            background: `${medium.color}14`,
            border: `1px solid ${medium.color}55`,
          }}
        >
          {medium.mom} MoM · {medium.yoy} YoY
        </span>
        <button type="button" className="pf-medium-bf-detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <ul className="pf-medium-bf-detail-points">
        {(sub ? [medium.joinDetail] : medium.drill.joinPoints.slice(0, 2)).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

/** Join vs revenue butterfly bars — click a channel for sub-mix. */
export function ConsumerMediumButterfly({ mix }) {
  const [drillId, setDrillId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [subFocus, setSubFocus] = useState(null);

  const scale = useMemo(() => {
    const vals = mix.mediums.flatMap((m) => [m.joinSharePct, m.revenueSharePct]);
    return Math.max(...vals, 1);
  }, [mix.mediums]);

  const drilled = drillId ? mix.mediums.find((m) => m.id === drillId) : null;
  const focusSub =
    subFocus && drilled ? drilled.drill.subMix.find((s) => s.label === subFocus) : null;

  const showDetail = Boolean(drillId);

  const drillTo = (id) => {
    setSubFocus(null);
    setDrillId((prev) => (prev === id ? null : id));
  };

  const clearDrill = () => {
    setDrillId(null);
    setSubFocus(null);
    setHoverId(null);
  };

  return (
    <div className={`pf-medium-bf${drillId ? ' is-drilled' : ''}`}>
      <div className="pf-medium-bf-stage">
        <div className="pf-medium-bf-axis" aria-hidden>
          <span className="pf-medium-bf-axis-l">Where consumers join</span>
          <span className="pf-medium-bf-axis-c">Channel</span>
          <span className="pf-medium-bf-axis-r">Business contribution</span>
        </div>

        <ul className="pf-medium-bf-list">
          {mix.mediums.map((m) => {
            const active = drillId === m.id;
            const hot = hoverId === m.id;
            const muted = drillId && !active;

            return (
              <li key={m.id} className={active ? 'is-expanded' : ''}>
                <MediumRow
                  medium={m}
                  scale={scale}
                  active={active}
                  hot={hot}
                  muted={muted}
                  onSelect={() => drillTo(m.id)}
                  onHover={() => setHoverId(m.id)}
                  onLeave={() => setHoverId(null)}
                />

                {active ? (
                  <ul className="pf-medium-bf-subs">
                    {m.drill.subMix.map((sub, si) => {
                      const subActive = subFocus === sub.label;
                      return (
                        <li key={sub.label}>
                          <SubRow
                            medium={m}
                            sub={sub}
                            si={si}
                            scale={scale}
                            active={subActive}
                            onSelect={() => setSubFocus(subActive ? null : sub.label)}
                            onHover={() => setHoverId(`${m.id}-${sub.label}`)}
                            onLeave={() => setHoverId(null)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="pf-medium-bf-foot">
          <span className="pf-faint">
            {mix.totalNewTagsLabel} new tags · ₹{mix.totalConsumerRevenueCr.toFixed(1)}Cr consumer net
          </span>
          <span className="pf-faint">Click a row to open sub-channels</span>
        </div>
      </div>

      {showDetail && drilled ? (
        <DetailStrip medium={drilled} subFocus={focusSub?.label ?? null} onClose={clearDrill} />
      ) : null}
    </div>
  );
}
