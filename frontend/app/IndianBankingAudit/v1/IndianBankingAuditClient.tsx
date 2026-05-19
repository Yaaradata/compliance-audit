'use client';

import IndianBankingAuditApp from '@/components/IndianBankingAudit/IndianBankingAuditApp';
import {
  PERSONA_DEFAULT_SCREEN,
  PERSONA_NAV,
  SCREEN,
  type PersonaCode,
  type ScreenCode,
} from '@/components/IndianBankingAudit/AppShell';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const PERSONA_ORDER: PersonaCode[] = ['cro', 'compliance', 'audit'];

function isScreenCode(s: string | null): s is ScreenCode {
  return !!s && Object.prototype.hasOwnProperty.call(SCREEN, s);
}

function isPersonaCode(s: string | null): s is PersonaCode {
  return s === 'cro' || s === 'compliance' || s === 'audit';
}

/** Resolve `?screen=` / `?persona=` into initial ORI shell state. */
function resolveOriSearchParams(sp: URLSearchParams): {
  initialPersona: PersonaCode;
  initialScreen: ScreenCode;
} | null {
  const rawScreen = sp.get('screen');
  const rawPersona = sp.get('persona');

  if (isScreenCode(rawScreen)) {
    const screen = rawScreen;
    if (isPersonaCode(rawPersona) && PERSONA_NAV[rawPersona].includes(screen)) {
      return { initialPersona: rawPersona, initialScreen: screen };
    }
    const persona = PERSONA_ORDER.find((p) => PERSONA_NAV[p].includes(screen));
    if (persona) {
      return { initialPersona: persona, initialScreen: screen };
    }
    return null;
  }

  if (isPersonaCode(rawPersona)) {
    return {
      initialPersona: rawPersona,
      initialScreen: PERSONA_DEFAULT_SCREEN[rawPersona],
    };
  }

  return null;
}

/**
 * Reads `?screen=` and `?persona=` so deep links (e.g. from Coming soon placeholders)
 * open the correct ORI persona + screen. `key` forces remount when the query string changes.
 */
export default function IndianBankingAuditClient() {
  const sp = useSearchParams();
  const resolved = useMemo(() => resolveOriSearchParams(sp), [sp]);
  const key = sp.toString() || 'default';

  if (!resolved) {
    return <IndianBankingAuditApp key="default" />;
  }

  return (
    <IndianBankingAuditApp key={key} initialPersona={resolved.initialPersona} initialScreen={resolved.initialScreen} />
  );
}
