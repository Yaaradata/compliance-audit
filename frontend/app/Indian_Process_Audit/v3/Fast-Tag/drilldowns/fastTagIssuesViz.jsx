'use client';

import { useMemo } from 'react';
import IssuesComplaintIndiaMap from './IssuesComplaintIndiaMap';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const TIP = {
  contentStyle: { fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' },
  itemStyle: { fontSize: 11, color: '#475569' },
};

function SevBadge({ prefix, severity }) {
  return <span className={`${prefix}-iq-sev ${prefix}-iq-sev--${severity}`}>{severity}</span>;
}

export function IssuesCxDirectionLegend({ prefix }) {
  return (
    <div className={`${prefix}-iq-legend`} aria-label="Chart legend">
      <span className={`${prefix}-iq-legend-item`}>
        <span className={`${prefix}-iq-legend-dot`} style={{ background: '#dc2626' }} aria-hidden />
        Customer CX
      </span>
      <span className={`${prefix}-iq-legend-item`}>
        <span
          className={`${prefix}-iq-legend-line`}
          style={{ borderColor: '#7c3aed' }}
          aria-hidden
        />
        Partner CX
      </span>
    </div>
  );
}

/** Q1 — CX direction: dual score trend vs target */
export function IssuesCxDirectionViz({ prefix, data }) {
  const chartData = useMemo(() => data.trend ?? [], [data.trend]);

  return (
    <div className={`${prefix}-iq`}>
      <div className={`${prefix}-iq-chart`}>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis domain={[45, 85]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip {...TIP} formatter={(v, name) => [`${v}%`, name === 'customer' ? 'Customer CX' : 'Partner CX']} />
            <ReferenceLine y={data.target} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `Target ${data.target}%`, position: 'insideTopRight', fontSize: 8, fill: '#94a3b8' }} />
            <Line type="monotone" dataKey="customer" name="Customer CX" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3, fill: '#dc2626', stroke: '#fff', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="partner" name="Partner CX" stroke="#7c3aed" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2.5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 1 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Q2 — India state map */
export function IssuesComplaintSpikeViz({ prefix, data }) {
  return (
    <div className={`${prefix}-iq`}>
      <IssuesComplaintIndiaMap
        prefix={prefix}
        states={data.stateComplaints ?? []}
        overall={data.overall}
      />
    </div>
  );
}

export function IssuesLossViewToggle({ prefix, view, onViewChange }) {
  return (
    <div className={`${prefix}-iq-loss-toggle`} role="tablist" aria-label="Loss view">
      <button
        type="button"
        role="tab"
        aria-selected={view === 'customers'}
        className={`${prefix}-iq-loss-toggle-btn${view === 'customers' ? ` ${prefix}-iq-loss-toggle-btn--active` : ''}`}
        onClick={() => onViewChange('customers')}
      >
        Customers
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'partners'}
        className={`${prefix}-iq-loss-toggle-btn${view === 'partners' ? ` ${prefix}-iq-loss-toggle-btn--active` : ''}`}
        onClick={() => onViewChange('partners')}
      >
        Partners
      </button>
    </div>
  );
}

const COMPLAINT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'breached', label: 'SLA breached' },
];

