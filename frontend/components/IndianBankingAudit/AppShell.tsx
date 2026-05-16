'use client';

import React, { useState } from 'react';
import { personas } from './dataModel';
import { personaAccent } from './theme';

export type ScreenCode =
  | 'regulatoryIntelligence'
  | 'riskPosture'
  | 'whatChanged'
  | 'inspectionReadiness'
  | 'accountability'
  | 'lossData'
  | 'kriMonitoring'
  | 'incidentRegister'
  | 'rcaWorkspace'
  | 'rcsaWorkspace'
  | 'riskRegister'
  | 'obligationCoverage'
  | 'controlUniverse'
  | 'controlDrillDown'
  | 'aiInsights'
  | 'issueBoard'
  | 'sourceLineage'
  | 'evidenceWorkbench'
  | 'populationTesting'
  | 'workpaperAuditPackBuilder'
  | 'processHealth'
  | 'pacNoteApprovals';

export type PersonaCode = 'cro' | 'compliance' | 'audit';

// Three primary personas per UI Pass 1 (PERSONA-001/002/003). ORI Pass 6a: display
// labels follow ORI_SPEC; internal `code` keys stay cro | compliance | audit.
export const PERSONA_META: Record<PersonaCode, { label: string; short: string; initials: string; description: string }> = {
  cro: {
    label: 'CRO / MD&CEO',
    short: 'CRO',
    initials: 'CR',
    description: 'Apex risk owner · BRMC Chair',
  },
  compliance: {
    label: 'Head of ORM / CCO / MLRO-PO',
    short: 'ORM',
    initials: 'OR',
    description: 'Head of FC · Head of IT Risk · 2LoD coverage & assurance',
  },
  audit: {
    label: 'VP-ORM / Control Tester',
    short: 'VP-ORM',
    initials: 'VP',
    description: 'Independent assurance · control testing · reperformance',
  },
};

// Persona-scoped navigation per Pass 4 §3.2
// Each persona only sees the screens that answer their persona-questions.
type ScreenEntry = { code: ScreenCode; label: string; subtitle: string; icon: string };

export const SCREEN: Record<ScreenCode, { label: string; subtitle: string; icon: string }> = {
  regulatoryIntelligence: {
    label: 'Reg Intelligence',
    subtitle: 'Regulatory inbox · RBI / FIU / CERT-In / NPCI ingest',
    icon: '✉',
  },
  riskPosture: { label: 'Executive Risk Posture Cockpit', subtitle: 'S-01 · RES · supervisory readiness (ARS) · CES', icon: '◆' },
  whatChanged: { label: 'What changed this week', subtitle: 'S-02 · weekly deltas', icon: '⟳' },
  inspectionReadiness: { label: 'Supervisory readiness pack', subtitle: 'S-03 · RBI AFI / PMLA / FIU', icon: '✓' },
  accountability: { label: 'Senior accountability ledger', subtitle: 'S-12 · SAES · attestations', icon: '★' },
  lossData: { label: 'Loss data register', subtitle: 'S-19 · Basel LDC · FY26 view', icon: '▣' },
  kriMonitoring: { label: 'KRI monitoring', subtitle: 'S-20 · thresholds · 12w trend', icon: '⌈' },
  incidentRegister: { label: 'Incidents & Near-Miss', subtitle: 'S-16 · ORI register · RCA links', icon: '◈' },
  rcaWorkspace: { label: 'RCA & Preventive Actions', subtitle: 'S-17 · 5-Whys · PA tracker · PAC', icon: '⌁' },
  rcsaWorkspace: { label: 'RCSA workspace', subtitle: 'S-14 · cycles · cells · attestations', icon: '▤' },
  riskRegister: { label: 'Risk register', subtitle: 'S-15 · enterprise risk universe', icon: '◉' },
  obligationCoverage: { label: 'Obligation coverage map', subtitle: 'S-04 · OCS · regulator lens', icon: '§' },
  controlUniverse: { label: 'Control universe', subtitle: 'S-05 · RCM browser', icon: '⊞' },
  controlDrillDown: { label: 'Control drill-down', subtitle: 'S-06 · CES breakdown', icon: '⊙' },
  aiInsights: { label: 'AI / predictive signals', subtitle: 'S-11 · HITL queue · AITES', icon: '✦' },
  issueBoard: { label: 'Issues & remediation', subtitle: 'S-10 · root-cause clusters', icon: '⚠' },
  sourceLineage: { label: 'Source lineage', subtitle: 'N-09 · DCQS · orphans', icon: '⎇' },
  evidenceWorkbench: { label: 'Evidence workbench', subtitle: 'S-08 · EIFS · readiness', icon: '▤' },
  populationTesting: { label: 'Control Testing', subtitle: 'S-09 · population / reperformance', icon: '⚗' },
  workpaperAuditPackBuilder: { label: 'Inspection Pack Builder', subtitle: 'S-13 · supervisory readiness (ARS)', icon: '▦' },
  pacNoteApprovals: { label: 'PAC Note Approvals', subtitle: 'S-18 · ORM queue · PA blockers', icon: '✎' },
  processHealth: { label: 'Process health', subtitle: 'S-07 · PVDS · drift', icon: '⇄' },
};

