'use client';

import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const HOP_COLORS = {
  plaza: '#059669',
  netc: '#0891b2',
  acquirer: '#d97706',
  issuer: '#6366f1',
};

function normalizeSlices(rows, valueKey = 'value') {
  const sum = rows.reduce((s, r) => s + r[valueKey], 0) || 1;
  return rows.map((r) => ({
    ...r,
    value: Math.round((r[valueKey] / sum) * 1000) / 10,
  }));
}

function LedgerSimplePie({ slices }) {
  return (
    <div className="pf-hob-ledger-pie-chart">
      <ResponsiveContainer width="100%" height={120}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="92%"
            paddingAngle={1}
            stroke="#fff"
            strokeWidth={1}
            isAnimationActive={false}
          >
            {slices.map((row) => (
              <Cell key={row.id} fill={row.color} stroke="#fff" strokeWidth={1} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 6, padding: '5px 9px' }}
            formatter={(v, name) => [`${v}%`, String(name ?? '')]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function LedgerPieCard({ title, slices, amountKey }) {
  return (
    <div className="pf-hob-ledger-pie-card">
      <span className="pf-label pf-hob-ledger-pie-title">{title}</span>
      <LedgerSimplePie slices={slices} />
      <ul className="pf-cash-legend pf-hob-ledger-pie-legend">
        {slices.map((row) => (
          <li key={row.id} className="pf-cash-legend-item">
            <span className="pf-cash-swatch" style={{ background: row.color }} aria-hidden />
            <span className="pf-cash-legend-label">{row.name}</span>
            <span className="pf-hob-ledger-pie-pct" style={{ color: row.color }}>
              {row.value}%
            </span>
            <span className="pf-cash-legend-val">₹{row[amountKey]}Cr</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** HoB ledger section — parallel pies: toll flow by ledger & closing entries. */
export function FastTagHobSettlementPanel({ data }) {
  const hopSlices = useMemo(
    () =>
      normalizeSlices(
        data.hops.map((h) => ({
          id: h.id,
          name: h.shortLabel,
          value: h.postedCr,
          color: HOP_COLORS[h.id] ?? '#64748b',
          postedCr: h.postedCr,
        })),
      ),
    [data.hops],
  );

  const closeSlices = useMemo(
    () =>
      data.exceptions.map((e) => ({
        id: e.id,
        name: e.label,
        value: e.sharePct,
        color: e.color,
        amountCr: e.amountCr,
      })),
    [data.exceptions],
  );

  return (
    <div className="pf-hob-ledger">
      <div className="pf-hob-ledger-stage">
        <div className="pf-hob-ledger-pair">
          <LedgerPieCard title="Toll book flow across ledgers" slices={hopSlices} amountKey="postedCr" />
          <LedgerPieCard title="Closing entries" slices={closeSlices} amountKey="amountCr" />
        </div>
      </div>
    </div>
  );
}
