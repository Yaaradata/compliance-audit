'use client';

import type { PersonaCode, ScreenCode } from '../AppShell';
import { SCREEN } from '../AppShell';
import { homeScreenForPersona, isPersonaHomeScreen } from './personaNavigation';

export type OriBreadcrumbCrumb = {
  label: string;
  screen?: ScreenCode;
};

export function OriBreadcrumb({
  activePersona,
  activeScreen,
  setActiveScreen,
  crumbs = [],
}: {
  activePersona: PersonaCode;
  activeScreen: ScreenCode;
  setActiveScreen: (s: ScreenCode) => void;
  crumbs?: OriBreadcrumbCrumb[];
}) {
  const homeScreen = homeScreenForPersona(activePersona);
  if (isPersonaHomeScreen(activePersona, activeScreen) && crumbs.length === 0) return null;

  const linkClass = 'font-semibold text-indigo-700 hover:text-indigo-900 hover:underline';

  return (
    <nav aria-label="Breadcrumb" className="shrink-0 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <button type="button" className={linkClass} onClick={() => setActiveScreen(homeScreen)}>
            Home
          </button>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
            <span className="text-slate-300" aria-hidden>
              ›
            </span>
            {crumb.screen ? (
              <button type="button" className={linkClass} onClick={() => setActiveScreen(crumb.screen!)}>
                {crumb.label}
              </button>
            ) : (
              <span className="font-medium text-slate-900">{crumb.label}</span>
            )}
          </li>
        ))}
        {crumbs.length === 0 ? (
          <li className="flex items-center gap-1">
            <span className="text-slate-300" aria-hidden>
              ›
            </span>
            <span className="font-medium text-slate-900">{SCREEN[activeScreen]?.label ?? activeScreen}</span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
