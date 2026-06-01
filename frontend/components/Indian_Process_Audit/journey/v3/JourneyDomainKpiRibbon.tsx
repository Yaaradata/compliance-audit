'use client';

import type { DomainIntel, RccDomain } from '@/lib/Indian_Process_Audit/riskCommandCenter';
import { pct } from './journeyCommandCenterStyles';

function ComplianceRing({ value }: { value: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - value / 100);
  const col = value >= 95 ? '#16a34a' : value >= 85 ? '#d97706' : '#dc2626';
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#eef2f6" strokeWidth="9" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={col}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={off}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="38" textAnchor="middle" fontSize="19" fontWeight="700" fill="#0f172a">
        {value}
      </text>
      <text x="40" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fill="#94a3b8">
        %
      </text>
    </svg>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accentClass,
  valueClass,
}: {
  label: string;
  value: number;
  sub: string;
  accentClass: string;
  valueClass?: string;
}) {
  return (
    <div
      className={`min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 border-l-[3px] ${accentClass}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 text-[28px] font-bold leading-none tabular-nums ${valueClass ?? 'text-slate-900'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

const RESIDUAL_TONE: Record<string, string> = {
  bad: 'text-red-600',
  warn: 'text-amber-700',
  gap: 'text-amber-700',
  good: 'text-emerald-600',
};

export function JourneyDomainKpiRibbon({
  domain,
  intel,
}: {
  domain: RccDomain;
  intel?: DomainIntel;
}) {
  const compliancePct = pct(domain.completed, domain.total);
  const residual = intel?.residual;
  const regCount = intel?.regulatoryExposure.length ?? 0;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <div className="col-span-2 flex min-w-0 items-center gap-3.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 xl:col-span-1">
        <ComplianceRing value={compliancePct} />
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Compliance
          </div>
          <div className="mt-1 text-sm font-semibold tabular-nums text-slate-800">
            {domain.completed}/{domain.total} clean
          </div>
        </div>
      </div>
      {residual ? (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 border-l-[3px] border-l-slate-900">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Residual risk
          </div>
          <div
            className={`mt-1 text-[28px] font-bold leading-none tabular-nums ${
              RESIDUAL_TONE[residual.status] ?? 'text-slate-900'
            }`}
          >
            {residual.res}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {residual.trend === 'up' ? '▲' : residual.trend === 'down' ? '▼' : '▬'} vs inherent{' '}
            {residual.inherent}
          </div>
        </div>
      ) : null}
      <KpiCard
        label="Critical"
        value={domain.critical}
        sub="control failures — remediate"
        accentClass="border-l-red-600"
        valueClass="text-red-600"
      />
      <KpiCard
        label="Exceptions"
        value={domain.exception}
        sub="documented / waived"
        accentClass="border-l-amber-500"
        valueClass="text-amber-800"
      />
      <KpiCard
        label="In review"
        value={domain.review}
        sub="awaiting evidence"
        accentClass="border-l-blue-600"
        valueClass="text-blue-600"
      />
      <KpiCard
        label="Reg exposure"
        value={regCount}
        sub="reg-reportable cases"
        accentClass="border-l-amber-600"
        valueClass={regCount > 0 ? 'text-amber-700' : 'text-slate-900'}
      />
    </div>
  );
}
