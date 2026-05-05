'use client';

import React, { useState } from 'react';
import { personas } from './dataModel';
import { personaAccent } from './theme';

export type ScreenCode =
  | 'riskPosture'
  | 'whatChanged'
  | 'inspectionReadiness'
  | 'accountability'
  | 'obligationCoverage'
  | 'controlUniverse'
  | 'controlDrillDown'
  | 'aiInsights'
  | 'issueBoard'
  | 'sourceLineage'
  | 'evidenceWorkbench'
  | 'populationTesting'
  | 'workpaperAuditPackBuilder'
  | 'processHealth';

export type PersonaCode = 'cro' | 'compliance' | 'audit' | 'operations';

// Persona meta (concise dropdown labels, default landing screen)
export const PERSONA_META: Record<PersonaCode, { label: string; short: string; initials: string; description: string }> = {
  cro: {
    label: 'Chief Risk Officer',
    short: 'CRO',
    initials: 'CR',
    description: 'MD&CEO · BRMC Chair · risk-posture & inspection readiness',
  },
  compliance: {
    label: 'CCO / Head of ORM',
    short: 'CCO',
    initials: 'CC',
    description: 'MLRO–PO · Head of FC · Head of IT Risk · obligation coverage',
  },
  audit: {
    label: 'IA Manager',
    short: 'Audit',
    initials: 'IA',
    description: 'Concurrent Auditor · Control Tester · workpaper-grade evidence',
  },
  operations: {
    label: 'Operations / Process Owner',
    short: 'Ops',
    initials: 'OP',
    description: 'Process drift · BPO/branch handoffs · SLA breach',
  },
};

// Persona-scoped navigation per Pass 4 §3.2
// Each persona only sees the screens that answer their persona-questions.
type ScreenEntry = { code: ScreenCode; label: string; subtitle: string; icon: string };

const SCREEN: Record<ScreenCode, { label: string; subtitle: string; icon: string }> = {
  riskPosture: { label: 'Risk Posture', subtitle: 'S-01 · RES · ARS · CES', icon: '◆' },
  whatChanged: { label: 'What Changed', subtitle: 'S-02 · weekly deltas', icon: '⟳' },
  inspectionReadiness: { label: 'Inspection Readiness', subtitle: 'S-03 · RBI / PMLA / FIU', icon: '✓' },
  accountability: { label: 'Senior Accountability', subtitle: 'S-12 · SAES · attestations', icon: '★' },
  obligationCoverage: { label: 'Obligation Coverage', subtitle: 'S-04 · OCS · regulator lens', icon: '§' },
  controlUniverse: { label: 'Control Universe', subtitle: 'S-05 · RCM browser', icon: '⊞' },
  controlDrillDown: { label: 'Control Drill-Down', subtitle: 'S-06 · CES breakdown', icon: '⊙' },
  aiInsights: { label: 'AI Insights', subtitle: 'S-11 · HITL queue · AITES', icon: '✦' },
  issueBoard: { label: 'Issues & Remediation', subtitle: 'S-10 · root-cause clusters', icon: '⚠' },
  sourceLineage: { label: 'Source Lineage', subtitle: 'N-09 · DCQS · orphans', icon: '⎇' },
  evidenceWorkbench: { label: 'Evidence Workbench', subtitle: 'S-08 · EIFS · readiness', icon: '▤' },
  populationTesting: { label: 'Population Testing', subtitle: 'S-09 · reperformance', icon: '⚗' },
  workpaperAuditPackBuilder: { label: 'Workpapers / Audit Packs', subtitle: 'S-13 · ARS', icon: '▦' },
  processHealth: { label: 'Process Health', subtitle: 'S-07 · PVDS · drift', icon: '⇄' },
};

export const PERSONA_NAV: Record<PersonaCode, ScreenCode[]> = {
  // CRO — board-room lens: posture, weekly deltas, RBI walk-in, accountability + cross-cuts
  cro: ['riskPosture', 'whatChanged', 'inspectionReadiness', 'accountability', 'aiInsights', 'issueBoard'],
  // CCO — coverage lens: obligations, RCM, drill-down, HITL, lineage, issues
  compliance: ['obligationCoverage', 'controlUniverse', 'controlDrillDown', 'aiInsights', 'sourceLineage', 'issueBoard'],
  // IA — testing lens: population, evidence, workpapers, inspection, issues
  audit: ['populationTesting', 'evidenceWorkbench', 'workpaperAuditPackBuilder', 'inspectionReadiness', 'issueBoard'],
  // Ops — process lens: process health, source ingest, issues
  operations: ['processHealth', 'sourceLineage', 'issueBoard'],
};

export const PERSONA_DEFAULT_SCREEN: Record<PersonaCode, ScreenCode> = {
  cro: 'riskPosture',
  compliance: 'obligationCoverage',
  audit: 'populationTesting',
  operations: 'processHealth',
};

// ────────────────────────────────────────────────────────────────────────────
// PersonaSwitcher — TopBar dropdown ("Acting as ▾"), USBankingAudit pattern
// Panel anchored to the right edge of trigger + avatar so it sits flush under the control cluster.
// ────────────────────────────────────────────────────────────────────────────
const SWITCHER_PANEL_Z_BACKDROP = 'z-[100]';
const SWITCHER_PANEL_Z_MENU = 'z-[110]';

