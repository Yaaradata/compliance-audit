// @ts-nocheck
'use client';

import { useMemo, useState } from 'react';
import {
  personas,
  kris,
  risks,
  riskAppetiteMetrics,
} from '@/components/UKBankingAudit/ukTraceRuntime';
import { RISK_DOMAINS_V4 } from '@/lib/ukbankingaudit/v6/riskDomainsV6';
import type { BoardRole } from '@/lib/ukbankingaudit/v6/dispositions';
import { domainsWithAppetiteBreachNoPlan } from '@/lib/ukbankingaudit/v6/appetiteBreachNoPlan';
import { BoardRoleContext } from '@/components/UKBankingAudit/v6/boardRoleContext';
import { CategoryTileGrid } from '@/components/UKBankingAudit/v6/CategoryTileGrid';
import { AppetiteFrameworkPanel } from '@/components/UKBankingAudit/v6/erm';
import { ExposureConcentrationCard } from '@/components/UKBankingAudit/v6/ExposureLens';
import { EmptyState, StatusBadge } from './_shared';
import { v6RefKind } from '@/lib/ukbankingaudit/v6/refRouter';

export function HeadOfERMWorkspaceV6({ openDrawer }) {
  const persona = personas.find((p) => p.id === 'head_of_erm');
  const [expandedId, setExpandedId] = useState('fincrime');
  const [role, setRole] = useState<BoardRole>('second-line');
  const readOnly = role === 'internal-audit';

  const breachSignals = useMemo(() => domainsWithAppetiteBreachNoPlan(), []);
  const fincrimeDomain = RISK_DOMAINS_V4.find((d) => d.id === 'fincrime');

  const kriUniverse = useMemo(() => {
    return (kris || []).map((k) => {
      const risk = (risks || []).find((r) => r.id === k.riskId);
      return { ...k, riskName: risk?.name ?? k.riskId };
    });
  }, []);

  if (!persona) return <EmptyState message="Head of ERM persona not configured." />;

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <BoardRoleContext.Provider value={role}>
      <div className="space-y-6">
        <style>{`
          @keyframes ukV4SlideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .uk-v4-slide-down { animation: ukV4SlideDown 0.3s ease; }
          .uk-v4-slide-down-mid { animation: ukV4SlideDown 0.25s ease; }
          .uk-v4-slide-down-fast { animation: ukV4SlideDown 0.2s ease; }
        `}</style>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {persona.smfDesignation ?? 'Head of ERM'}
            </div>
            <h1 className="mt-0.5 text-2xl font-bold text-slate-900">{persona.label}</h1>
            <p className="mt-1 text-sm text-slate-600">{persona.subhead}</p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={readOnly}
              onChange={(e) => setRole(e.target.checked ? 'internal-audit' : 'second-line')}
              className="h-3.5 w-3.5"
            />
            Internal Audit (read-only)
          </label>
        </div>

        {readOnly ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-[12px] font-medium text-amber-800">
            Internal Audit is read-only. Third line assures controls it does not operate.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AppetiteFrameworkPanel
            onOpenEvidence={(ref) => openDrawer?.(v6RefKind(ref), ref, 'headOfERMWorkspace')}
          />
          {fincrimeDomain ? (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Exposure vs Appetite · Fraud &amp; Financial Crime
              </div>
              <ExposureConcentrationCard domain={fincrimeDomain} />
            </div>
          ) : null}
        </div>

        {breachSignals.length > 0 ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50/30 px-4 py-2 text-[11px] text-rose-800">
            {breachSignals.length} domain(s) with KRI outside appetite and stalled remediation — fincrime
            is the primary breach (KYC backlog 4,210 vs appetite &lt;1,000; alert closure 86% vs target
            &gt;=95%).
          </div>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <header className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              KRI universe
            </div>
            <h2 className="mt-0.5 text-base font-bold text-slate-900">
              {(riskAppetiteMetrics || []).length} appetite metrics · {kriUniverse.length} KRIs
            </h2>
          </header>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {kriUniverse.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => openDrawer?.('kri', k.id, 'headOfERMWorkspace')}
                className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-left hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900">{k.name}</div>
                    <div className="text-[10px] text-slate-500">{k.riskName}</div>
                  </div>
                  <StatusBadge tone={k.currentBand} label={k.currentBand.toUpperCase()} size="xs" />
                </div>
                <div className="mt-1 text-sm font-bold text-slate-800">
                  {k.current}
                  {k.unit ? ` ${k.unit}` : ''}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <header className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Nine-domain enterprise risk profile
            </div>
            <h2 className="mt-0.5 text-base font-bold text-slate-900">Category tiles &amp; drill</h2>
          </header>
          <CategoryTileGrid
            domains={RISK_DOMAINS_V4}
            expandedId={expandedId}
            onToggle={toggle}
          />
        </section>
      </div>
    </BoardRoleContext.Provider>
  );
}