export function IssuesComplaintFilterToggle({ prefix, filter, onFilterChange }) {
  return (
    <div className={`${prefix}-iq-loss-toggle`} role="tablist" aria-label="Complaint filters">
      {COMPLAINT_FILTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={filter === item.id}
          className={`${prefix}-iq-loss-toggle-btn${filter === item.id ? ` ${prefix}-iq-loss-toggle-btn--active` : ''}`}
          onClick={() => onFilterChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/** Q3 — Customer segment & partner loss tables */
export function IssuesAttritionViz({ prefix, data, view = 'customers' }) {
  const isCustomers = view === 'customers';

  return (
    <div className={`${prefix}-iq`}>
      <div className={`${prefix}-viz-stage-table-wrap ${prefix}-iq-case-table-wrap`}>
        {isCustomers ? (
          <table className={`${prefix}-viz-stage-table ${prefix}-iq-loss-table`}>
            <thead>
              <tr>
                <th className={`${prefix}-th`}>Segment</th>
                <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>At risk</th>
                <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Churned</th>
                <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Spend at risk</th>
                <th className={`${prefix}-th`}>Driver</th>
                <th className={`${prefix}-th`}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map((row) => (
                <tr
                  key={row.segment}
                  className={row.severity === 'Critical' ? `${prefix}-iq-case-row--hot` : undefined}
                >
                  <td className={`${prefix}-td`}>
                    <span className={`${prefix}-viz-stage-tbl-stage-name`}>{row.segment}</span>
                  </td>
                  <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`} style={{ fontWeight: 700, color: '#dc2626' }}>
                    {row.atRisk}
                  </td>
                  <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>{row.churned30d}</td>
                  <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`} style={{ fontWeight: 700, color: '#dc2626' }}>
                    {row.spendAtRisk}
                  </td>
                  <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-detail`}>{row.driver}</td>
                  <td className={`${prefix}-td`}>
                    <SevBadge prefix={prefix} severity={row.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={`${prefix}-viz-stage-table ${prefix}-iq-loss-table`}>
            <thead>
              <tr>
                <th className={`${prefix}-th`}>Partner</th>
                <th className={`${prefix}-th`}>Role</th>
                <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Cases</th>
                <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Health</th>
                <th className={`${prefix}-th`}>Attrition signal</th>
                <th className={`${prefix}-th`}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {data.partners.map((row) => (
                <tr
                  key={row.partner}
                  className={row.severity === 'Critical' ? `${prefix}-iq-case-row--hot` : undefined}
                >
                  <td className={`${prefix}-td`}>
                    <span className={`${prefix}-viz-stage-tbl-stage-name`}>{row.partner}</span>
                  </td>
                  <td className={`${prefix}-td`}>{row.role}</td>
                  <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`} style={{ fontWeight: 700, color: '#dc2626' }}>
                    {row.cases}
                  </td>
                  <td
                    className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}
                    style={{ fontWeight: 700, color: row.health < 65 ? '#dc2626' : row.health < 80 ? '#d97706' : '#059669' }}
                  >
                    {row.health}%
                  </td>
                  <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-detail`} style={{ color: '#92400e', fontWeight: 600 }}>
                    {row.signal}
                  </td>
                  <td className={`${prefix}-td`}>
                    <SevBadge prefix={prefix} severity={row.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const RATING_BANDS = [
  { id: 'high', label: 'High', hint: '4–5★' },
  { id: 'med', label: 'Med', hint: '3★' },
  { id: 'low', label: 'Low', hint: '1–2★' },
];

const RATING_BAND_META = {
  high: { pctClass: 'high', sub: (row) => `4–5★ satisfied · ${row.responses} responses` },
  med: { pctClass: 'med', sub: (row) => `3★ neutral · ${row.responses} responses` },
  low: { pctClass: 'low', sub: (row) => `${row.oneStarPct}% 1★ · ${row.responses} responses` },
};

export function IssuesRatingBandToggle({ prefix, band, onBandChange }) {
  return (
    <div className={`${prefix}-iq-rating-band-toggle`} role="tablist" aria-label="Rating band filters">
      {RATING_BANDS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={band === item.id}
          title={`${item.label} ratings (${item.hint})`}
          className={`${prefix}-iq-rating-band-btn ${prefix}-iq-rating-band-btn--${item.id}${band === item.id ? ` ${prefix}-iq-rating-band-btn--active` : ''}`}
          onClick={() => onBandChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function segmentBandPct(row, band) {
  if (band === 'high') return row.highPct;
  if (band === 'med') return row.medPct;
  return row.lowPct;
}

/** Q5 — Star-rating donut + segment ratings by band */
export function IssuesLowRatingViz({ prefix, data, band = 'low' }) {
  const bandMeta = RATING_BAND_META[band] ?? RATING_BAND_META.low;
  const pieData = useMemo(
    () =>
      data.distribution.map((slice) => ({
        name: `${slice.stars}★`,
        value: slice.pct,
        color: slice.color,
        stars: slice.stars,
      })),
    [data.distribution],
  );
  const segmentBars = useMemo(
    () =>
      [...data.segments]
        .sort((a, b) => segmentBandPct(b, band) - segmentBandPct(a, band))
        .map((row) => ({
          ...row,
          shortName: row.segment.replace(' (TSP)', '').replace(' (high GTV)', ''),
          bandPct: segmentBandPct(row, band),
          bandDriver: row.drivers[band],
        })),
    [data.segments, band],
  );
  return (
    <div className={`${prefix}-iq ${prefix}-iq-rating-split`}>
        <div
          className={`${prefix}-iq-rating-donut-wrap`}
          role="img"
          aria-label={`${data.lowPct}% of users rated 1 to 2 stars`}
        >
          <div className={`${prefix}-viz-donut-ring ${prefix}-iq-rating-donut-ring`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="54%"
                  outerRadius="88%"
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((slice) => (
                    <Cell key={slice.stars} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  {...TIP}
                  formatter={(v, name) => [`${v}%`, String(name ?? '')]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={`${prefix}-viz-donut-hole`}>
              <span className={`${prefix}-iq-rating-donut-label`}>Rating</span>
            </div>
          </div>
        </div>

        <div className={`${prefix}-iq-rating-bars`}>
          <p className={`${prefix}-iq-rating-bars-label`}>Ratings by segment</p>
          <div className={`${prefix}-iq-rating-seg-rows`}>
            {segmentBars.map((row) => (
              <div
                key={row.segment}
                className={`${prefix}-iq-rating-seg-row ${prefix}-iq-rating-seg-row--${band}`}
                title={row.segment}
              >
                <div className={`${prefix}-iq-rating-seg-meta`}>
                  <div className={`${prefix}-iq-rating-seg-name-row`}>
                    <span className={`${prefix}-iq-rating-seg-name`}>{row.shortName}</span>
                    <span className={`${prefix}-iq-rating-seg-sub`}>{bandMeta.sub(row)}</span>
                  </div>
                  <span className={`${prefix}-iq-rating-seg-driver`}>{row.bandDriver}</span>
                </div>
                <span className={`${prefix}-iq-rating-seg-pct ${prefix}-iq-rating-seg-pct--${bandMeta.pctClass}`}>
                  {row.bandPct}%
                </span>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}

function complaintStatusClass(status) {
  if (status === 'Resolved') return 'resolved';
  if (status === 'Escalated') return 'escalated';
  if (status === 'In progress') return 'progress';
  return 'open';
}

function complaintSlaClass(sla) {
  if (sla === 'Breached') return 'breached';
  if (sla === 'At risk') return 'risk';
  return 'ok';
}

function StatusChip({ prefix, status }) {
  return (
    <span className={`${prefix}-iq-case-chip ${prefix}-iq-case-chip--${complaintStatusClass(status)}`}>
      {status}
    </span>
  );
}

function SlaChip({ prefix, sla }) {
  return (
    <span className={`${prefix}-iq-case-chip ${prefix}-iq-case-chip--sla-${complaintSlaClass(sla)}`}>
      {sla}
    </span>
  );
}

function filterComplaints(rows, filterId) {
  if (filterId === 'open') return rows.filter((row) => row.status !== 'Resolved');
  if (filterId === 'resolved') return rows.filter((row) => row.status === 'Resolved');
  if (filterId === 'breached') return rows.filter((row) => row.sla === 'Breached');
  return rows;
}

/** Q4 — Complaint case table with resolution status */
export function IssuesResolutionThroughputViz({ prefix, data, filter = 'all' }) {
  const rows = useMemo(() => filterComplaints(data.complaints, filter), [data.complaints, filter]);

  return (
    <div className={`${prefix}-iq`}>
      <div className={`${prefix}-viz-stage-table-wrap ${prefix}-iq-case-table-wrap`}>
        <table className={`${prefix}-viz-stage-table ${prefix}-iq-case-table`}>
          <thead>
            <tr>
              <th className={`${prefix}-th`}>ID</th>
              <th className={`${prefix}-th`}>Issue</th>
              <th className={`${prefix}-th`}>Customer</th>
              <th className={`${prefix}-th`}>Region</th>
              <th className={`${prefix}-th`}>Channel</th>
              <th className={`${prefix}-th`}>Status</th>
              <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Age</th>
              <th className={`${prefix}-th`}>SLA</th>
              <th className={`${prefix}-th`}>Owner</th>
              <th className={`${prefix}-th ${prefix}-viz-stage-tbl-th-num`}>Resolved in</th>
              <th className={`${prefix}-th`}>Severity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={row.sla === 'Breached' ? `${prefix}-iq-case-row--hot` : undefined}
              >
                <td className={`${prefix}-td ${prefix}-iq-case-id`}>{row.id}</td>
                <td className={`${prefix}-td`}>
                  <span className={`${prefix}-viz-stage-tbl-stage-name`}>{row.issue}</span>
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-detail`}>{row.customer}</td>
                <td className={`${prefix}-td`}>{row.region}</td>
                <td className={`${prefix}-td`}>{row.channel}</td>
                <td className={`${prefix}-td`}>
                  <StatusChip prefix={prefix} status={row.status} />
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>{row.age}</td>
                <td className={`${prefix}-td`}>
                  <SlaChip prefix={prefix} sla={row.sla} />
                </td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-detail`}>{row.owner}</td>
                <td className={`${prefix}-td ${prefix}-viz-stage-tbl-td-num`}>
                  {row.resolutionTime === '—' ? (
                    <span className={`${prefix}-faint`}>—</span>
                  ) : (
                    row.resolutionTime
                  )}
                </td>
                <td className={`${prefix}-td`}>
                  <SevBadge prefix={prefix} severity={row.severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