export function PersonaSwitcher({
  activePersona,
  setActivePersona,
}: {
  activePersona: PersonaCode;
  setActivePersona: (c: PersonaCode) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = PERSONA_META[activePersona];

  return (
    <div className="relative isolate inline-flex shrink-0 flex-nowrap items-center gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className="flex flex-shrink-0 items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-left text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25"
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">Acting as</span>
        <span className="max-w-[12rem] truncate sm:max-w-none">{meta.label}</span>
        <span className={`inline-block text-[10px] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>
          ▾
        </span>
      </button>
      <div
        className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white ring-1 ring-white/20 md:flex"
        aria-hidden
      >
        {meta.initials}
      </div>
      {open && (
        <>
          <div role="presentation" className={`fixed inset-0 bg-slate-900/20 ${SWITCHER_PANEL_Z_BACKDROP}`} onClick={() => setOpen(false)} />
          <div
            role="listbox"
            aria-label="Choose persona"
            className={`absolute right-0 top-full ${SWITCHER_PANEL_Z_MENU} mt-2 w-[min(20rem,calc(100vw-2.5rem))] max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200/90 bg-white text-slate-800 shadow-2xl ring-1 ring-slate-200/80`}
          >
            {(Object.keys(PERSONA_META) as PersonaCode[]).map((code) => {
              const m = PERSONA_META[code];
              const isActive = code === activePersona;
              return (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setActivePersona(code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 border-b border-slate-100 px-3 py-2.5 text-left transition-colors last:border-b-0 ${
                    isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-xs font-bold text-white ${personaAccent(
                      code
                    )}`}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{m.label}</span>
                      {isActive && <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700">active</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TopBar
// ────────────────────────────────────────────────────────────────────────────
export function TopBar({
  activePersona,
  setActivePersona,
  activeScreen,
}: {
  activePersona: PersonaCode;
  setActivePersona: (c: PersonaCode) => void;
  activeScreen: ScreenCode;
}) {
  const screenLabel = SCREEN[activeScreen]?.label || 'IndianBankingAudit';

  return (
    <header className={`relative z-40 overflow-visible bg-gradient-to-r ${personaAccent(activePersona)} text-white shadow-md`}>
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg font-bold">IB</div>
          <div>
            <div className="text-sm font-bold tracking-wide">IndianBankingAudit</div>
            <div className="text-[10px] uppercase tracking-wider text-white/70">
              AI-driven Risk · Compliance · Audit · Mid-sized Indian private sector bank
            </div>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-3">
          <span className="hidden truncate rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider md:inline">
            {screenLabel}
          </span>
          <PersonaSwitcher activePersona={activePersona} setActivePersona={setActivePersona} />
        </div>
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MainNavigation — persona-scoped sidebar
// ────────────────────────────────────────────────────────────────────────────
export function MainNavigation({
  activePersona,
  activeScreen,
  setActiveScreen,
}: {
  activePersona: PersonaCode;
  activeScreen: ScreenCode;
  setActiveScreen: (s: ScreenCode) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const meta = PERSONA_META[activePersona];
  const items: ScreenEntry[] = PERSONA_NAV[activePersona].map((code) => ({
    code,
    label: SCREEN[code].label,
    subtitle: SCREEN[code].subtitle,
    icon: SCREEN[code].icon,
  }));

  return (
    <nav
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className={`flex flex-shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
        isOpen ? 'w-60' : 'w-16'
      }`}
    >
      <div className={`border-b border-slate-100 bg-slate-50 ${isOpen ? 'px-4 py-3' : 'px-2 py-3'}`}>
        <div className={`flex items-center ${isOpen ? 'gap-2' : 'justify-center'}`}>
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-[11px] font-bold text-white ${personaAccent(
              activePersona
            )}`}
          >
            {meta.initials}
          </div>
          {isOpen && (
            <div className="min-w-0">
              <div className="truncate text-[12px] font-bold text-slate-800">{meta.label}</div>
              <div className="truncate text-[10px] text-slate-500">{meta.short} workspace</div>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto py-3 ${isOpen ? 'px-2' : 'px-1.5'}`}>
        {items.map((item) => {
          const isActive = activeScreen === item.code;
          return (
            <button
              key={item.code}
              type="button"
              title={!isOpen ? item.label : undefined}
              onClick={() => setActiveScreen(item.code)}
              className={`mb-0.5 flex w-full rounded-md px-2.5 py-2 text-xs transition-colors ${
                isOpen ? 'items-start gap-2.5 text-left' : 'items-center justify-center text-center'
              } ${
                isActive
                  ? 'bg-indigo-50 font-semibold text-indigo-800 ring-1 ring-indigo-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center text-base ${
                  isActive ? 'text-indigo-700' : 'text-slate-400'
                }`}
              >
                {item.icon}
              </span>
              {isOpen && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{item.label}</span>
                  <span className={`block truncate text-[10px] font-normal ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {item.subtitle}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className={`border-t border-slate-200 bg-slate-50 py-2.5 text-[9px] leading-relaxed text-slate-500 ${isOpen ? 'px-3' : 'px-1.5 text-center'}`}>
        {isOpen ? 'Evidence-first prototype · No production data · India-only RBI / PMLA / FIU-IND scope' : 'India-only'}
      </div>
    </nav>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// ScreenHeader / ScreenContainer
// ────────────────────────────────────────────────────────────────────────────
export function ScreenHeader({ title, subtitle, persona }: { title: string; subtitle?: string; persona: PersonaCode }) {
  void persona;
  return (
    <div className="mb-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function ScreenContainer({
  title,
  subtitle,
  persona,
  children,
}: {
  title: string;
  subtitle?: string;
  persona: PersonaCode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-5">
      <ScreenHeader title={title} subtitle={subtitle} persona={persona} />
      {children}
    </div>
  );
}

// keep `personas` import alive — used by IndianBankingAuditApp consumers; export
export { personas as personaMockRecords };
