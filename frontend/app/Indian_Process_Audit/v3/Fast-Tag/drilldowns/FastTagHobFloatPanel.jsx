'use client';

import React, { useState } from 'react';

function FloatPoolStrip({ segments }) {
  const total = segments.reduce((s, x) => s + x.pct, 0) || 1;
  return (
    <div className="pf-hob-float-strip" role="img" aria-label="Wallet float composition">
      {segments.map((seg) => {
        const w = (seg.pct / total) * 100;
        return (
          <div
            key={seg.id}
            className="pf-hob-float-seg"
            style={{ width: `${w}%`, background: seg.color }}
            title={`${seg.label}: ₹${seg.cr}Cr (${seg.pct}%)`}
          >
            {w >= 14 ? <span>{seg.pct}%</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function UnitEconBar({ rev, cost, max }) {
  const scale = max || 1;
  const revW = (rev / scale) * 100;
  const costW = (cost / scale) * 100;
  return (
    <div className="pf-hob-unit-bars" aria-label={`Revenue ₹${rev} vs cost ₹${cost} per tag per month`}>
      <div className="pf-hob-unit-row">
        <span className="pf-hob-unit-label">Rev / tag</span>
        <div className="pf-hob-unit-track">
          <div className="pf-hob-unit-fill pf-hob-unit-fill--rev" style={{ width: `${revW}%` }} />
        </div>
        <span className="pf-hob-unit-val pf-hob-unit-val--rev">₹{rev}</span>
      </div>
      <div className="pf-hob-unit-row">
        <span className="pf-hob-unit-label">Cost / tag</span>
        <div className="pf-hob-unit-track">
          <div className="pf-hob-unit-fill pf-hob-unit-fill--cost" style={{ width: `${costW}%` }} />
        </div>
        <span className="pf-hob-unit-val">₹{cost}</span>
      </div>
      <div className="pf-hob-unit-margin">
        <span className="pf-hob-unit-margin-label">Margin / tag</span>
        <strong className="pf-hob-unit-margin-val">₹{rev - cost}</strong>
        <span className="pf-faint">/ month</span>
      </div>
    </div>
  );
}

function RechargeGauge({ pct, target }) {
  const ok = pct >= target;
  return (
    <div className="pf-hob-recharge">
      <div className="pf-hob-recharge-head">
        <span className="pf-hob-recharge-label">Recharge → toll</span>
        <span className={`pf-hob-recharge-pct${ok ? ' is-ok' : ' is-warn'}`}>{pct}%</span>
      </div>
      <div className="pf-hob-recharge-track">
        <div
          className={`pf-hob-recharge-fill${ok ? ' is-ok' : ' is-warn'}`}
          style={{ width: `${Math.min(100, (pct / 100) * 100)}%` }}
        />
        <span
          className="pf-hob-recharge-target"
          style={{ left: `${target}%` }}
          title={`Target ${target}%`}
        />
      </div>
      <span className="pf-faint pf-hob-recharge-hint">Target {target}% · wallet health driver</span>
    </div>
  );
}

/** HoB panel: wallet float pool, unit economics, and priority actions. */
export function FastTagHobFloatPanel({ data }) {
  const [focusId, setFocusId] = useState(null);
  const focus = data.actions.find((a) => a.id === focusId);
  const maxUnit = Math.max(data.revPerTag, data.costPerTag, 1) * 1.15;

  return (
    <div className="pf-hob-float">
      <div className="pf-hob-float-stage">
        <div className="pf-hob-kpi-row">
          <div className="pf-hob-kpi">
            <span className="pf-hob-kpi-label">Wallet float</span>
            <span className="pf-hob-kpi-val">₹{data.walletFloatCr}Cr</span>
            <span className="pf-faint">{data.floatYieldPct}% yield · {data.floatYieldMom}</span>
          </div>
          <div className="pf-hob-kpi">
            <span className="pf-hob-kpi-label">Take-rate</span>
            <span className="pf-hob-kpi-val">{data.takeRateNote}</span>
            <span className="pf-faint">{data.takeRateBps} bps on toll GTV</span>
          </div>
          <div className="pf-hob-kpi">
            <span className="pf-hob-kpi-label">Rev / tag</span>
            <span className="pf-hob-kpi-val">₹{data.revPerTag}</span>
            <span className="pf-faint">{data.revPerTagMom}</span>
          </div>
          <div className="pf-hob-kpi">
            <span className="pf-hob-kpi-label">Idle float</span>
            <span className="pf-hob-kpi-val pf-hob-kpi-val--warn">₹{data.idleFloatCr}Cr</span>
            <span className="pf-faint">{data.dormantPct}% dormant tags</span>
          </div>
        </div>

        <div className="pf-hob-float-pool">
          <div className="pf-label">Float pool composition</div>
          <FloatPoolStrip segments={data.floatComposition} />
          <ul className="pf-hob-float-legend">
            {data.floatComposition.map((seg) => (
              <li key={seg.id}>
                <span className="pf-hob-swatch" style={{ background: seg.color }} aria-hidden />
                <span>{seg.label}</span>
                <span className="pf-faint">₹{seg.cr}Cr</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pf-hob-split">
          <UnitEconBar rev={data.revPerTag} cost={data.costPerTag} max={maxUnit} />
          <RechargeGauge pct={data.rechargeToTollPct} target={data.rechargeTargetPct} />
        </div>

        <div className="pf-hob-actions">
          <div className="pf-label">HoB priorities this period</div>
          <ul className="pf-hob-action-list">
            {data.actions.map((action) => {
              const active = focusId === action.id;
              return (
                <li key={action.id}>
                  <button
                    type="button"
                    className={`pf-hob-action${active ? ' is-active' : ''} pf-hob-action--${action.priority}`}
                    onClick={() => setFocusId(active ? null : action.id)}
                    aria-pressed={active}
                  >
                    <span className={`pf-hob-action-pri pf-hob-action-pri--${action.priority}`}>
                      {action.priority === 'high' ? 'High' : 'Med'}
                    </span>
                    <span className="pf-hob-action-title">{action.title}</span>
                    <span className="pf-hob-action-metric">{action.metric}</span>
                    <span className="pf-hob-action-impact">{action.impactLabel}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {focus ? (
          <div className={`pf-hob-action-detail pf-hob-action-detail--${focus.priority}`}>
            <span className="pf-hob-action-detail-title">{focus.title}</span>
            <p className="pf-faint pf-hob-action-detail-text">{focus.detail}</p>
            <span className="pf-faint">
              Owner: {focus.owner} · {focus.impactLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
