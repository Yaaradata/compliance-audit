'use client';

import React, { useMemo, useState } from 'react';
import {
  aggregateRES,
  getRiskDomain,
  getSeniorManager,
  openIssuesForRisk,
  openPreventiveActionCountForRisk,
  riskDomains,
  risks,
} from '../dataModel';
import { Chip, DimCell, EmptyState, SectionCard, Stat, TrendArrow } from '../primitives';
import { bandFromScore, oriFocusRing } from '../theme';
import type { OpenDrawer } from '../types';

const filterSelectClass = `w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 shadow-sm outline-none ring-offset-1 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 ${oriFocusRing}`;

export function RiskRegister({ openDrawer }: { openDrawer: OpenDrawer }) {
  const [domainFilter, setDomainFilter] = useState('');
  const [residualFilter, setResidualFilter] = useState('');
  const [trendFilter, setTrendFilter] = useState('');

  const clearFilters = () => {
    setDomainFilter('');
    setResidualFilter('');
    setTrendFilter('');
  };

  const hasListFilters = !!(domainFilter || residualFilter || trendFilter);

  const domainIds = useMemo(() => riskDomains.map((d) => d.domain_id).sort(), []);
  const residualOpts = ['low', 'medium', 'high'];
  const trendOpts = useMemo(() => Array.from(new Set(risks.map((r) => r.residual_rating_trend))).sort(), []);

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (domainFilter && r.domain_id !== domainFilter) return false;
      if (residualFilter && r.residual_rating !== residualFilter) return false;
      if (trendFilter && r.residual_rating_trend !== trendFilter) return false;
      return true;
    });
  }, [domainFilter, residualFilter, trendFilter]);

  const kpis = useMemo(() => {
    const total = risks.length;
    const high = risks.filter((r) => r.residual_rating === 'high').length;
    const det = risks.filter((r) => r.residual_rating_trend === 'deteriorating').length;
    const avg = aggregateRES();
    return { total, high, det, avg };
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat k="Total risks" v={kpis.total} tone="slate" />
        <Stat k="High residual" v={kpis.high} sub="residual_rating = high" tone="rose" />
        <Stat k="Deteriorating" v={kpis.det} sub="Residual trend" tone="amber" />
        <Stat k="Avg RES" v={kpis.avg} sub="Mean res_score across register" tone="indigo" />
      </div>

      <SectionCard
        title="Filters"
        actions={
          hasListFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear filters
            </button>
          ) : undefined
        }
      >
        <div className="flex flex-wrap items-end gap-2 sm:gap-3 xl:flex-nowrap">
          <label className="flex min-w-0 flex-1 basis-[10rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Domain</span>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by risk domain"
            >
              <option value="">All domains</option>
              {domainIds.map((id) => {
                const d = getRiskDomain(id);
                return (
                  <option key={id} value={id}>
                    {d?.title ?? id}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[6rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Residual</span>
            <select
              value={residualFilter}
              onChange={(e) => setResidualFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by residual rating"
            >
              <option value="">All residuals</option>
              {residualOpts.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-[8rem] flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Trend</span>
            <select
              value={trendFilter}
              onChange={(e) => setTrendFilter(e.target.value)}
              className={filterSelectClass}
              aria-label="Filter by residual trend"
            >
              <option value="">All trends</option>
              {trendOpts.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Risk register" subtitle="Enterprise risk universe · click row for detail drawer">
        {!filtered.length ? (
          <EmptyState
            message="No risks match these filters."
            hint="Try clearing filters to see the full register."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-2 py-2 text-left">ID</th>
                  <th className="px-2 py-2 text-left">Domain</th>
                  <th className="px-2 py-2 text-left">Title</th>
                  <th className="px-2 py-2 text-left">Inherent</th>
                  <th className="px-2 py-2 text-left">Residual</th>
                  <th className="px-2 py-2 text-left">Trend</th>
                  <th className="px-2 py-2 text-left">RES</th>
                  <th className="px-2 py-2 text-right">Controls</th>
                  <th className="px-2 py-2 text-right">KRIs</th>
                  <th className="px-2 py-2 text-right">Open issues</th>
                  <th className="px-2 py-2 text-right">Open POAs</th>
                  <th className="px-2 py-2 text-left">Accountable SM</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const dom = getRiskDomain(r.domain_id);
                  const sm = getSeniorManager(r.accountable_senior_manager_id);
                  const oi = openIssuesForRisk(r.risk_id);
                  const poa = openPreventiveActionCountForRisk(r.risk_id);
                  const resBand = bandFromScore(r.res_score);
                  return (
                    <tr
                      key={r.risk_id}
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                      onClick={() => openDrawer('risk', r.risk_id, 'riskRegister')}
                    >
                      <td className="px-2 py-2 font-mono text-[11px] text-slate-700">{r.risk_id}</td>
                      <td className="px-2 py-2 text-slate-600">{dom?.title ?? r.domain_id}</td>
                      <td className="max-w-[14rem] truncate px-2 py-2 font-medium text-slate-800" title={r.title}>
                        {r.title}
                      </td>
                      <td className="px-2 py-2">
                        <Chip label={r.inherent_rating} size="xs" tone="slate" />
                      </td>
                      <td className="px-2 py-2">
                        <Chip label={r.residual_rating} size="xs" tone={r.residual_rating === 'high' ? 'rose' : r.residual_rating === 'medium' ? 'amber' : 'emerald'} />
                      </td>
                      <td className="px-2 py-2">
                        <TrendArrow trend={r.residual_rating_trend} />
                      </td>
                      <td className="px-2 py-2">
                        <DimCell value={r.res_score} band={resBand} />
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-[11px] text-slate-700">{r.linked_control_ids?.length ?? 0}</td>
                      <td className="px-2 py-2 text-right font-mono text-[11px] text-slate-700">{r.kri_ids?.length ?? 0}</td>
                      <td className="px-2 py-2 text-right font-mono text-[11px] text-slate-700">{oi.length}</td>
                      <td className="px-2 py-2 text-right font-mono text-[11px] text-slate-700">{poa}</td>
                      <td className="px-2 py-2 text-slate-700">{sm?.name ?? r.accountable_senior_manager_id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