export const PERSONA_NAV: Record<PersonaCode, ScreenCode[]> = {
  // CRO — board-room lens: posture, weekly deltas, RBI walk-in, accountability + cross-cuts
  cro: ['riskPosture', 'whatChanged', 'inspectionReadiness', 'accountability', 'lossData', 'kriMonitoring', 'incidentRegister', 'aiInsights', 'issueBoard'],
  // CCO — coverage lens: obligations, RCM, drill-down, process drift, HITL, lineage, issues
  compliance: [
    'regulatoryIntelligence',
    'incidentRegister',
    'rcaWorkspace',
    'rcsaWorkspace',
    'riskRegister',
    'kriMonitoring',
    'obligationCoverage',
    'controlUniverse',
    'controlDrillDown',
    'processHealth',
    'aiInsights',
    'pacNoteApprovals',
    'sourceLineage',
    'issueBoard',
  ],
  // VP-ORM — lean testing & evidence lens (ORI integration stage)
  audit: [
    'populationTesting',
    'evidenceWorkbench',
    'controlUniverse',
    'workpaperAuditPackBuilder',
    'inspectionReadiness',
    'issueBoard',
  ],
};

export const PERSONA_DEFAULT_SCREEN: Record<PersonaCode, ScreenCode> = {
  cro: 'riskPosture',
  compliance: 'rcsaWorkspace',
  audit: 'populationTesting',
};

/** User-facing screen straplines (functional copy — not spec IDs). */
export const SCREEN_FUNCTIONAL_SUBTITLE: Record<ScreenCode, string> = {
  regulatoryIntelligence:
    'Structured RBI / FIU / CERT-In / MoF / NPCI ingest with CCO-first workflow, obligation HITL, and AI narrative with citations.',
  riskPosture: 'Residual posture, control health, and inspection readiness in one executive view.',
  whatChanged: 'Week-on-week deltas across issues, KRIs, controls, reporting, and AI signals.',
  inspectionReadiness: 'Supervisory pack status, ARS by lens, and RBI / PMLA / FIU evidence posture.',
  accountability: 'Decisions, attestations, and evidence trails by senior manager.',
  lossData: 'Basel LDC-style loss rows — gross, recovery, net, and linkage to risks and incidents.',
  kriMonitoring: 'Threshold breaches, 12-week trends, and drill-down to linked risks and controls.',
  incidentRegister: 'ORI incident register — severity, Basel type, RCA link, and accountable owner.',
  rcaWorkspace: '5-Whys / methodology, preventive actions, PAC blockers, and approval queue.',
  rcsaWorkspace: 'RCSA cycles across business units — refresh status, residual moves, and blocking actions.',
  riskRegister: 'Enterprise risk universe — inherent and residual ratings, RES, and open issues.',
  obligationCoverage: 'Obligation coverage, linked controls, and regulatory lens gaps.',
  controlUniverse: 'RCM-style control browser — CES, obligations, and population testability.',
  controlDrillDown: 'Single-control CES breakdown, instances, and evidence quality.',
  aiInsights: 'Human-in-the-loop queue for model-backed signals and linked issues.',
  issueBoard: 'Open issues, remediation status, and RBI MRA / Section 47A flags.',
  sourceLineage: 'Source-to-evidence correlation health, orphans, and DCQS.',
  evidenceWorkbench: 'Evidence freshness, hash integrity, and inspection readiness.',
  populationTesting: 'Population extracts, test outcomes, and reperformance evidence.',
  workpaperAuditPackBuilder: 'Workpapers and indices for supervisory readiness packs.',
  processHealth: 'Process variants, PVDS drift, and linked controls.',
  pacNoteApprovals: 'ORM queue for PAC notes — blocking preventive actions and RCA references.',
};

/** ORI Pass 6a — sidebar sectioning (§2.4 screen sets; section order A–D per reframe brief). */
const ORI_NAV_SECTIONS: { id: string; label: string; codes: ScreenCode[] }[] = [
  { id: 'posture', label: 'Posture', codes: ['riskPosture', 'whatChanged'] },
  {
    id: 'riskControl',
    label: 'Risk & Control Workspace',
    codes: ['rcsaWorkspace', 'riskRegister', 'kriMonitoring', 'obligationCoverage', 'controlUniverse', 'controlDrillDown', 'sourceLineage', 'processHealth'],
  },
  { id: 'incidents', label: 'Incidents, RCA & KRI', codes: ['incidentRegister', 'rcaWorkspace', 'issueBoard', 'accountability', 'lossData'] },
  {
    id: 'regulatory',
    label: 'Regulatory & Inspection',
    codes: [
      'regulatoryIntelligence',
      'populationTesting',
      'evidenceWorkbench',
      'pacNoteApprovals',
      'workpaperAuditPackBuilder',
      'inspectionReadiness',
      'aiInsights',
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// PersonaSwitcher — TopBar dropdown ("Acting as ▾"), USBankingAudit pattern
// Panel anchored to the right edge of trigger + avatar so it sits flush under the control cluster.
// ────────────────────────────────────────────────────────────────────────────
const SWITCHER_PANEL_Z_BACKDROP = 'z-[100]';
const SWITCHER_PANEL_Z_MENU = 'z-[110]';

export function PersonaSwitcher({
  activePersona,
  setActivePersona,
  disabled,
}: {
  activePersona: PersonaCode;
  setActivePersona: (c: PersonaCode) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const meta = PERSONA_META[activePersona];

  return (
    <div className="relative isolate inline-flex shrink-0 flex-nowrap items-center gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        title={disabled ? 'Finish or exit guided demo to switch persona' : undefined}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex flex-shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs font-semibold text-white ring-1 ring-white/20 ${
          disabled ? 'cursor-not-allowed bg-white/5 opacity-50' : 'bg-white/15 hover:bg-white/25'
        }`}
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
              const defaultScreen = SCREEN[PERSONA_DEFAULT_SCREEN[code]]?.label;
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
                  className={`flex w-full items-start gap-3 border-b border-slate-100 px-3 py-3 text-left transition-colors last:border-b-0 ${
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
                      <span className="truncate text-sm font-semibold text-slate-900">{m.label}</span>
                      {isActive && (
                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700">
                          active
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-slate-500">
                      Default screen: {defaultScreen}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-400">{m.description}</div>
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
  demoMode,
  onStartGuidedDemo,
}: {
  activePersona: PersonaCode;
  setActivePersona: (c: PersonaCode) => void;
  activeScreen: ScreenCode;
  demoMode?: boolean;
  onStartGuidedDemo?: () => void;
}) {
  const screenLabel = SCREEN[activeScreen]?.label || 'Indian Banking Audit';

  return (
    <header className={`relative z-40 overflow-visible bg-gradient-to-r ${personaAccent(activePersona)} text-white shadow-md`}>
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-[10px] font-bold leading-tight tracking-tight">
            IBA
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide">Indian Banking Audit</div>
            <div className="max-w-xl text-[10px] uppercase tracking-wider text-white/80">
              Indian banking — RCSA · control testing · incidents & RCA · KRI · regulatory readiness
            </div>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-3">
          <span className="hidden truncate rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider md:inline">
            {screenLabel}
          </span>
          {onStartGuidedDemo && !demoMode ? (
            <button
              type="button"
              onClick={onStartGuidedDemo}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1.5 text-left text-[11px] font-semibold text-white ring-1 ring-white/25 hover:bg-white/25"
              aria-label="Run guided demo"
            >
              <span className="truncate">▶ Run guided demo</span>
            </button>
          ) : null}
          {demoMode ? (
            <span className="rounded-md bg-amber-400/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Demo on
            </span>
          ) : null}
          <PersonaSwitcher activePersona={activePersona} setActivePersona={setActivePersona} disabled={demoMode} />
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
  demoMode,
}: {
  activePersona: PersonaCode;
  activeScreen: ScreenCode;
  setActiveScreen: (s: ScreenCode) => void;
  demoMode?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const meta = PERSONA_META[activePersona];
  const personaOrder = PERSONA_NAV[activePersona];
  const orderIndex = (code: ScreenCode) => {
    const i = personaOrder.indexOf(code);
    return i === -1 ? 999 : i;
  };

  const sectionBlocks = ORI_NAV_SECTIONS.map((section) => {
    const entries = section.codes
      .filter((code) => personaOrder.includes(code))
      .sort((a, b) => orderIndex(a) - orderIndex(b))
      .map((code) => ({
        code,
        label: SCREEN[code].label,
        subtitle: SCREEN_FUNCTIONAL_SUBTITLE[code],
        icon: SCREEN[code].icon,
      }));
    return { ...section, entries };
  }).filter((b) => b.entries.length > 0);

  return (
    <nav
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      aria-disabled={demoMode || undefined}
      className={`flex flex-shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
        isOpen ? 'w-60' : 'w-16'
      } ${demoMode ? 'pointer-events-none opacity-40' : ''}`}
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
        {sectionBlocks.map((block) => (
          <div key={block.id} className="mb-3 last:mb-0">
            {isOpen && (
              <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{block.label}</div>
            )}
            {block.entries.map((item) => {
              const isActive = activeScreen === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  title={!isOpen ? `${block.label}: ${item.label}` : undefined}
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
                      <span
                        className={`block truncate text-[10px] font-normal ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                      >
                        {item.subtitle}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
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
        <h1 className="text-lg font-bold leading-snug text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-xs font-normal leading-relaxed text-slate-700">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Horizontal inset for all screens: small gutter from viewport, aligned header + body. */
const SCREEN_SHELL = 'w-full min-w-0 py-5 px-4 sm:px-5';

export function ScreenContainer({
  title,
  subtitle,
  persona,
  children,
  layout = 'default',
}: {
  title: string;
  subtitle?: string;
  persona: PersonaCode;
  /** `splitFill`: header + body fill viewport height for split list/detail panes. `default`: full-width scroll page. */
  layout?: 'default' | 'splitFill';
  children: React.ReactNode;
}) {
  if (layout === 'splitFill') {
    return (
      <div className={`flex min-h-0 flex-1 flex-col ${SCREEN_SHELL}`}>
        <div className="shrink-0">
          <ScreenHeader title={title} subtitle={subtitle} persona={persona} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className={SCREEN_SHELL}>
      <ScreenHeader title={title} subtitle={subtitle} persona={persona} />
      {children}
    </div>
  );
}

// keep `personas` import alive — used by IndianBankingAuditApp consumers; export
export { personas as personaMockRecords };
